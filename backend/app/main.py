from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, wards, compare

app = FastAPI(title="Livebl API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Livebl API running"}

app.include_router(health.router)
app.include_router(wards.router)
app.include_router(compare.router)
