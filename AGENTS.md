# AGENTS.md

Compact guidance for OpenCode sessions in this repo.

## What this is
A FastAPI backend (`main.py`) that generates QR codes and tracks scans, serving a React+Vite SPA frontend built from `Frontend/`.
- QR PNGs are written to `qrs/<slug>.png` (dynamic/tracked QR via `/create/{slug}` + `/r/{slug}`).
- Click tracking via a `Scan` table; redirects via `/r/{slug}`.
- The public generator UI is the React SPA (`Frontend/`), built to `Frontend/dist/` and served by FastAPI. It calls `/api/generate-qr` (static, legacy) and, para QR con tracking, `POST /api/qr` (crea el Link y devuelve `/download/{slug}`). `BrowserRouter` deep links rely on the SPA catch-all in `main.py`.
- El generador y el dashboard SON la SPA (rutas `/`, `/generador-qr/:type`, `/dashboard`) y requieren login. El login es un formulario React que usa `POST /api/login` + `GET /api/auth/status` (cookie HMAC). `GET /login` y `GET /dashboard` sirven el SPA.
- El dashboard (`/dashboard`) muestra la lista de QR (`GET /api/qrs`) con un QR predeterminado (el más reciente) y permite cambiar a otro; usa `GET /stats/{slug}` para los escaneos.
- `Frontend/` was forked from `github.com/BigNight1/generador-qr-Oficial` (see `Frontend/NOTICE`): original repo has NO license, so confirm licensing before public deploy. Google Analytics del autor fue removido.

## Run it
Use the existing virtualenv `venv/` (Python 3.14 per `venv/pyvenv.cfg`).
- Dev server (API + SPA already built): `uvicorn main:app --reload`
- Frontend build (required before serving the SPA): `cd Frontend && npm install && VITE_API_URL="" npm run build`
  - `VITE_API_URL` defaults to same-origin (""), so the SPA calls `/api/generate-qr` on FastAPI. For `vite dev` against a separate API, set `VITE_API_URL=http://localhost:8000`.
- Deploy entrypoint (`procfile`): `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

## Deploy on Dokploy
Dokploy builds this repo as a Docker image from the `Dockerfile` at the root.
- The container binds `0.0.0.0` and listens on `$PORT` (fallback `8000`). Set the service **Port** in Dokploy to match (e.g. `8000`) or export `PORT` in the env.
- **Persistence (CRITICAL): the container FS is ephemeral — every redeploy wipes runtime data.** Mount TWO named volumes in the Dokploy service or you lose everything on each redeploy:
  - `/app/data` → holds `qr_manager.db` (links + scan history). The app writes the DB here (main.py:20).
  - `/app/qrs` → holds the generated QR PNGs.
  - Without these, a redeploy deletes all QR images and scan stats (this already happened once). Tables self-create on startup (`Base.metadata.create_all`), so empty volumes work.
- Do NOT mount a volume on the bare file `/app/qr_manager.db`: Docker can only volume-mount directories, not single files, so it would break the DB. The `/app/data` directory mount is the correct approach.
- The image already copies the existing `qrs/` contents, so pre-made QRs (e.g. `ANATO.png`) keep working.
- **Domain port gotcha**: the Dokploy Domain setting "port where the app runs inside the container" defaults to `3000`. The app listens on `8000`, so you MUST set the Domain Port to `8000` or Traefik returns Bad Gateway (502).

## Database
- Tables are auto-created on startup by `Base.metadata.create_all(bind=engine)` (main.py:41). There is NO migration system.
  - To change the schema, drop/recreate the DB or run a manual `ALTER` — codegen/migrations won't help.
- Local/dev uses SQLite file `data/qr_manager.db` (created if no `DATABASE_URL`).
- Deploy uses Postgres via `DATABASE_URL`. Note the quirk at main.py:15 — `postgres://` is rewritten to `postgresql://` because SQLAlchemy requires the latter.

## Auth
Simple single-admin login (no user system). Cookie signed with HMAC-SHA256, no extra deps.
- **Protected (API, devuelve 401 si no auth)**: `POST /api/qr`, `GET /api/qrs`, `GET /stats/{slug}`. El SPA protege las rutas `/`, `/generador-qr/:type`, `/dashboard` vía `GET /api/auth/status` (redirige a `/login`).
- **Login SPA**: `POST /api/login` (FormData username/password) setea la cookie; `GET /api/auth/status` la verifica.
- `POST /create/{slug}` y `GET /login`/`GET /logout` siguen existiendo para compatibilidad (el SPA usa /api/login).
- **Public (must stay open)**: `/r/{slug}` (the scan redirect attendees hit), `/download/{slug}` (the QR PNG), `/health`.
- Credentials come from env: `ADMIN_USER` (default `admin`) and `ADMIN_PASSWORD`. If `ADMIN_PASSWORD` is unset, a random one is generated and **printed to the deploy logs at startup** — set it explicitly in Dokploy to avoid surprises.
- `SESSION_SECRET` signs the session cookie (random per start if unset). `SECURE_COOKIES=1` enables `Secure` cookies — only set it when behind HTTPS (the `sslip.io` domain is HTTP, so leave it off or the cookie won't persist).

## Gotchas
- `procfile` is lowercase. Deploy platforms (Railway/Heroku) auto-detect a capital `Procfile`. On Dokploy the `Dockerfile` is authoritative, so the filename case does not matter there. Verify the deploy target still works before trusting this file.
- A `.gitignore` exists and excludes `venv/`, `__pycache__/`, `qr_manager.db`, and `qrs/*.png`. The DB is generated at runtime in `/app/data` (volume-mounted), so it is never committed.
- `requirements.txt` is unpinned (no version ranges). Upgrades can break silently.
- Slug collisions raise a generic 400 (broad `except` at main.py:58); uniqueness is enforced by the DB, not validated first.
