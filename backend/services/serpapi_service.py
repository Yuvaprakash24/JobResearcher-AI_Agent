"""
SerpAPI Service for Job Search Integration
"""

import os
from typing import List, Dict, Optional, Any
from serpapi import GoogleSearch
from models.job_models import JobResearchRequest, JobPosting
import logging
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)

class SerpAPIService:
    """Service class for integrating with SerpAPI to search for jobs"""
    
    def __init__(self):
        self.api_key = os.getenv("SERPAPI_KEY")
        if not self.api_key:
            raise ValueError("SERPAPI_KEY environment variable is required")
    
    async def search_jobs(self, request: JobResearchRequest) -> List[JobPosting]:
        """
        Search for jobs using SerpAPI Google Jobs search
        
        Args:
            request: JobResearchRequest containing search parameters
            
        Returns:
            List of JobPosting objects
        """
        try:
            # Build search query
            query = self._build_search_query(request)
            
            # Perform SerpAPI search
            params = {
                "engine": "google_jobs",
                "q": query,
                "api_key": self.api_key,
                "num": min(request.max_results or 50, 100),  # SerpAPI limit
                "date_posted": "month",  # Get jobs from last month, then filter to 15 days
            }
            
            # Add location if specified
            if request.location:
                params["location"] = request.location
            
            # Add job type filter
            if request.job_type:
                params["job_type"] = request.job_type.value if hasattr(request.job_type, 'value') else request.job_type
            
            # Add experience level filter
            if request.experience_level:
                params["experience_level"] = request.experience_level.value if hasattr(request.experience_level, 'value') else request.experience_level
            
            logger.info(f"Searching jobs with query: {query}")
            
            search = GoogleSearch(params)
            results = search.get_dict()
            
            # Debug: Log the structure of results
            logger.debug(f"SerpAPI response keys: {list(results.keys())}")
            if "jobs_results" in results:
                logger.debug(f"Number of job results: {len(results.get('jobs_results', []))}")
                if results.get("jobs_results"):
                    first_job = results["jobs_results"][0]
                    logger.debug(f"First job data type: {type(first_job)}")
                    logger.debug(f"First job keys (if dict): {list(first_job.keys()) if isinstance(first_job, dict) else 'Not a dict'}")
            
            # Parse results
            job_postings = self._parse_job_results(results)
            
            # Return real job postings only
            if not job_postings:
                logger.warning("No job postings found for the search criteria.")
            
            logger.info(f"Found {len(job_postings)} job postings")
            
            # Filter jobs to only include those posted within the last 15 days
            filtered_jobs = self._filter_jobs_by_date(job_postings, days_limit=15)
            
            # Filter jobs based on user's experience level
            experience_matched_jobs = self._filter_jobs_by_experience(filtered_jobs, request)
            
            logger.info(f"Filtered {len(job_postings)} jobs to {len(filtered_jobs)} jobs posted within last 15 days")
            logger.info(f"Experience matching: {len(filtered_jobs)} jobs to {len(experience_matched_jobs)} jobs matching user experience")
            return experience_matched_jobs
            
        except Exception as e:
            logger.error(f"Error searching jobs: {str(e)}")
            # Return empty list instead of raising exception to allow graceful handling
            return []
    
    def _build_search_query(self, request: JobResearchRequest) -> str:
        """Build search query from request parameters"""
        query_parts = [request.job_title]
        
        # Add skills to query
        if request.skills:
            query_parts.extend(request.skills[:3])  # Limit to top 3 skills
        
        # Add salary range if specified
        # if request.salary_min or request.salary_max:
        #     salary_query = "salary"
        #     if request.salary_min:
        #         salary_query += f" {request.salary_min}"
        #     if request.salary_max:
        #         salary_query += f" {request.salary_max}"
        #     query_parts.append(salary_query)
        
        if request.salary_min is not None and request.salary_max is not None:
            query_parts.append(f"{request.salary_min} LPA to {request.salary_max} LPA")
        elif request.salary_min is not None:
            query_parts.append(f"above {request.salary_min} LPA")
        elif request.salary_max is not None:
            query_parts.append(f"below {request.salary_max} LPA")

        return " ".join(query_parts)
    
    def _parse_job_results(self, results: Dict[str, Any]) -> List[JobPosting]:
        """Parse SerpAPI results into JobPosting objects"""
        job_postings = []
        
        jobs_results = results.get("jobs_results", [])
        
        for job_data in jobs_results:
            try:
                # Check if job_data is a dictionary
                if not isinstance(job_data, dict):
                    logger.warning(f"Unexpected job data format: {type(job_data)}")
                    continue
                
                # Debug: Log available fields in job data
                logger.debug(f"Job data fields: {list(job_data.keys())}")
                
                # Extract apply URL and log what we found
                apply_url = self._extract_apply_url(job_data)
                logger.debug(f"Extracted apply URL: {apply_url} for job: {job_data.get('title', 'Unknown')}")
                
                # Extract job information safely
                job_posting = JobPosting(
                    title=job_data.get("title", "Unknown Title"),
                    company=job_data.get("company_name", "Unknown Company"),
                    location=job_data.get("location", "Unknown Location"),
                    salary=self._extract_salary(job_data),
                    description=job_data.get("description", "No description available"),
                    requirements=self._extract_requirements(job_data),
                    benefits=self._extract_benefits(job_data),
                    job_type=job_data.get("job_type", ""),
                    experience_level=job_data.get("experience_level", ""),
                    required_experience_years=self._extract_required_experience_years(job_data),
                    posted_date=job_data.get("posted_at", ""),
                    apply_url=apply_url,
                    company_rating=job_data.get("company_rating", None)
                )
                
                job_postings.append(job_posting)
                logger.debug(f"Successfully parsed job: {job_posting.title} at {job_posting.company} with apply_url: {job_posting.apply_url}")
                
            except Exception as e:
                logger.warning(f"Error parsing job result: {str(e)} - Data: {job_data}")
                continue
        
        return job_postings
    
    def _extract_salary(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Extract salary information from job data"""
        salary_info = job_data.get("salary_info", {})
        if salary_info:
            return salary_info.get("text", "")
        
        # Check for salary in description
        description = job_data.get("description", "")
        if "$" in description:
            # Simple salary extraction (can be improved with regex)
            salary_match = re.search(r'\$[\d,]+(?:\s*-\s*\$[\d,]+)?', description)
            if salary_match:
                return salary_match.group()
        
        return None
    
    def _extract_requirements(self, job_data: Dict[str, Any]) -> List[str]:
        """Extract job requirements from description"""
        description = job_data.get("description", "")
        requirements = []
        
        # Common requirement keywords
        req_keywords = [
            "bachelor", "master", "degree", "experience", "years",
            "python", "java", "javascript", "react", "sql", "aws",
            "docker", "kubernetes", "git", "agile", "scrum"
        ]
        
        description_lower = description.lower()
        for keyword in req_keywords:
            if keyword in description_lower:
                requirements.append(keyword.title())
        
        return list(set(requirements))  # Remove duplicates
    
    def _extract_benefits(self, job_data: Dict[str, Any]) -> List[str]:
        """Extract job benefits from description"""
        description = job_data.get("description", "")
        benefits = []
        
        # Common benefits keywords
        benefit_keywords = [
            "health insurance", "dental", "vision", "401k", "retirement",
            "pto", "vacation", "remote", "flexible", "bonus",
            "stock options", "equity", "gym", "wellness"
        ]
        
        description_lower = description.lower()
        for benefit in benefit_keywords:
            if benefit in description_lower:
                benefits.append(benefit.title())
        
        return list(set(benefits))  # Remove duplicates
    
    def _extract_apply_url(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Safely extract apply URL from job data"""
        try:
            # Try multiple URL fields that SerpAPI commonly uses
            url_fields = [
                "apply_link",
                "job_link", 
                "redirect_link",
                "link",
                "url"
            ]
            
            # Check direct URL fields first
            for field in url_fields:
                if field in job_data and job_data[field]:
                    return job_data[field]
            
            # Try apply_options (can be list or dict)
            apply_options = job_data.get("apply_options", [])
            if isinstance(apply_options, list) and apply_options:
                # Take the first apply option if it's a list
                first_option = apply_options[0]
                if isinstance(first_option, dict):
                    return first_option.get("link") or first_option.get("url")
                elif isinstance(first_option, str):
                    return first_option
            elif isinstance(apply_options, dict):
                return apply_options.get("link") or apply_options.get("url")
            
            # Try related_links for apply URLs
            related_links = job_data.get("related_links", [])
            if isinstance(related_links, list):
                for link in related_links:
                    if isinstance(link, dict):
                        link_text = link.get("text", "").lower()
                        if "apply" in link_text or "job" in link_text:
                            return link.get("link") or link.get("url")
            
            # Try extensions for apply info
            extensions = job_data.get("extensions", [])
            if isinstance(extensions, list):
                for ext in extensions:
                    if isinstance(ext, str) and ("apply" in ext.lower() or "http" in ext.lower()):
                        url_match = re.search(r'https?://[^\s]+', ext)
                        if url_match:
                            return url_match.group()
            
            # If no URL found, return None (will show "No Link Available")
            return None
        except Exception as e:
            logger.warning(f"Error extracting apply URL: {str(e)}")
            return None
    
    def _filter_jobs_by_date(self, job_postings: List[JobPosting], days_limit: int = 15) -> List[JobPosting]:
        """Filter job postings to only include those posted within the specified number of days"""
        if not job_postings:
            return job_postings
        
        cutoff_date = datetime.now() - timedelta(days=days_limit)
        filtered_jobs = []
        
        for job in job_postings:
            if self._is_job_within_date_range(job, cutoff_date):
                filtered_jobs.append(job)
        
        return filtered_jobs
    
    def _is_job_within_date_range(self, job: JobPosting, cutoff_date: datetime) -> bool:
        """Check if a job posting is within the specified date range"""
        if not job.posted_date:
            # If no posted date, assume it's recent (within range)
            return True
        
        try:
            # Parse common date formats
            posted_date = self._parse_posted_date(job.posted_date)
            if posted_date:
                return posted_date >= cutoff_date
            else:
                # If we can't parse the date, assume it's recent
                return True
        except Exception as e:
            logger.warning(f"Error parsing posted date '{job.posted_date}': {str(e)}")
            # If we can't parse the date, assume it's recent
            return True
    
    def _parse_posted_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats from job posting dates"""
        if not date_str:
            return None
        
        try:
            # Clean up the date string
            date_str = date_str.strip().lower()
            
            # Handle relative dates (e.g., "2 days ago", "1 week ago")
            if "ago" in date_str:
                return self._parse_relative_date(date_str)
            
            # Handle "today" or "yesterday"
            if date_str == "today":
                return datetime.now()
            elif date_str == "yesterday":
                return datetime.now() - timedelta(days=1)
            
            # Try to parse absolute dates
            # Remove extra text and try to parse
            date_str = re.sub(r'[^\d\-/\s\w]', '', date_str)
            
            # Try dateutil parser (handles many formats) if available
            try:
                from dateutil import parser
                return parser.parse(date_str)
            except ImportError:
                # dateutil not available, continue with basic parsing
                pass
            except:
                # dateutil parsing failed, continue with basic parsing
                pass
            
            # Try common formats
            date_formats = [
                "%Y-%m-%d",
                "%m/%d/%Y",
                "%d/%m/%Y",
                "%Y-%m-%d %H:%M:%S",
                "%m-%d-%Y",
                "%d-%m-%Y"
            ]
            
            for fmt in date_formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            return None
            
        except Exception as e:
            logger.warning(f"Error parsing date '{date_str}': {str(e)}")
            return None
    
    def _parse_relative_date(self, date_str: str) -> Optional[datetime]:
        """Parse relative dates like '2 days ago', '1 week ago', etc."""
        try:
            # Extract number and unit
            match = re.search(r'(\d+)\s*(day|week|month|hour|minute)s?\s*ago', date_str)
            if not match:
                return None
            
            number = int(match.group(1))
            unit = match.group(2)
            
            now = datetime.now()
            
            if unit == "day":
                return now - timedelta(days=number)
            elif unit == "week":
                return now - timedelta(weeks=number)
            elif unit == "month":
                return now - timedelta(days=number * 30)  # Approximate
            elif unit == "hour":
                return now - timedelta(hours=number)
            elif unit == "minute":
                return now - timedelta(minutes=number)
            
            return None
            
        except Exception as e:
            logger.warning(f"Error parsing relative date '{date_str}': {str(e)}")
            return None
    
    async def get_company_info(self, company_name: str) -> Dict[str, Any]:
        """
        Get company information using SerpAPI
        
        Args:
            company_name: Name of the company
            
        Returns:
            Dictionary containing company information
        """
        try:
            params = {
                "engine": "google",
                "q": f"{company_name} company info jobs careers",
                "api_key": self.api_key,
                "num": 5
            }
            
            search = GoogleSearch(params)
            results = search.get_dict()
            
            # Extract company information from search results
            company_info = {
                "name": company_name,
                "search_results": results.get("organic_results", [])[:3],
                "rating": None,
                "industry": None
            }
            
            return company_info
            
        except Exception as e:
            logger.error(f"Error getting company info: {str(e)}")
            return {"name": company_name, "error": str(e)}
    
    def _extract_required_experience_years(self, job_data: Dict[str, Any]) -> Optional[int]:
        """Extract required experience years from job data"""
        title = job_data.get("title", "").lower()
        description = job_data.get("description", "").lower()
        
        # First, look for explicit year mentions in description
        experience_years = self._extract_years_from_text(description)
        if experience_years is not None:
            return experience_years
        
        # If no explicit years, check title for level keywords
        title_years = self._map_level_keywords_to_years(title)
        if title_years is not None:
            return title_years
        
        # Finally, check description for level keywords
        desc_years = self._map_level_keywords_to_years(description)
        if desc_years is not None:
            return desc_years
        
        # Default to 0 years if nothing found
        return 0
    
    def _extract_years_from_text(self, text: str) -> Optional[int]:
        """Extract years of experience from text using regex patterns"""
        # Pattern: "4+ years", "3-5 years", "minimum 2 years", etc.
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\s*to\s*\d+\s*years?\s*(?:of\s*)?experience',
            r'minimum\s*(\d+)\s*years?',
            r'at least\s*(\d+)\s*years?',
            r'(\d+)\s*years?\s*minimum',
            r'(\d+)\s*years?\s*or\s*more',
            r'(\d+)\s*years?\s*in\s*',
            r'(\d+)\s*years?\s*with\s*',
            r'(\d+)\s*years?\s*relevant',
            r'(\d+)\s*years?\s*professional',
            r'(\d+)\s*years?\s*working',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _map_level_keywords_to_years(self, text: str) -> Optional[int]:
        """Map job level keywords to experience years"""
        # Keywords to experience years mapping
        keyword_mapping = {
            # Entry level keywords
            'junior': 1,
            'entry': 0,
            'entry-level': 0,
            'entry level': 0,
            'trainee': 0,
            'intern': 0,
            'graduate': 0,
            'fresher': 0,
            'associate': 1,
            'beginner': 0,
            
            # Mid level keywords
            'mid': 3,
            'mid-level': 3,
            'mid level': 3,
            'intermediate': 3,
            'experienced': 3,
            'specialist': 4,
            
            # Senior level keywords
            'senior': 6,
            'sr': 6,
            'lead': 7,
            'principal': 8,
            'staff': 8,
            'architect': 8,
            'expert': 7,
            'advanced': 6,
            
            # Executive level keywords
            'director': 10,
            'head': 10,
            'manager': 8,
            'chief': 12,
            'vp': 12,
            'vice president': 12,
            'executive': 10,
        }
        
        # Check for keywords in the text
        for keyword, years in keyword_mapping.items():
            if keyword in text:
                return years
        
        return None
    
    def _filter_jobs_by_experience(self, job_postings: List[JobPosting], request: JobResearchRequest) -> List[JobPosting]:
        """Filter job postings based on user's experience level"""
        if not job_postings:
            return job_postings
        
        experience_level = request.experience_level
        if not experience_level:
            return job_postings
        
        # Map user's experience level to years
        user_experience_years = self._map_experience_level_to_years(experience_level)
        
        filtered_jobs = []
        
        for job in job_postings:
            if self._is_job_suitable_for_experience(job, user_experience_years):
                filtered_jobs.append(job)
        
        return filtered_jobs
    
    def _map_experience_level_to_years(self, experience_level: str) -> int:
        """Map experience level to approximate years of experience"""
        level_mapping = {
            'entry_level': 1,
            'mid_level': 4,
            'senior_level': 8,
            'executive': 12
        }
        return level_mapping.get(experience_level, 0)
    
    def _is_job_suitable_for_experience(self, job: JobPosting, user_years: int) -> bool:
        """Check if a job is suitable for user's experience level"""
        required_years = job.required_experience_years
        
        if required_years is None:
            # If no specific requirement, include the job
            return True
        
        # Allow some flexibility: user can apply for jobs requiring up to 2 years more than their experience
        # or any job requiring less experience
        flexibility_buffer = 2
        
        return required_years <= user_years + flexibility_buffer
    
 