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
  const [experienceYears, setExperienceYears] = useState<string>('');

  // Salary range options in LPA (Lakhs Per Annum)
  const salaryRanges = [
    { label: 'Any Salary', value: '', min: undefined, max: undefined },
    { label: '< 4 LPA', value: '<4', min: undefined, max: 400000 },
    { label: '4 - 7 LPA', value: '4-7', min: 400000, max: 700000 },
    { label: '7 - 10 LPA', value: '7-10', min: 700000, max: 1000000 },
    { label: '10 - 15 LPA', value: '10-15', min: 1000000, max: 1500000 },
    { label: '15 - 20 LPA', value: '15-20', min: 1500000, max: 2000000 },
    { label: '20+ LPA', value: '20+', min: 2000000, max: undefined },
  ];

  // Map years of experience to experience level
  const mapExperienceToLevel = (years: number) => {
    if (years === 0) return 'entry_level';
    if (years <= 2) return 'entry_level';
    if (years <= 5) return 'mid_level';
    if (years <= 10) return 'senior_level';
    return 'executive';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title.trim()) return;
    onSubmit(formData);
  };

  const handleSalaryRangeChange = (value: string) => {
    const selectedRange = salaryRanges.find(range => range.value === value);
    if (selectedRange) {
      setFormData(prev => ({
        ...prev,
        salary_min: selectedRange.min,
        salary_max: selectedRange.max,
      }));
    }
  };

  const handleExperienceChange = (years: string) => {
    setExperienceYears(years);
    const numYears = parseInt(years);
    if (!isNaN(numYears) && numYears >= 0) {
      const experienceLevel = mapExperienceToLevel(numYears);
      setFormData(prev => ({
        ...prev,
        experience_level: experienceLevel as any,
      }));
    } else if (years === '') {
      setFormData(prev => ({
        ...prev,
        experience_level: undefined,
      }));
    }
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

  // Get current salary range value for display
  const getCurrentSalaryRange = () => {
    const { salary_min, salary_max } = formData;
    const range = salaryRanges.find(r => r.min === salary_min && r.max === salary_max);
    return range ? range.value : '';
  };

  // Get experience level display text
  const getExperienceLevelText = () => {
    if (!formData.experience_level) return '';
    const levelMap = {
      'entry_level': 'Entry Level',
      'mid_level': 'Mid Level',
      'senior_level': 'Senior Level',
      'executive': 'Executive'
    };
    return levelMap[formData.experience_level] || '';
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
          <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Salary Range
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="salary_range"
              value={getCurrentSalaryRange()}
              onChange={(e) => handleSalaryRangeChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              {salaryRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              id="experience_years"
              value={experienceYears}
              onChange={(e) => handleExperienceChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 3"
              min="0"
              max="50"
            />
          </div>
          {formData.experience_level && (
            <p className="mt-2 text-sm text-gray-600">
              Experience Level: <span className="font-medium text-blue-600">{getExperienceLevelText()}</span>
            </p>
          )}
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