import re
import qrcode
import os
import base64
import io
from PIL import Image
from qrcode.image.svg import SvgPathImage
from pydantic import BaseModel
from fastapi import FastAPI, Depends, Request, HTTPException, Form
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse, Response, JSONResponse

# qrcode cambió el nombre de la constante entre versiones (ERROR_CORRECT_H -> ERROR_CORRECTION_H).
# Nos adaptamos a la que exista para no romper en distintas versiones/pinned de la librería.
try:
    QR_ERROR_CORRECTION_H = qrcode.constants.ERROR_CORRECTION_H
except AttributeError:
    QR_ERROR_CORRECTION_H = qrcode.constants.ERROR_CORRECT_H
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

# --- CONFIGURACIÓN DE BASE DE DATOS (POSTGRES O SQLITE) ---
# Railway nos da la URL en una variable llamada DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Si la URL empieza con 'postgres://', SQLAlchemy pide que sea 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Si no hay DATABASE_URL (estás en tu PC / Dokploy sin Postgres), usa SQLite
# en /app/data para poder montar un volumen en ese directorio (un archivo suelto
# no se puede montar como volumen en Docker).
if not DATABASE_URL:
    os.makedirs("data", exist_ok=True)
    DATABASE_URL = "sqlite:///data/qr_manager.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELOS (Iguales que antes) ---
class Link(Base):
    __tablename__ = "links"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    target_url = Column(String)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_agent = Column(String)
    ip_address = Column(String)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- AUTENTICACIÓN (admin simple, cookie firmada HMAC, sin deps extra) ---
import hmac as _hmac
import hashlib as _hashlib
import secrets as _secrets
from typing import Optional

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD")
if not ADMIN_PASS:
    ADMIN_PASS = _secrets.token_hex(8)
    print(f"[AUTH] ADMIN_PASSWORD no configurado -> Usuario='{ADMIN_USER}' Password temporal='{ADMIN_PASS}'")
SESSION_SECRET = os.getenv("SESSION_SECRET") or _secrets.token_hex(32)
SECURE_COOKIES = os.getenv("SECURE_COOKIES") == "1"


def _sign(data: str) -> str:
    sig = _hmac.new(SESSION_SECRET.encode(), data.encode(), _hashlib.sha256).hexdigest()
    return f"{data}.{sig}"


def _verify(token: Optional[str]) -> bool:
    if not token or "." not in token:
        return False
    data, sig = token.rsplit(".", 1)
    expected = _hmac.new(SESSION_SECRET.encode(), data.encode(), _hashlib.sha256).hexdigest()
    return _hmac.compare_digest(expected, sig) and data == ADMIN_USER


def require_page(request: Request) -> Optional[Response]:
    if not _verify(request.cookies.get("session")):
        return RedirectResponse("/login", 303)
    return None


def require_api(request: Request):
    if not _verify(request.cookies.get("session")):
        raise HTTPException(status_code=401, detail="No autenticado")


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- RUTAS ---

@app.post("/create/{slug}")
def create_qr(slug: str, target_url: str, request: Request, db: Session = Depends(get_db), _: Optional[Response] = Depends(require_api)):
    db_link = Link(slug=slug, target_url=target_url)
    db.add(db_link)
    try:
        db.commit()
    except:
        raise HTTPException(status_code=400, detail="Ese nombre (slug) ya existe.")
    
    # URL automática para el QR
    base_url = str(request.base_url).rstrip('/')
    qr_content = f"{base_url}/r/{slug}"
    
    if not os.path.exists("qrs"): os.makedirs("qrs")
    img = qrcode.make(qr_content)
    img.save(f"qrs/{slug}.png")
    
    return {"status": "QR Dinámico Creado", "url_rastreo": qr_content}

