from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, settings
from app.routers import auth, lists, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Drift API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lists.router)
app.include_router(tasks.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
