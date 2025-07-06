import React from 'react';
import { Building, Star, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { JobResearchResponse, JobResearchRequest } from '@/types/job';

interface ResearchResultsProps {
  results: JobResearchResponse;
  searchData: JobResearchRequest | null;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({ results, searchData }) => {
  const [showAllJobs, setShowAllJobs] = React.useState(false);
  const displayedJobs = showAllJobs ? results.job_postings : results.job_postings.slice(0, 10);
  const hasMoreJobs = results.job_postings.length > 10;

  return (
    <div className="space-y-8">
            

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Tailored Recommendations for Your Role as {searchData?.job_title}</h2>
        </div>
        
        <div className="space-y-4">
          {results.ai_recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Listings</h2>
        
        <div className="space-y-6">
          {displayedJobs.map((job, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <span>{job.location}</span>
                    {job.salary && (
                      <span className="text-green-600 font-medium">{job.salary}</span>
                    )}
                  </div>
                  {job.posted_date && (
                    <div className="text-xs text-gray-500">Posted: {job.posted_date}</div>
                  )}
                </div>
                
                {/* Apply Button */}
                <div className="ml-4 flex-shrink-0">
                  {job.apply_url ? (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                      No Link Available
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{job.description.substring(0, 300)}...</p>
              
              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 6).map((req, reqIndex) => (
                        <span
                          key={reqIndex}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.slice(0, 6).map((benefit, benefitIndex) => (
                        <span
                          key={benefitIndex}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom Action Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {job.job_type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.job_type.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {job.experience_level.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                  {job.company_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{job.company_rating}/5</span>
                    </div>
                  )}
                </div>
                
                {/* Duplicate Apply Link for Easy Access */}
                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View Full Job</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Show More/Less Jobs Button */}
        {hasMoreJobs && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllJobs(!showAllJobs)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAllJobs ? (
                <>
                  Show Less Jobs
                  <ChevronUp className="ml-2 w-5 h-5" />
                </>
              ) : (
                <>
                  Show All {results.job_postings.length} Jobs
                  <ChevronDown className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              {showAllJobs 
                ? `Showing all ${results.job_postings.length} job postings`
                : `Showing 10 of ${results.job_postings.length} job postings`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchResults; 