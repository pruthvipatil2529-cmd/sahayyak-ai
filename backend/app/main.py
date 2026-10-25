import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, users, categories, guides, saved_guides, conversations, ai
from app.seed_data import seed_database

# Setup Logging (PRD Section 48)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sahayyak")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Sahayyak AI Database and Tables...")
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
        logger.info("Database verified and seeded successfully.")
    except Exception as e:
        logger.warning(f"Database seed notice: {e}")
    yield
    logger.info("Sahayyak AI backend shutting down cleanly.")

app = FastAPI(
    title="Sahayyak AI API",
    description="Empathetic, accessible digital assistant backend for senior citizens and beginners.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (PRD Section 29)
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Friendly Error Handling (PRD Section 27)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error occurred on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Sorry, something went wrong. Please try again."}
    )

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(guides.router, prefix=settings.API_V1_STR)
app.include_router(saved_guides.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Sahayyak AI API — Empowering Everyone with Technology",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "Sahayyak AI"
    }
