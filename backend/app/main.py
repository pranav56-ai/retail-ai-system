from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_routes, inventory_routes, analytics_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Retail AI Decision Support API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(inventory_routes.router)
app.include_router(analytics_routes.router)

@app.get("/")
def root():
    return {"status": "Retail AI backend is running!"}