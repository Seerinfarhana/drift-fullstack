# Drift — Tasks

A Microsoft To Do–style task app with a black theme.

- **Backend**: Python, FastAPI, SQLAlchemy, JWT auth, REST API (SQLite by default)
- **Frontend**: React, TypeScript, Vite

## Project layout

```
drift/
  backend/      FastAPI app (REST API + database)
  frontend/     React + TypeScript client
```

## 1. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit SECRET_KEY before deploying anywhere real
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.
Tables are created automatically in `drift.db` (SQLite) on first run — no migrations needed to get started.

## 2. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL should point at the backend
npm run dev
```

Open `http://localhost:5173`. Sign up for an account — it's created via the API and stored in the database, not in the browser.

## API overview

| Method | Path                              | Purpose               |
|--------|------------------------------------|------------------------|
| POST   | `/api/auth/signup`                | Create account, get token |
| POST   | `/api/auth/login`                 | Log in, get token      |
| GET    | `/api/auth/me`                    | Current user           |
| GET    | `/api/lists`                      | List the user's lists  |
| POST   | `/api/lists`                      | Create a list          |
| DELETE | `/api/lists/{id}`                 | Delete a list          |
| GET    | `/api/tasks?view=myday\|important\|planned` or `?list_id=` | Fetch tasks |
| POST   | `/api/tasks`                      | Create a task          |
| PATCH  | `/api/tasks/{id}`                 | Update a task          |
| DELETE | `/api/tasks/{id}`                 | Delete a task          |
| POST   | `/api/tasks/{id}/steps`           | Add a step (subtask)   |
| PATCH  | `/api/tasks/{id}/steps/{step_id}` | Update a step          |
| DELETE | `/api/tasks/{id}/steps/{step_id}` | Delete a step          |

All routes except signup/login require `Authorization: Bearer <token>`.

## Moving to production

- Swap `DATABASE_URL` for Postgres (e.g. `postgresql://user:pass@host/db`) — SQLAlchemy needs no code changes, just `pip install psycopg2-binary`.
- Set a strong random `SECRET_KEY`.
- Restrict `CORS_ORIGINS` to your real frontend domain.
- Put the FastAPI app behind Gunicorn/Uvicorn workers or a platform like Render/Railway/Fly.io; deploy the frontend as a static build (`npm run build`) to Vercel/Netlify/Cloudflare Pages.
