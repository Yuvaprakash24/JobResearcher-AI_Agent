import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, TrendingUp, Users, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, Linkedin, Github } from 'lucide-react';
import JobSearchForm from '@/components/JobSearchForm';
import ResearchResults from '@/components/ResearchResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import { JobResearchRequest, JobResearchResponse } from '@/types/job';
import { useJobResearch } from '@/hooks/useJobResearch';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [searchData, setSearchData] = useState<JobResearchRequest | null>(null);
  const [results, setResults] = useState<JobResearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [researchId, setResearchId] = useState<string | null>(null);

  const { startResearch, getResearchStatus, getResearchResults, checkApiHealth } = useJobResearch();

  // API health status: true = online, false = offline, null = unknown/loading
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Poll API health every 30 seconds
  useEffect(() => {
    const pollHealth = async () => {
      try {
        await checkApiHealth();
        setApiOnline(true);
      } catch (err) {
        setApiOnline(false);
      }
    };

    // Initial check
    pollHealth();

    const intervalId = setInterval(pollHealth, 30000); // 30-second interval
    return () => clearInterval(intervalId);
  }, [checkApiHealth]);

  const handleSearch = async (formData: JobResearchRequest) => {
    setIsLoading(true);
    setSearchData(formData);
    setResults(null);
    
    try {
      const response = await startResearch(formData);
      setResearchId(response.research_id);
      
      toast.success('Research started! This may take a few minutes...', {
        duration: 4000,
        icon: '🚀',
      });
      
      // Poll for results
      pollForResults(response.research_id);
    } catch (error) {
      console.error('Error starting research:', error);
      toast.error('Failed to start research. Please try again.');
      setIsLoading(false);
    }
  };

  const pollForResults = async (researchId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getResearchStatus(researchId);
        
        if (status.status === 'completed') {
          const results = await getResearchResults(researchId);
          setResults(results);
          setIsLoading(false);
          toast.success('Research completed successfully!', {
            duration: 3000,
            icon: '✅',
          });
          return;
        }
        
        if (status.status === 'failed') {
          setIsLoading(false);
          toast.error('Research failed. Please try again.');
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setIsLoading(false);
          toast.error('Research timed out. Please try again.');
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setIsLoading(false);
          toast.error('Failed to get research results.');
        }
      }
    };

    poll();
  };

  return (
    <>
      <Head>
        <title>Job Research AI Agent</title>
        <meta name="description" content="AI-powered job research and market analysis tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Job Research AI</h1>
                  <p className="text-sm text-gray-500">Smart job search powered by AI</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    {/* Status dot */}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        apiOnline === null
                          ? 'bg-yellow-400'
                          : apiOnline
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span>
                      {apiOnline === null ? 'Checking API...' : apiOnline ? 'API Online' : 'API Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          {!searchData && !isLoading && !results && (
            <div className="text-center mb-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Discover Your Next Career Opportunity
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  AI-powered job research that analyzes job postings, salary expectations, 
                  and provides personalized recommendations for your career journey.
                </p>

                {/* New Filters Coming Soon Note */}
                <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-6 text-center">
                  {/* Centered Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Heading */}
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    New Filters Coming Soon
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-yellow-700">
                    We're actively working on advanced filters like <span className="font-medium">experience level</span>, 
                    <span className="font-medium"> salary range</span>, and <span className="font-medium">job type</span>. 
                    For now, search using <span className="font-medium">job title</span> and <span className="font-medium">location</span> for best results.
                  </p>

                  <p className="text-sm text-yellow-700 mt-2">
                    <strong>Note:</strong> This AI Agent is powered by DeepSeek and SerpAPI. You may experience slight delays during high-load periods.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <div className="mb-8">
            <JobSearchForm onSubmit={handleSearch} isLoading={isLoading} />
          </div>

          {/* Intro Card below Search Form */}
          {!searchData && !isLoading && !results && (
            <div className="flex flex-col items-center space-y-4 mb-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Behind the Agent: Developer Profile
              </h3>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto text-center">
                Hello, I'm <span className="font-semibold">Yuva Prakash Sai Gunupuru</span> — a full-stack developer and competitive programmer.
                I build scalable digital solutions and intelligent AI&nbsp;Agents powered by LLMs.
                Passionate about crafting clean code, automating tasks, and solving real-world problems.
              </p>
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0 mt-6">
                {/* Portfolio Button */}
                <a
                  href="https://yuvaprakashsai-portfolio.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Visit My Portfolio
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {/* LinkedIn Button */}
                <a
                  href="https://www.linkedin.com/in/yuvaprakashsai-gunupuru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0A66C2] text-white text-lg font-medium rounded-lg hover:bg-[#004182] transition-all duration-200"
                >
                  Connect on LinkedIn
                  <Linkedin className="ml-2 w-5 h-5" />
                </a>

                {/* GitHub Button */}
                <a 
                  href="https://github.com/Yuvaprakash24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white text-lg font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  GitHub Workspace 
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-github ml-3" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <LoadingSpinner />
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                AI agents are researching the job market...
              </h3>
              <p className="text-gray-600 mt-2">
                This may take a few minutes. We're analyzing job postings, market trends, 
                and generating personalized insights for you.
              </p>
              
              <div className="mt-6 max-w-md mx-auto bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Progress</span>
                  </span>
                  <span className="text-gray-600">Researching...</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results && !isLoading && (
            <ResearchResults results={results} searchData={searchData} />
          )}

          {/* Error State */}
          {!isLoading && !results && searchData && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Research Failed
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to complete the job research. Please try again.
              </p>
              <button
                onClick={() => {
                  setSearchData(null);
                  setResults(null);
                  setIsLoading(false);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Search
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2025 Job Research AI Agent - Developed by Yuva Prakash Sai Gunupuru. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 