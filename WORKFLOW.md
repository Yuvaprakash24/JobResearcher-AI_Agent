# Job Research AI Agent - Complete Workflow Documentation

## 🎯 **Overview**
This document explains the complete job research workflow step-by-step, including every filename, function call, and data flow in the system.

## 📋 **Workflow Summary**
1. **Frontend**: User submits job search → API call to backend
2. **Backend API**: Receives request → Starts background task
3. **AI Agent**: Orchestrates workflow using LangGraph
4. **SerpAPI Service**: Searches real job postings
5. **OpenRouter Service**: Generates AI recommendations
6. **Response Assembly**: Creates final structured response
7. **Frontend Display**: Shows results to user

---

## 🎯 **Frontend Flow (User Interface)**

### **Step 1: User Submits Job Search**
**File**: `frontend/components/JobSearchForm.tsx`
- User fills out job search form with:
  - Job title (required)
  - Location (optional)
  - Skills (optional)
  - Salary range (optional)
  - Experience level (optional)
  - Job type (optional)

### **Step 2: Form Submission Triggers API Call**
**File**: `frontend/hooks/useJobResearch.ts`
- **Function**: `startResearch(request: JobResearchRequest)`
- Makes POST request to: `http://localhost:8000/api/research/start`
- Sends `JobResearchRequest` object as JSON payload

---

## 🔧 **Backend API Layer**

### **Step 3: FastAPI Receives Request**
**File**: `backend/main.py`
- **Endpoint**: `@app.post("/api/research/start")`
- **Function**: `start_job_research(request: JobResearchRequest, background_tasks: BackgroundTasks)`
- Generates unique research ID
- Initializes research status in memory
- Adds background task to process the research

### **Step 4: Background Task Starts**
**File**: `backend/main.py`
- **Function**: `run_job_research(research_id: str, request: JobResearchRequest)`
- Updates status to "running"
- Calls the job research agent

---

## 🤖 **AI Agent Orchestration (LangGraph)**

### **Step 5: Agent Initialization**
**File**: `backend/agents/job_research_agent.py`
- **Class**: `JobResearchAgent`
- **Function**: `research_jobs(request: JobResearchRequest)`
- Initializes workflow state with empty job postings, insights, and recommendations

### **Step 6: Workflow Node 1 - Job Search**
**File**: `backend/agents/job_research_agent.py`
- **Function**: `search_jobs(state: Dict[str, Any])`
- Calls SerpAPI service to search for jobs
- Updates state with job postings

---

## 🔍 **Job Search Service (SerpAPI)**

### **Step 7: SerpAPI Service Execution**
**File**: `backend/services/serpapi_service.py`
- **Class**: `SerpAPIService`
- **Function**: `search_jobs(request: JobResearchRequest)`

#### **Sub-steps in SerpAPI Service:**

**Step 7a: Build Search Query**
- **Function**: `_build_search_query(request: JobResearchRequest)`
- Combines job title, skills, salary range into search string

**Step 7b: Make SerpAPI Request**
- **Function**: `search_jobs()` (main function)
- Makes API call to Google Jobs via SerpAPI
- Returns raw job search results

**Step 7c: Parse Job Results**
- **Function**: `_parse_job_results(results: Dict[str, Any])`
- Extracts job information from SerpAPI response
- Calls multiple helper functions:
  - `_extract_salary(job_data)` - extracts salary info
  - `_extract_requirements(job_data)` - extracts job requirements
  - `_extract_benefits(job_data)` - extracts job benefits
  - `_extract_apply_url(job_data)` - extracts application URLs

**Step 7d: Filter Jobs by Date**
- **Function**: `_filter_jobs_by_date(job_postings, days_limit=15)`
- Filters jobs to only show those posted within 15 days
- Uses helper functions:
  - `_is_job_within_date_range(job, cutoff_date)`
  - `_parse_posted_date(date_str)`
  - `_parse_relative_date(date_str)`

**Step 7e: Return JobPosting Objects**
- **File**: `backend/models/job_models.py`
- **Class**: `JobPosting`
- Returns list of structured job data

---

## 🔄 **Back to Agent Workflow**

### **Step 8: Workflow Node 2 - Generate Company Insights**
**File**: `backend/agents/job_research_agent.py`
- **Function**: `generate_insights(state: Dict[str, Any])`
- Extracts unique companies from job postings
- Creates basic company insights from job data
- **Returns**: List of `CompanyInsight` objects

### **Step 9: Workflow Node 3 - AI Recommendations**
**File**: `backend/agents/job_research_agent.py`
- **Function**: `create_recommendations(state: Dict[str, Any])`
- Calls OpenRouter service for AI-generated recommendations

---

## 🧠 **AI Recommendation Service (OpenRouter)**

### **Step 10: OpenRouter Service Execution**
**File**: `backend/services/openrouter_service.py`
- **Class**: `OpenRouterService`
- **Function**: `generate_recommendations(job_postings, request_data)`

