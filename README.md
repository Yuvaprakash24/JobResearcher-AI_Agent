# Job Research AI Agent

A comprehensive AI-powered job research and reporting system built with Langgraph and NextJS.

## Features

- 🔍 **Intelligent Job Search**: Uses SerpAPI to search for relevant job postings
- 🤖 **AI-Powered Analysis**: Leverages OpenRouter LLMs for job analysis and insights
- 📊 **Comprehensive Reports**: Generates detailed job market reports
- 🎯 **Multi-Agent Workflow**: Uses Langgraph for orchestrating research tasks
- 🌐 **Modern UI**: NextJS frontend with responsive design

## Architecture

```
JobResearcher/
├── backend/              # Python FastAPI backend
│   ├── agents/          # Langgraph agents
│   ├── services/        # External API integrations
│   ├── models/          # Data models
│   └── main.py         # FastAPI application
├── frontend/            # NextJS frontend
│   ├── components/      # React components
│   ├── pages/          # NextJS pages
│   └── styles/         # CSS styles
└── requirements.txt     # Python dependencies
```

## Setup Instructions

### Backend Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
3. Install dependencies: `pip install -r requirements.txt`
4. Set environment variables in `.env`
5. Run: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Environment Variables

Create a `.env` file in the backend directory:
```
SERPAPI_KEY=your_serpapi_key
OPENROUTER_API_KEY=your_openrouter_key
```

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open http://localhost:3000 in your browser
4. Enter job search criteria and let the AI agents do the research! 