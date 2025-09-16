import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface VerificationRequest {
  requirements: string;
}

export interface AssessmentRequest {
  requirements: string;
}

export interface ImprovementRequest {
  requirements: string;
  improvements: any;
}

export interface WorkflowStatusResponse {
  workflow_id: string;
  status: string;
  result?: any;
  error?: string;
}

// Requirements endpoints
export const requirementsApi = {
  verify: async (data: VerificationRequest) => {
    const response = await api.post('/requirements/verify', data);
    return response.data;
  },
  
  assess: async (data: AssessmentRequest) => {
    const response = await api.post('/requirements/assess', data);
    return response.data;
  },
  
  implementImprovements: async (data: ImprovementRequest) => {
    const response = await api.post('/requirements/implement-improvements', data);
    return response.data;
  },
  
  getStatus: async (workflowId: string): Promise<WorkflowStatusResponse> => {
    const response = await api.get(`/requirements/status/${workflowId}`);
    return response.data;
  },
};

// Workflow endpoints (for future steps)
export const workflowApi = {
  start: async (config: any) => {
    const response = await api.post('/workflow/start', config);
    return response.data;
  },
  
  getStatus: async (workflowId: string) => {
    const response = await api.get(`/workflow/${workflowId}/status`);
    return response.data;
  },
  
  signal: async (workflowId: string, signal: string, data?: any) => {
    const response = await api.post(`/workflow/${workflowId}/signal`, {
      signal,
      data,
    });
    return response.data;
  },
  
  getArtifacts: async (workflowId: string) => {
    const response = await api.get(`/workflow/${workflowId}/artifacts`);
    return response.data;
  },
};

// Step-specific endpoints (for future implementation)
export const stepsApi = {
  execute: async (step: string, data: any) => {
    const response = await api.post(`/steps/${step}/execute`, data);
    return response.data;
  },
  
  validate: async (step: string, data: any) => {
    const response = await api.post(`/steps/${step}/validate`, data);
    return response.data;
  },
  
  preview: async (step: string, data: any) => {
    const response = await api.get(`/steps/${step}/preview`, { params: data });
    return response.data;
  },
};

// YOLO mode endpoints
export const yoloApi = {
  configure: async (config: any) => {
    const response = await api.post('/yolo/configure', config);
    return response.data;
  },
  
  execute: async (requirements: string) => {
    const response = await api.post('/yolo/execute', { requirements });
    return response.data;
  },
};

export default api;