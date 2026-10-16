from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger
from app.api.routes import complaints, authorities, location, health, nearby, services, user, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("==================================================")
    logger.info(" RabtaaAI — 'RabtaaAI' started ")
    logger.info(f" Host: {settings.HOST}, Port: {settings.PORT}")
    logger.info("==================================================")
    yield

app = FastAPI(
    title="RabtaaAI — Karachi Civic AI",
    description="Location-aware civic complaint reporting, nearby issue discovery, and civic services platform for Karachi.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for user-friendly errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "server_error",
            "message": "We're having trouble completing this request right now. Please try again in a moment."
        }
    )

# Register routers
app.include_router(health.router)
app.include_router(authorities.router)
app.include_router(location.router)
app.include_router(complaints.router)
app.include_router(nearby.router)
app.include_router(services.router)
app.include_router(user.router)
app.include_router(chat.router)


