# ---- Build del frontend (React + Vite) ----
FROM node:24-slim AS frontend
WORKDIR /frontend
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

# ---- Runtime (FastAPI sirve API + SPA) ----
FROM python:3.14-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && echo "deps installed"

COPY main.py .
COPY qrs ./qrs
COPY --from=frontend /frontend/dist ./Frontend/dist

EXPOSE 8000

# Dokploy inyecta PORT; usamos 8000 como fallback.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
