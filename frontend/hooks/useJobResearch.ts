import { useState, useCallback } from 'react';
import axios from 'axios';
import { JobResearchRequest, JobResearchResponse, ResearchStatus, StartResearchResponse } from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useJobResearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const startResearch = useCallback(async (request: JobResearchRequest): Promise<StartResearchResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<StartResearchResponse>('/api/research/start', request);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to start research';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const getResearchStatus = useCallback(async (researchId: string): Promise<ResearchStatus> => {
    try {
      const response = await apiClient.get<ResearchStatus>(`/api/research/${researchId}/status`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get research status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiClient]);

  const getResearchResults = useCallback(async (researchId: string): Promise<JobResearchResponse> => {
    try {
      const response = await apiClient.get<JobResearchResponse>(`/api/research/${researchId}/results`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get research results';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiClient]);

  const listResearchTasks = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/research/list');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to list research tasks';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiClient]);

  const checkApiHealth = useCallback(async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'API health check failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiClient]);

  return {
    startResearch,
    getResearchStatus,
    getResearchResults,
    listResearchTasks,
    checkApiHealth,
    loading,
    error,
  };
}; 