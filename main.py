import qrcode
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# --- CONFIGURACIÓN DE BASE DE DATOS ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./qr_manager.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELOS ---
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

# --- APP ---
app = FastAPI(title="Generador QR Pro")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Crear un nuevo QR Dinámico
@app.post("/create/{slug}")
def create_qr(slug: str, target_url: str, db: Session = Depends(get_db)):
    # Guardar en DB
    db_link = Link(slug=slug, target_url=target_url)
    db.add(db_link)
    db.commit()
    
    # Generar Imagen QR (Apunta a tu futuro dominio)
    if not os.path.exists("qrs"): os.makedirs("qrs")
    
    # IMPORTANTE: Cambia esta URL por la de tu servidor real cuando lo despliegues
    base_url = "http://127.0.0.1:8000" 
    qr_content = f"{base_url}/r/{slug}"
    
    img = qrcode.make(qr_content)
    img_path = f"qrs/{slug}.png"
    img.save(img_path)
    
    return {"message": "QR Creado", "scan_url": qr_content, "qr_image": f"/download/{slug}"}

# 2. El Redireccionador (Métricas)
@app.get("/r/{slug}")
def redirect_and_track(slug: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link:
        raise HTTPException(status_code=404, detail="QR no encontrado")

    # Registrar métrica
    new_scan = Scan(
        link_id=link.id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host
    )
    db.add(new_scan)
    db.commit()

    return RedirectResponse(url=link.target_url)

# 3. Ver Estadísticas
@app.get("/stats/{slug}")
def get_stats(slug: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    scans = db.query(Scan).filter(Scan.link_id == link.id).all()
    return {
        "slug": slug,
        "total_scans": len(scans),
        "history": [{"hora": s.timestamp, "dispositivo": s.user_agent} for s in scans]
    }

# 4. Descargar el PNG del QR
@app.get("/download/{slug}")
def download_qr(slug: str):
    return FileResponse(f"qrs/{slug}.png")