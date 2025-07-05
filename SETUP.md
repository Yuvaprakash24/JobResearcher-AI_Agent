# Job Research AI Agent - Setup Instructions

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Python 3.8+** (recommended: Python 3.10 or newer)
- **Node.js 16+** (recommended: Node.js 18 or newer)
- **npm** or **yarn** package manager

## API Keys Required

You'll need to obtain the following API keys:

1. **SerpAPI Key**
   - Visit: https://serpapi.com/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **OpenRouter API Key**
   - Visit: https://openrouter.ai/
   - Sign up for an account
   - Get your API key from the dashboard

## Backend Setup

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**
   Create a `.env` file in the `backend` directory:
   ```
   SERPAPI_KEY=your_serpapi_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   API_HOST=0.0.0.0
   API_PORT=8000
   FRONTEND_URL=http://localhost:3000
   LOG_LEVEL=INFO
   ```

5. **Run the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

   The backend will be available at: http://localhost:8000

## Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file (optional)**
   Create a `.env.local` file in the `frontend` directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at: http://localhost:3000

## Testing the Setup

1. **Check backend health**
   Visit: http://localhost:8000/health

2. **Test the complete flow**
   - Open http://localhost:3000 in your browser
   - Fill in the job search form
   - Click "Start AI Research"
   - Wait for the results

## Project Structure

```
JobResearcher/
├── backend/              # Python FastAPI backend
│   ├── agents/          # Langgraph agents
│   ├── services/        # External API integrations
│   ├── models/          # Data models
│   ├── config.py        # Configuration
│   └── main.py         # FastAPI application
├── frontend/            # NextJS frontend
│   ├── components/      # React components
│   ├── pages/          # NextJS pages
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── styles/         # CSS styles
└── requirements.txt     # Python dependencies
```

## Key Features

- **Multi-step AI Agent**: Uses Langgraph to orchestrate job research workflow
- **Real-time Job Search**: Integrates with SerpAPI for up-to-date job listings
- **AI Analysis**: Leverages OpenRouter LLMs for market analysis and insights
- **Modern UI**: Built with NextJS and TailwindCSS
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Make sure you're in the correct directory
   - Ensure virtual environment is activated
   - Check if all dependencies are installed

2. **API Key errors**
   - Verify your API keys are correct
   - Check that the .env file is in the right location
   - Ensure no extra spaces or quotes in the .env file

3. **CORS errors**
   - Make sure both frontend and backend are running
   - Check that the FRONTEND_URL in .env matches your frontend URL

4. **Port conflicts**
   - Backend runs on port 8000
   - Frontend runs on port 3000
   - Change ports in configuration if needed

### Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all API keys are valid
3. Ensure all dependencies are installed
4. Check that both servers are running

## Development Notes

- The backend uses in-memory storage by default
- For production, consider using a proper database
- Rate limiting and caching can be added for better performance
- The AI model can be changed in the OpenRouter service configuration

## Next Steps

Once the setup is complete, you can:

1. Customize the AI prompts in the OpenRouter service
2. Add more job search filters
3. Implement user authentication
4. Add data persistence
5. Deploy to production

Happy job researching! 🚀 