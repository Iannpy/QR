import qrcode
import os
from fastapi import FastAPI, Depends, Request, HTTPException, Form
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

# --- CONFIGURACIÓN DE BASE DE DATOS ---
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./qr_manager.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- INTERFAZ VISUAL (DASHBOARD) ---

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return """
    <html>
        <head>
            <title>QR Manager Pro</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 class="text-2xl font-bold mb-6 text-gray-800 text-center">Generador de QR Dinámico</h1>
                <form action="/create-ui" method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre corto (slug)</label>
                        <input type="text" name="slug" placeholder="ej: promo-marzo" class="mt-1 block w-full border rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">URL de destino</label>
                        <input type="url" name="target_url" placeholder="https://tu-web.com" class="mt-1 block w-full border rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">Crear QR Mágico</button>
                </form>
            </div>
        </body>
    </html>
    """

# --- LÓGICA DE NEGOCIO ---

@app.post("/create-ui")
async def create_ui(slug: str = Form(...), target_url: str = Form(...), request: Request = None, db: Session = Depends(get_db)):
    db_link = Link(slug=slug, target_url=target_url)
    db.add(db_link)
    try:
        db.commit()
    except:
        return "Error: El slug ya existe. Intenta con otro nombre."
    
    base_url = str(request.base_url).rstrip('/')
    qr_content = f"{base_url}/r/{slug}"
    
    if not os.path.exists("qrs"): os.makedirs("qrs")
    img = qrcode.make(qr_content)
    img.save(f"qrs/{slug}.png")
    
    return HTMLResponse(content=f"""
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>¡QR Creado con éxito!</h1>
            <p>Escanea este código para ir a: <b>{target_url}</b></p>
            <img src="/download/{slug}" style="border:10px solid white; box-shadow:0 0 10px rgba(0,0,0,0.1); width:300px;">
            <br><br>
            <p>Métricas en tiempo real aquí: <a href="/stats/{slug}">{base_url}/stats/{slug}</a></p>
            <a href="/">Volver al inicio</a>
        </body>
    """)

@app.get("/r/{slug}")
def redirect_and_track(slug: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link: raise HTTPException(status_code=404)
    new_scan = Scan(link_id=link.id, user_agent=request.headers.get("user-agent"), ip_address=request.client.host)
    db.add(new_scan)
    db.commit()
    return RedirectResponse(url=link.target_url)

@app.get("/stats/{slug}")
def get_stats(slug: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link: raise HTTPException(status_code=404)
    scans = db.query(Scan).filter(Scan.link_id == link.id).all()
    return {
        "slug": slug,
        "total_escaneos": len(scans),
        "clicks": [{"fecha": s.timestamp, "dispositivo": s.user_agent} for s in scans]
    }

@app.get("/download/{slug}")
def download_qr(slug: str):
    path = f"qrs/{slug}.png"
    if os.path.exists(path): return FileResponse(path)
    return {"error": "No encontrado"}