#### **Sub-steps in OpenRouter Service:**

**Step 10a: Build Recommendation Prompt**
- **Function**: `_build_recommendations_prompt(job_postings, request_data)`
- Analyzes job market data
- Creates structured prompt for AI model

**Step 10b: Make LLM Request**
- **Function**: `_make_llm_request(prompt: str)`
- Sends request to Anthropic Claude via OpenRouter
- Uses model: `anthropic/claude-3-haiku`

**Step 10c: Parse AI Response**
- **Function**: `_parse_recommendations(response: str)`
- Extracts recommendations from AI response
- **Function**: `_extract_json_from_response(response: str)`
- Handles JSON parsing from AI output

---

## 📊 **Response Assembly**

### **Step 11: Final Response Creation**
**File**: `backend/agents/job_research_agent.py`
- **Function**: `research_jobs()` (completion)
- Assembles final `JobResearchResponse` with:
  - Request summary
  - Job postings list
  - Company insights
  - AI recommendations
  - Generation timestamp

### **Step 12: Background Task Completion**
**File**: `backend/main.py`
- **Function**: `run_job_research()` (completion)
- Updates research status to "completed"
- Stores results in memory

---

## 🔄 **Frontend Result Polling**

### **Step 13: Status Checking**
**File**: `frontend/hooks/useJobResearch.ts`
- **Function**: `getResearchStatus(researchId: string)`
- Polls: `GET /api/research/{research_id}/status`
- Checks if research is completed

### **Step 14: Results Retrieval**
**File**: `frontend/hooks/useJobResearch.ts`
- **Function**: `getResearchResults(researchId: string)`
- Calls: `GET /api/research/{research_id}/results`
- Receives complete `JobResearchResponse`

---

## 🎨 **Frontend Display**

### **Step 15: Results Rendering**
**File**: `frontend/components/ResearchResults.tsx`
- **Component**: `ResearchResults`
- Displays:
  - AI recommendations section
  - Job listings (limited to 10 for display)
  - Company insights
  - Apply buttons with URLs

---

## 📁 **Data Models Used Throughout**

### **Backend Models**
**File**: `backend/models/job_models.py`
- `JobResearchRequest` - Input data structure
- `JobPosting` - Individual job data
- `CompanyInsight` - Company analysis data
- `JobResearchResponse` - Final output structure

### **Frontend Types**
**File**: `frontend/types/job.ts`
- TypeScript interfaces matching backend models

---

## 🔧 **Configuration Files**

**File**: `backend/config.py`
- Environment variable handling
- Service configuration

**File**: `frontend/next.config.js`
- Next.js configuration
- API URL configuration

---

## 🚀 **Application Entry Points**

- **Backend**: `backend/main.py` - FastAPI server
- **Frontend**: `frontend/pages/index.tsx` - Next.js main page

---

## 🔄 **Complete Data Flow**

```
User Input (Frontend)
    ↓
JobSearchForm.tsx → useJobResearch.ts
    ↓
POST /api/research/start (Backend API)
    ↓
main.py → run_job_research() → JobResearchAgent.research_jobs()
    ↓
Agent Workflow (LangGraph):
    1. search_jobs() → SerpAPIService.search_jobs()
    2. generate_insights() → Create CompanyInsights
    3. create_recommendations() → OpenRouterService.generate_recommendations()
    ↓
JobResearchResponse assembled
    ↓
Background task completes → Results stored
    ↓
Frontend polls status → Retrieves results
    ↓
ResearchResults.tsx displays final output
```

---

## ✅ **Key Features Implemented**

- **No dummy data** - Only real job postings from SerpAPI
- **AI-powered insights** - Recommendations generated by Claude
- **Scalable architecture** - Background processing with status polling
- **Error handling** - Graceful degradation at each step
- **Real-time updates** - Status polling keeps users informed
- **Date filtering** - Only jobs posted within last 15 days
- **Structured parsing** - Salary, requirements, benefits extraction
- **Apply URLs** - Direct links to job applications

---

## 📋 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/research/start` | Start new job research |
| GET | `/api/research/{id}/status` | Check research status |
| GET | `/api/research/{id}/results` | Get completed results |
| GET | `/api/research/list` | List all research tasks |
| GET | `/health` | Health check |

---

## 🔧 **Environment Variables Required**

- `SERPAPI_API_KEY` - For job search functionality
- `OPENROUTER_API_KEY` - For AI recommendations
- `NEXT_PUBLIC_API_URL` - Frontend to backend connection

---

## 🚀 **How to Run**

1. **Backend**: `cd backend && python main.py`
2. **Frontend**: `cd frontend && npm run dev`
3. **Access**: Open `http://localhost:3000`

This workflow ensures a complete, production-ready job research system with real data and AI-powered insights. 