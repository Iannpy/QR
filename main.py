import qrcode
import os
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
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

# Si no hay DATABASE_URL (estás en tu PC), usa SQLite
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./qr_manager.db"

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

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- RUTAS ---

@app.post("/create/{slug}")
def create_qr(slug: str, target_url: str, request: Request, db: Session = Depends(get_db)):
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

    return RedirectResponse(url=link.target_url)

@app.get("/stats/{slug}")
def get_stats(slug: str, db: Session = Depends(get_db)):
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