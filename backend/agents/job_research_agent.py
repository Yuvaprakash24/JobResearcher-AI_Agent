"""
Job Research Agent using Langgraph
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict

from models.job_models import JobResearchRequest, JobResearchResponse, JobPosting, CompanyInsight
from services.serpapi_service import SerpAPIService
from services.openrouter_service import OpenRouterService
import logging

logger = logging.getLogger(__name__)

class ResearchState(TypedDict):
    """State model for the research workflow"""
    request: JobResearchRequest
    job_postings: List[Dict[str, Any]]
    company_insights: List[Dict[str, Any]]
    recommendations: List[str]
    current_step: str
    error: Optional[str]

class JobResearchAgent:
    """Langgraph agent for orchestrating job research workflow"""
    
    def __init__(self, serpapi_service: SerpAPIService, openrouter_service: OpenRouterService):
        self.serpapi_service = serpapi_service
        self.openrouter_service = openrouter_service
        self.memory = MemorySaver()
        self.graph = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the Langgraph workflow"""
        workflow = StateGraph(ResearchState)
        
        # Define nodes (steps in the research process)
        workflow.add_node("search_jobs", self.search_jobs)
        workflow.add_node("generate_insights", self.generate_insights)
        workflow.add_node("create_recommendations", self.create_recommendations)
        
        # Define edges (flow between steps) - Optimized workflow without market analysis and summary
        workflow.set_entry_point("search_jobs")
        workflow.add_edge("search_jobs", "generate_insights")
        workflow.add_edge("generate_insights", "create_recommendations")
        workflow.add_edge("create_recommendations", END)
        
        return workflow.compile(checkpointer=self.memory)
    
    async def research_jobs(self, request: JobResearchRequest) -> Dict[str, Any]:
        """
        Execute the complete job research workflow
        
        Args:
            request: JobResearchRequest with search parameters
            
        Returns:
            Dictionary with research results
        """
        try:
            # Initialize state
            initial_state: ResearchState = {
                "request": request,
                "job_postings": [],
                "company_insights": [],
                "recommendations": [],
                "current_step": "initialized",
                "error": None
            }
            
            # Run the workflow
            config = {"configurable": {"thread_id": f"research_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}}
            
            final_state = await self.graph.ainvoke(initial_state, config=config)
            
            # Convert to response format
            job_postings_list = [JobPosting(**job) if isinstance(job, dict) else job for job in final_state["job_postings"]]
            
            result = JobResearchResponse(
                request_summary=request.dict(),
                job_postings=job_postings_list,
                company_insights=[CompanyInsight(**insight) if isinstance(insight, dict) else insight for insight in final_state["company_insights"]],
                ai_recommendations=final_state["recommendations"],
                generated_at=datetime.now()
            )
            
            return result.dict()
            
        except Exception as e:
            logger.error(f"Error in job research workflow: {str(e)}")
            raise Exception(f"Job research failed: {str(e)}")
    
    async def search_jobs(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Step 1: Search for jobs using SerpAPI"""
        logger.info("Starting job search...")
        
        try:
            # Extract request - it might already be a dict or JobResearchRequest object
            request_data = state["request"]
            if isinstance(request_data, dict):
                request = JobResearchRequest(**request_data)
            else:
                request = request_data
            
            # Search for jobs
            job_postings = await self.serpapi_service.search_jobs(request)
            
            # Update state
            state["job_postings"] = [job.dict() for job in job_postings]
            state["current_step"] = "jobs_searched"
            
            logger.info(f"Found {len(job_postings)} job postings")
            
        except Exception as e:
            logger.error(f"Error searching jobs: {str(e)}")
            state["error"] = str(e)
            state["job_postings"] = []
        
        return state
    

    
    async def generate_insights(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Step 3: Generate company insights"""
        logger.info("Generating company insights...")
        
        try:
            # Convert job postings back to objects
            job_postings = [JobPosting(**job) for job in state["job_postings"]]
            
            if not job_postings:
                logger.warning("No job postings for insights")
                state["company_insights"] = []
                return state
            
            # Get top companies
            companies = list(set([job.company for job in job_postings]))[:5]
            
            # Generate insights for each company
            company_insights = []
            for company in companies:
                try:
                    company_jobs = [job for job in job_postings if job.company == company]
                    
                    # Create basic insight from real job data
                    insight = CompanyInsight(
                        name=company,
                        industry="Not specified",  # Will be determined from actual job postings
                        size="Not specified",
                        culture_score=3.0,  # Neutral score when unknown
                        work_life_balance=3.0,  # Neutral score when unknown
                        growth_opportunities=3.0,  # Neutral score when unknown
                        key_benefits=list(set([benefit for job in company_jobs for benefit in job.benefits]))[:5]
                    )
                    
                    company_insights.append(insight)
                    
                except Exception as e:
                    logger.warning(f"Error generating insight for {company}: {str(e)}")
                    continue
            
            # Update state
            state["company_insights"] = [insight.dict() for insight in company_insights]
            state["current_step"] = "insights_generated"
            
            logger.info(f"Generated insights for {len(company_insights)} companies")
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            state["error"] = str(e)
            state["company_insights"] = []
        
        return state
    
    async def create_recommendations(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Step 4: Create AI-powered recommendations"""
        logger.info("Creating recommendations...")
        
        try:
            # Convert job postings back to objects
            job_postings = [JobPosting(**job) for job in state["job_postings"]]
            
            if not job_postings:
                logger.warning("No job postings for recommendations")
                state["recommendations"] = ["No specific recommendations available due to insufficient data."]
                return state
            
            # Get request data
            request_data = state["request"]
            if isinstance(request_data, dict):
                request_dict = request_data
            else:
                request_dict = request_data.dict()
            
            # Generate recommendations
            recommendations = await self.openrouter_service.generate_recommendations(
                job_postings, 
                request_dict
            )
            
            # Update state
            state["recommendations"] = recommendations
            state["current_step"] = "completed"  # Final step in optimized workflow
            
            logger.info(f"Generated {len(recommendations)} recommendations")
            
        except Exception as e:
            logger.error(f"Error creating recommendations: {str(e)}")
            state["error"] = str(e)
            state["recommendations"] = ["Unable to generate recommendations at this time."]
            state["current_step"] = "completed"  # Mark as completed even if recommendations failed
        
        return state
    
 