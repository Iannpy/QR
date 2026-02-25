import qrcode
import os
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

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

app = FastAPI()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- RUTAS ---

@app.post("/create/{slug}")
def create_qr(slug: str, target_url: str, request: Request, db: Session = Depends(get_db)):
    # Intentar guardar en DB
    db_link = Link(slug=slug, target_url=target_url)
    db.add(db_link)
    try:
        db.commit()
    except:
        raise HTTPException(status_code=400, detail="El slug ya existe")
    
    # Detectar la URL del servidor automáticamente
    base_url = str(request.base_url).rstrip('/')
    qr_content = f"{base_url}/r/{slug}"
    
    if not os.path.exists("qrs"): os.makedirs("qrs")
    img = qrcode.make(qr_content)
    img.save(f"qrs/{slug}.png")
    
    return {"message": "QR Creado", "link_para_escanear": qr_content}

@app.get("/r/{slug}")
def redirect_and_track(slug: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.slug == slug).first()
    if not link: raise HTTPException(status_code=404)

    # Registro de métricas
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
        "total_escaneos": len(scans),
        "historial": [{"fecha": s.timestamp, "dispositivo": s.user_agent} for s in scans]
    }

@app.get("/download/{slug}")
def download_qr(slug: str):
    path = f"qrs/{slug}.png"
    if os.path.exists(path): return FileResponse(path)
    return {"error": "No existe el archivo"}