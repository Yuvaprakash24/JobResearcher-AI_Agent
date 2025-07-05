import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, TrendingUp, Users, MapPin, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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

  const { startResearch, getResearchStatus, getResearchResults } = useJobResearch();

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
                  <p className="text-sm text-gray-500">Intelligent job market analysis</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>API Online</span>
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
                  AI-powered job research that analyzes market trends, salary expectations, 
                  and provides personalized recommendations for your career journey.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Market Analysis</h3>
                    <p className="text-sm text-gray-600">Real-time job market trends and insights</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <DollarSign className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Salary Intel</h3>
                    <p className="text-sm text-gray-600">Compensation analysis and benchmarking</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Users className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Company Insights</h3>
                    <p className="text-sm text-gray-600">Deep dive into company culture and growth</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <CheckCircle className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">AI Recommendations</h3>
                    <p className="text-sm text-gray-600">Personalized career guidance and tips</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <div className="mb-8">
            <JobSearchForm onSubmit={handleSearch} isLoading={isLoading} />
          </div>

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
              <p>&copy; 2024 Job Research AI Agent. Powered by Langgraph, SerpAPI, and OpenRouter.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 