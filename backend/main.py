from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import create_db
from routers import logs, stats, fitness
import os


app = FastAPI(title = "Hunter System API", description = "API for the Hunter System", version = "1.0.0")

# Configure CORS with environment variable
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db()

app.include_router(logs.router)
app.include_router(stats.router)
app.include_router(fitness.router)


@app.get("/")
def root():
    return {'status': 'Hunter System Online. ARISE!!!'}
