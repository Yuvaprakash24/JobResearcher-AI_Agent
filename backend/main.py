"""
Job Research AI Agent - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
from config import settings  # Import application settings

from agents.job_research_agent import JobResearchAgent
from models.job_models import JobResearchRequest, JobResearchResponse
from services.serpapi_service import SerpAPIService
from services.openrouter_service import OpenRouterService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Job Research AI Agent",
    description="AI-powered job research and reporting system",
    version="1.0.0"
)

# Configure allowed origins for CORS
allowed_origins = ["http://localhost:3000"]

# Add frontend URL from environment/settings if provided
if settings.frontend_url and settings.frontend_url not in allowed_origins:
    allowed_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
serpapi_service = SerpAPIService()
openrouter_service = OpenRouterService()
job_research_agent = JobResearchAgent(serpapi_service, openrouter_service)

# In-memory storage for demonstration (use database in production)
research_results = {}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Job Research AI Agent API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/research/start", response_model=Dict[str, Any])
async def start_job_research(request: JobResearchRequest, background_tasks: BackgroundTasks):
    """Start a new job research task"""
    try:
        # Generate a unique research ID
        research_id = f"research_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize research status
        research_results[research_id] = {
            "status": "started",
            "request": request.dict(),
            "results": None,
            "created_at": datetime.now(),
            "completed_at": None
        }
        
        # Start the research task in background
        background_tasks.add_task(run_job_research, research_id, request)
        
        return {
            "research_id": research_id,
            "status": "started",
            "message": "Job research task started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start research: {str(e)}")

@app.get("/api/research/{research_id}/status")
async def get_research_status(research_id: str):
    """Get the status of a research task"""
    if research_id not in research_results:
        raise HTTPException(status_code=404, detail="Research task not found")
    
    return research_results[research_id]

@app.get("/api/research/{research_id}/results", response_model=JobResearchResponse)
async def get_research_results(research_id: str):
    """Get the results of a completed research task"""
    if research_id not in research_results:
        raise HTTPException(status_code=404, detail="Research task not found")
    
    research_data = research_results[research_id]
    
    if research_data["status"] != "completed":
        raise HTTPException(status_code=400, detail="Research task not completed yet")
    
    return JobResearchResponse(**research_data["results"])

@app.get("/api/research/list")
async def list_research_tasks():
    """List all research tasks"""
    return {
        "tasks": [
            {
                "research_id": research_id,
                "status": data["status"],
                "created_at": data["created_at"],
                "completed_at": data.get("completed_at"),
                "job_title": data["request"].get("job_title"),
                "location": data["request"].get("location")
            }
            for research_id, data in research_results.items()
        ]
    }

async def run_job_research(research_id: str, request: JobResearchRequest):
    """Background task to run job research"""
    try:
        # Update status to running
        research_results[research_id]["status"] = "running"
        
        # Run the job research agent
        results = await job_research_agent.research_jobs(request)
        
        # Update results
        research_results[research_id].update({
            "status": "completed",
            "results": results,
            "completed_at": datetime.now()
        })
        
    except Exception as e:
        research_results[research_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now()
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 