@app.get("/r/{slug}")
def redirect_and_track(slug: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link: raise HTTPException(status_code=404, detail="QR no encontrado")

    # Guardar métricas en Postgres
    new_scan = Scan(
        link_id=link.id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host
    )
    db.add(new_scan)
    db.commit()

    target = link.target_url or ""
    # URL/WhatsApp: redirección directa (tracking transparente).
    if target.startswith("http://") or target.startswith("https://"):
        return RedirectResponse(url=target)

    # WiFi / Texto / otros: no se puede redirigir, mostramos la info
    # (el escaneo ya quedó registrado arriba).
    safe_target = (target or "").replace("<", "&lt;").replace(">", "&gt;")
    html = f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QR</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#0f172a;color:#e2e8f0">
<div style="max-width:480px;text-align:center;padding:24px">
<h2>Código QR escaneado</h2>
<p style="word-break:break-all;background:#1e293b;padding:16px;border-radius:12px">{safe_target}</p>
<p style="color:#94a3b8;font-size:14px">Este escaneo fue registrado.</p>
</div></body></html>"""
    return HTMLResponse(content=html)

@app.get("/stats/{slug}")
def get_stats(slug: str, db: Session = Depends(get_db), _: Optional[Response] = Depends(require_api)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link: raise HTTPException(status_code=404)
    scans = db.query(Scan).filter(Scan.link_id == link.id).all()
    
    return {
        "slug": slug,
        "total_escaneos": len(scans),
        "clicks": [{"fecha": s.timestamp, "navegador": s.user_agent} for s in scans]
    }

@app.get("/download/{slug}")
def download_qr(slug: str):
    path = f"qrs/{slug}.png"
    if os.path.exists(path): return FileResponse(path)
    return {"error": "Archivo no encontrado. ¿Ya creaste el QR?"}

@app.get("/health")
def health():
    return {"status": "ok"}

# --- FRONTEND (HTML sin build, mismo proceso) ---

HTML_HEAD = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QR Tracker</title>
<style>
  :root { --bg:#0f172a; --card:#1e293b; --accent:#38bdf8; --text:#e2e8f0; --muted:#94a3b8; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, -apple-system, sans-serif; background:var(--bg); color:var(--text); }
  header { padding:14px 24px; background:var(--card); display:flex; gap:20px; align-items:center; }
  header a { color:var(--accent); text-decoration:none; font-weight:600; }
  header a.act { text-decoration:underline; }
  main { max-width:720px; margin:32px auto; padding:0 16px; }
  .card { background:var(--card); border-radius:12px; padding:24px; margin-bottom:24px; }
  h1 { margin-top:0; font-size:22px; }
  label { display:block; margin:14px 0 4px; color:var(--muted); font-size:14px; }
  input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:var(--text); }
  button { margin-top:16px; padding:10px 18px; border:none; border-radius:8px; background:var(--accent); color:#0f172a; font-weight:700; cursor:pointer; }
  .result { margin-top:20px; }
  img.qr { width:240px; height:240px; background:#fff; border-radius:8px; padding:8px; }
  .muted { color:var(--muted); font-size:14px; }
  a { color:var(--accent); }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th, td { text-align:left; padding:8px; border-bottom:1px solid #334155; font-size:14px; }
  .code { background:#0f172a; padding:4px 8px; border-radius:6px; font-family:monospace; word-break:break-all; }
  .err { color:#f87171; }
</style>
</head>
<body>
  <header>
    <a href="/" id="nav-gen">Generar QR</a>
    <a href="/dashboard" id="nav-dash">Dashboard</a>
    <a href="/logout" style="margin-left:auto">Salir</a>
  </header>
<main>
"""

HTML_FOOT = "</main></body></html>"

LOGIN_PAGE = """
<div class="card" style="max-width:400px;">
  <h1>Acceso</h1>
  <p class="muted">Ingresá tus credenciales de administrador.</p>
  <form method="post" action="/login">
    <label>Usuario</label>
    <input name="username" autocomplete="username">
    <label>Contraseña</label>
    <input name="password" type="password" autocomplete="current-password">
    <button type="submit">Entrar</button>
  </form>
</div>
"""


def _page(content: str, active: str = "") -> str:
    nav = f'<script>document.getElementById("{active}").classList.add("act");</script>' if active else ""
    return HTML_HEAD + content + nav + HTML_FOOT


GEN_PAGE = """
<div class="card">
  <h1>Generar QR dinámico</h1>
  <p class="muted">Crea un QR que redirige y registra cada escaneo.</p>
  <label>Slug (identificador corto, sin espacios)</label>
  <input id="slug" placeholder="mi-evento">
  <label>URL de destino</label>
  <input id="url" placeholder="https://example.com">
  <button onclick="crear()">Generar QR</button>
  <div class="result" id="result"></div>
</div>
<script>
async function crear(){
  const slug = document.getElementById('slug').value.trim();
  const url = document.getElementById('url').value.trim();
  const r = document.getElementById('result');
  if(!slug || !url){ r.innerHTML = '<p class="err">Completa slug y URL.</p>'; return; }
  r.innerHTML = '<p class="muted">Generando...</p>';
  try {
    const res = await fetch(`/create/${encodeURIComponent(slug)}?target_url=${encodeURIComponent(url)}`, {method:'POST'});
    if(!res.ok){ const e = await res.json(); r.innerHTML = `<p class="err">${e.detail || 'Error'}</p>`; return; }
    const data = await res.json();
    r.innerHTML = `
      <img class="qr" src="/download/${slug}">
      <p><b>URL de rastreo:</b> <span class="code">${data.url_rastreo}</span></p>
      <p><a href="/r/${slug}" target="_blank">Abrir /r/${slug}</a> &middot; <a href="/download/${slug}" download>Descargar PNG</a></p>`;
  } catch(e){ r.innerHTML = '<p class="err">Fallo la conexión con el servidor.</p>'; }
}
</script>
"""


DASH_PAGE = """
<div class="card">
  <h1>Dashboard de traqueo</h1>
  <label>Slug</label>
  <input id="slug" placeholder="mi-evento">
  <button onclick="cargar()">Ver estadísticas</button>
  <div class="result" id="result"></div>
</div>
<script>
async function cargar(){
  const slug = document.getElementById('slug').value.trim();
  const r = document.getElementById('result');
  if(!slug){ r.innerHTML = '<p class="err">Ingresa un slug.</p>'; return; }
  r.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    const res = await fetch(`/stats/${encodeURIComponent(slug)}`);
    if(!res.ok){ r.innerHTML = '<p class="err">QR no encontrado.</p>'; return; }
    const d = await res.json();
    const rows = (d.clicks || []).map(c =>
      `<tr><td>${new Date(c.fecha).toLocaleString()}</td><td>${c.navegador || ''}</td></tr>`).join('');
    r.innerHTML = `<p><b>Total de escaneos:</b> ${d.total_escaneos}</p>
      <table><thead><tr><th>Fecha</th><th>Navegador</th></tr></thead><tbody>${rows}</tbody></table>
      <button onclick="cargar()">Recargar</button>`;
  } catch(e){ r.innerHTML = '<p class="err">Fallo la conexión con el servidor.</p>'; }
}
</script>
"""


@app.get("/", response_class=HTMLResponse)
def genera_page():
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return HTMLResponse(content=_page(GEN_PAGE, "nav-gen"))


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard_page():
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return HTMLResponse(content=_page(DASH_PAGE, "nav-dash"))


@app.get("/login", response_class=HTMLResponse)
def login_page():
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return HTMLResponse(content=_page(LOGIN_PAGE))


@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if not (_hmac.compare_digest(username, ADMIN_USER) and _hmac.compare_digest(password, ADMIN_PASS)):
        return RedirectResponse("/login?error=1", 303)
    resp = RedirectResponse("/", 303)
    resp.set_cookie("session", _sign(ADMIN_USER), httponly=True, samesite="lax", secure=SECURE_COOKIES)
    return resp


@app.get("/logout")
def logout():
    resp = RedirectResponse("/login", 303)
    resp.delete_cookie("session")
    return resp


# --- API PÚBLICA: genera QR por string (URL / WhatsApp / WiFi / Texto) ---
# Contrato compatible con el frontend React (Frontend/src/services/qrService.ts):
#   POST /api/generate-qr  { url, size, logo?, format?, color? }
#   -> { qrCode: "data:...;base64,...", size }

class QRGenerateRequest(BaseModel):
    url: str
    size: int = 500
    logo: str | None = None
    format: str = "png"
    color: str = "#000000"


def _embed_logo(qr_img: Image.Image, logo_data_uri: str, size: int) -> Image.Image:
    header, b64 = logo_data_uri.split(",", 1)
    logo = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGBA")
    max_logo = int(size * 0.25)
    logo.thumbnail((max_logo, max_logo), Image.LANCZOS)
    pad = int(size * 0.02)
    bg = Image.new("RGBA", (logo.width + pad * 2, logo.height + pad * 2), (255, 255, 255, 255))
    bg.paste(logo, (pad, pad), logo)
    canvas = qr_img.convert("RGBA")
    canvas.paste(bg, ((size - bg.width) // 2, (size - bg.height) // 2))
    return canvas.convert("RGB")


def _make_qr_png(content: str, size: int, color: str, logo: str | None) -> bytes:
    qr = qrcode.QRCode(
        error_correction=QR_ERROR_CORRECTION_H,
        box_size=10,
        border=4,
    )
    qr.add_data(content)
    qr.make(fit=True)
    img = qr.make_image(fill_color=color or "#000000", back_color="white").convert("RGB").resize((size, size))
    if logo:
        try:
            img = _embed_logo(img, logo, size)
        except Exception:
            pass  # si el logo falla, devolvemos el QR sin logo
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@app.post("/api/generate-qr")
def generate_qr(data: QRGenerateRequest):
    if not data.url or not data.url.strip():
        raise HTTPException(status_code=400, detail="URL es requerida")

    fmt = (data.format or "png").lower()
    size = max(200, min(2000, int(data.size or 500)))
    fill = data.color or "#000000"

    if fmt == "svg":
        qr = qrcode.QRCode(
            error_correction=QR_ERROR_CORRECTION_H,
            box_size=10,
            border=4,
        )
        qr.add_data(data.url)
        qr.make(fit=True)
        svg = qr.make_image(image_factory=SvgPathImage, fill_color=fill, back_color="white")
        raw = svg.to_string()
        return {"qrCode": "data:image/svg+xml;base64," + base64.b64encode(raw).decode(), "size": size}

    png = _make_qr_png(data.url, size, fill, data.logo)
    if fmt in ("jpg", "jpeg"):
        rgb = Image.open(io.BytesIO(png)).convert("RGB")
        buf = io.BytesIO()
        rgb.save(buf, format="JPEG", quality=90)
        mime = "image/jpeg"
        raw = buf.getvalue()
    else:
        mime = "image/png"
        raw = png

    return {"qrCode": f"data:{mime};base64," + base64.b64encode(raw).decode(), "size": size}


# --- AUTH (JSON, para el SPA) ---
@app.post("/api/login")
def api_login(username: str = Form(...), password: str = Form(...)):
    if not (_hmac.compare_digest(username, ADMIN_USER) and _hmac.compare_digest(password, ADMIN_PASS)):
        return JSONResponse(status_code=401, content={"ok": False, "error": "Credenciales inválidas"})
    resp = JSONResponse(content={"ok": True})
    resp.set_cookie("session", _sign(ADMIN_USER), httponly=True, samesite="lax", secure=SECURE_COOKIES)
    return resp


@app.get("/api/auth/status")
def auth_status(request: Request):
    if not _verify(request.cookies.get("session")):
        raise HTTPException(status_code=401, detail="No autenticado")
    return {"authenticated": True, "user": ADMIN_USER}


# --- QR TRACKEADO (requiere auth) ---
# Crea/actualiza un Link y genera el PNG que apunta a /r/{slug} (con tracking).
class TrackedQRRequest(BaseModel):
    slug: str
    target_url: str
    size: int = 500
    logo: str | None = None
    color: str = "#000000"


def _save_tracked_png(slug: str, content: str, size: int, color: str, logo: str | None) -> None:
    if not os.path.exists("qrs"):
        os.makedirs("qrs")
    png = _make_qr_png(content, size, color, logo)
    with open(f"qrs/{slug}.png", "wb") as f:
        f.write(png)


@app.post("/api/qr")
def create_tracked_qr(
    data: TrackedQRRequest,
    request: Request,
    db: Session = Depends(get_db),
    _: Optional[Response] = Depends(require_api),
):
    slug = (data.slug or "").strip()
    target = (data.target_url or "").strip()
    if not slug or not target:
        raise HTTPException(status_code=400, detail="slug y target_url son requeridos")
    if not re.match(r"^[A-Za-z0-9._-]+$", slug):
        raise HTTPException(status_code=400, detail="slug inválido (usa letras, números, . _ -)")
    size = max(200, min(2000, int(data.size or 500)))
    link = db.query(Link).filter(Link.slug == slug).first()
    if link:
        link.target_url = target
    else:
        link = Link(slug=slug, target_url=target)
        db.add(link)
    db.commit()
    base_url = str(request.base_url).rstrip("/")
    content = f"{base_url}/r/{slug}"
    _save_tracked_png(slug, content, size, data.color or "#000000", data.logo)
    return {"slug": slug, "url": f"/download/{slug}", "tracking_url": content}


@app.get("/api/qrs")
def list_qrs(db: Session = Depends(get_db), _: Optional[Response] = Depends(require_api)):
    links = db.query(Link).order_by(Link.id.desc()).all()
    result = []
    for l in links:
        count = db.query(Scan).filter(Scan.link_id == l.id).count()
        result.append({"slug": l.slug, "target_url": l.target_url, "scan_count": count})
    return result


# --- SERVIR EL FRONTEND (SPA React) DESDE EL MISMO PROCESO ---
# El SPA se construye con `npm run build` en Frontend/ -> Frontend/dist/.
# Rutas explícitas (/dashboard, /login, /r/{slug}, /download, /stats, /api/...)
# tienen prioridad sobre este catch-all.

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Frontend", "dist")


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    candidate = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.isfile(candidate):
        return FileResponse(candidate)
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return HTMLResponse(
        content="<h1>Frontend no construido</h1><p>Ejecutá <code>npm run build</code> en la carpeta Frontend/.</p>",
        status_code=503,
    )