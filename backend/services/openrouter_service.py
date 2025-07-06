"""
OpenRouter Service for LLM Integration
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from models.job_models import JobPosting, CompanyInsight
import logging

logger = logging.getLogger(__name__)

class OpenRouterService:
    """Service class for integrating with OpenRouter LLM API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
        
        self.base_url = "https://openrouter.ai/api/v1"
        # self.model = "anthropic/claude-3-haiku" #fast and cost effective model
        self.model = "deepseek/deepseek-r1:free"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",  # Your site URL
            "X-Title": "Job Research AI Agent"
        }
    

    
    async def generate_company_insights(self, companies: List[str], job_postings: List[JobPosting]) -> List[CompanyInsight]:
        """
        Generate insights about companies from job postings
        
        Args:
            companies: List of company names
            job_postings: List of job postings
            
        Returns:
            List of CompanyInsight objects
        """
        try:
            insights = []
            
            for company in companies[:5]:  # Limit to top 5 companies
                company_jobs = [job for job in job_postings if job.company.lower() == company.lower()]
                
                if company_jobs:
                    insight_prompt = self._build_company_insight_prompt(company, company_jobs)
                    response = await self._make_llm_request(insight_prompt)
                    
                    insight = self._parse_company_insight(response, company, company_jobs)
                    insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating company insights: {str(e)}")
            return []
    
    async def generate_recommendations(self, job_postings: List[JobPosting], request_data: Dict[str, Any]) -> List[str]:
        """Generate AI-powered job recommendations"""
        try:
            recommendations_prompt = self._build_recommendations_prompt(job_postings, request_data)
            
            response = await self._make_llm_request(recommendations_prompt)
            
            # Parse recommendations
            recommendations = self._parse_recommendations(response)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return ["Unable to generate recommendations at this time."]
    

    
    async def _make_llm_request(self, prompt: str) -> str:
        """Make request to OpenRouter LLM API"""
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                
                response.raise_for_status()
                result = response.json()
                
                return result["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"Error making LLM request: {str(e)}")
            raise
    

    
    def _build_company_insight_prompt(self, company: str, company_jobs: List[JobPosting]) -> str:
        """Build prompt for company insight analysis"""
        job_titles = [job.title for job in company_jobs]
        benefits = []
        for job in company_jobs:
            benefits.extend(job.benefits)
        
        prompt = f"""
        Analyze {company} based on their job postings:

        Number of open positions: {len(company_jobs)}
        Job titles: {', '.join(job_titles)}
        Benefits offered: {', '.join(list(set(benefits)))}

        Please provide company analysis in JSON format ONLY. Do not include any additional text:
        {{
            "industry": "estimated industry",
            "size": "startup/small/medium/large/enterprise",
            "culture_score": 0.0-5.0,
            "work_life_balance": 0.0-5.0,
            "growth_opportunities": 0.0-5.0,
            "key_benefits": ["benefit1", "benefit2", "benefit3"]
        }}

        Base your analysis on the job postings content and common knowledge about the company.
        Return only the JSON object, no markdown formatting or extra text.
        """
        
        return prompt
    
    def _build_recommendations_prompt(self, job_postings: List[JobPosting], request_data: Dict[str, Any]) -> str:
        """Build prompt for generating recommendations"""
        skills_mentioned = []
        for job in job_postings:
            skills_mentioned.extend(job.requirements)
        
        top_skills = list(set(skills_mentioned))[:10]
        
        prompt = f"""
        Based on the job market analysis for {request_data.get('job_title', 'the position')}, 
        provide 5 actionable recommendations for job seekers.

        Key findings:
        - {len(job_postings)} jobs found
        - Most required skills: {', '.join(top_skills)}
        - Location: {request_data.get('location', 'Various')}

        Provide recommendations as a JSON array ONLY. Do not include any additional text:
        ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"]

        Focus on skills to develop, application strategies, and market positioning.
        Return only the JSON array, no markdown formatting or extra text.
        """
        
        return prompt
    

    

    
    def _parse_company_insight(self, response: str, company: str, company_jobs: List[JobPosting]) -> CompanyInsight:
        """Parse LLM response into CompanyInsight object"""
        try:
            logger.debug(f"Raw company insight response: {response}")
            
            # Use the same robust JSON extraction
            data = self._extract_json_from_response(response)
            
            if data:
                return CompanyInsight(
                    name=company,
                    industry=data.get("industry", "Unknown"),
                    size=data.get("size", "Unknown"),
                    culture_score=data.get("culture_score", 3.0),
                    work_life_balance=data.get("work_life_balance", 3.0),
                    growth_opportunities=data.get("growth_opportunities", 3.0),
                    key_benefits=data.get("key_benefits", [])
                )
            else:
                raise json.JSONDecodeError("No valid JSON found", response, 0)
            
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse company insight response: {response[:200]}...")
            return CompanyInsight(
                name=company,
                industry="Unknown",
                size="Unknown",
                culture_score=3.0,
                work_life_balance=3.0,
                growth_opportunities=3.0,
                key_benefits=[]
            )
    
    def _parse_recommendations(self, response: str) -> List[str]:
        """Parse LLM response into recommendations list"""
        try:
            logger.debug(f"Raw recommendations response: {response}")
            
            # Use the same robust JSON extraction
            data = self._extract_json_from_response(response)
            
            if data and isinstance(data, list):
                return data[:5]  # Limit to 5 recommendations
            else:
                raise json.JSONDecodeError("No valid JSON array found", response, 0)
                
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse recommendations response: {response[:200]}...")
            # Fallback: split by lines and clean up
            lines = response.strip().split('\n')
            recommendations = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('[') and not line.startswith(']'):
                    # Remove numbering and quotes
                    clean_line = line.strip('1234567890. "')
                    if clean_line:
                        recommendations.append(clean_line)
            return recommendations[:5]  # Limit to 5 recommendations
    
    def _extract_json_from_response(self, response: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from LLM response that might be wrapped in markdown or have extra text"""
        try:
            # First try parsing the response directly
            return json.loads(response.strip())
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        import re
        
        # Look for JSON in markdown code blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        matches = re.findall(json_pattern, response, re.DOTALL)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        # Try to find JSON object in the response
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        matches = re.findall(json_pattern, response, re.DOTALL)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        # Try to find JSON array in the response
        json_pattern = r'\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]'
        matches = re.findall(json_pattern, response, re.DOTALL)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        return None

 