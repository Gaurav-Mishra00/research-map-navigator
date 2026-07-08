from fastapi import FastAPI

app = FastAPI(
    title="ResearchMap Navigator API",
    description="Backend API for route optimization and navigation",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResearchMap Navigator API 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }