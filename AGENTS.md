# AGENTS.md

Compact guidance for OpenCode sessions in this repo.

## What this is
A single-file FastAPI app (`main.py`) that generates QR codes and tracks scans.
- QR PNGs are written to `qrs/<slug>.png`.
- Click tracking via a `Scan` table; redirects via `/r/{slug}`.
- There is a built-in web UI (HTML served by FastAPI, no build step): `/` generates a QR, `/dashboard` shows scan stats per slug.
- No package structure, no tests, no lint, no typecheck, no CI are configured. Do not invent these commands.

## Run it
Use the existing virtualenv `venv/` (Python 3.14 per `venv/pyvenv.cfg`).
- Dev server: `uvicorn main:app --reload`
- Deploy entrypoint (`procfile`): `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

## Deploy on Dokploy
Dokploy builds this repo as a Docker image from the `Dockerfile` at the root.
- The container binds `0.0.0.0` and listens on `$PORT` (fallback `8000`). Set the service **Port** in Dokploy to match (e.g. `8000`) or export `PORT` in the env.
- **Database**: usa SQLite (sin `DATABASE_URL`), adecuado para eventos puntuales. El archivo es `qr_manager.db` en `/app`. Como el FS del contenedor es efímero, **montá un volumen en `/app/qr_manager.db`** en el servicio Dokploy, o perderás el historial de escaneos en cada redeploy. Las tablas se crean solas al arrancar (`Base.metadata.create_all`), así que un volumen vacío funciona.
- **QR images**: generated PNGs land in `qrs/` inside the container (also ephemeral). Si los QR deben sobrevivir al redeploy, montá también un volumen en `/app/qrs`.
- The image already copies the existing `qrs/` contents, so pre-made QRs (e.g. `ANATO.png`) keep working.
- **Domain port gotcha**: the Dokploy Domain setting "port where the app runs inside the container" defaults to `3000`. The app listens on `8000`, so you MUST set the Domain Port to `8000` or Traefik returns Bad Gateway (502).

## Database
- Tables are auto-created on startup by `Base.metadata.create_all(bind=engine)` (main.py:41). There is NO migration system.
  - To change the schema, drop/recreate the DB or run a manual `ALTER` — codegen/migrations won't help.
- Local/dev uses SQLite file `qr_manager.db` (created if no `DATABASE_URL`).
- Deploy uses Postgres via `DATABASE_URL`. Note the quirk at main.py:15 — `postgres://` is rewritten to `postgresql://` because SQLAlchemy requires the latter.

## Gotchas
- `procfile` is lowercase. Deploy platforms (Railway/Heroku) auto-detect a capital `Procfile`. On Dokploy the `Dockerfile` is authoritative, so the filename case does not matter there. Verify the deploy target still works before trusting this file.
- No `.gitignore` exists. Generated artifacts are committed: `qr_manager.db`, `qrs/*.png`, and `__pycache__/`. Review `git status` carefully so you don't accidentally commit DB/PNG changes.
- `requirements.txt` is unpinned (no version ranges). Upgrades can break silently.
- Slug collisions raise a generic 400 (broad `except` at main.py:58); uniqueness is enforced by the DB, not validated first.
