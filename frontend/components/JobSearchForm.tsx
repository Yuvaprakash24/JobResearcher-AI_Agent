import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Users, Briefcase, Filter } from 'lucide-react';
import { JobResearchRequest } from '@/types/job';

interface JobSearchFormProps {
  onSubmit: (data: JobResearchRequest) => void;
  isLoading: boolean;
}

const JobSearchForm: React.FC<JobSearchFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<JobResearchRequest>({
    job_title: '',
    location: '',
    job_type: undefined,
    experience_level: undefined,
    skills: [],
    salary_min: undefined,
    salary_max: undefined,
    company_size: '',
    remote_friendly: undefined,
    max_results: 50,
  });

  const [skillInput, setSkillInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title.trim()) return;
    onSubmit(formData);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || [],
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Job Market Research</h2>
          <p className="text-gray-600">Let AI analyze the job market for you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="job_title"
              value={formData.job_title}
              onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !formData.job_title.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Starting Research...' : 'Start AI Research'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobSearchForm; 