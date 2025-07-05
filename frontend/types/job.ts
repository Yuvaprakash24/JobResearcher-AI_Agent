// Job Research Types

export interface JobResearchRequest {
  job_title: string;
  location?: string;
  job_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote' | 'hybrid';
  experience_level?: 'entry_level' | 'mid_level' | 'senior_level' | 'executive';
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  company_size?: string;
  remote_friendly?: boolean;
  max_results?: number;
}

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  job_type?: string;
  experience_level?: string;
  required_experience_years?: number;
  posted_date?: string;
  apply_url?: string;
  company_rating?: number;
}

export interface CompanyInsight {
  name: string;
  industry: string;
  size?: string;
  rating?: number;
  culture_score?: number;
  work_life_balance?: number;
  growth_opportunities?: number;
  key_benefits: string[];
  recent_news?: string[];
}

export interface JobResearchResponse {
  request_summary: Record<string, any>;
  job_postings: JobPosting[];
  company_insights: CompanyInsight[];
  ai_recommendations: string[];
  generated_at: string;
}

export interface ResearchStatus {
  research_id: string;
  status: 'started' | 'running' | 'completed' | 'failed';
  progress?: number;
  current_step?: string;
  created_at: string;
  updated_at: string;
  estimated_completion?: string;
}

export interface StartResearchResponse {
  research_id: string;
  status: string;
  message: string;
} 