import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface WorkflowStep {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  artifacts?: any[];
}

export interface RequirementsAssessment {
  overall: number;
  scores: Record<string, number>;
  justifications: Record<string, string>;
}

export interface WorkflowState {
  // Current workflow
  workflowId: string | null;
  currentStep: number;
  mode: 'manual' | 'semi-auto' | 'yolo';
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  
  // Requirements data
  requirements: string;
  projectName: string;
  boilerplateTemplate: string;
  
  // Assessment results
  verificationResult: any | null;
  assessmentResult: RequirementsAssessment | null;
  improvementSuggestions: any | null;
  projectSummary: any | null;
  
  // Workflow steps
  steps: WorkflowStep[];
  
  // Actions
  setRequirements: (requirements: string) => void;
  setProjectName: (name: string) => void;
  setBoilerplateTemplate: (template: string) => void;
  setVerificationResult: (result: any) => void;
  setAssessmentResult: (result: RequirementsAssessment) => void;
  setImprovementSuggestions: (suggestions: any) => void;
  setProjectSummary: (summary: any) => void;
  setWorkflowId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setMode: (mode: 'manual' | 'semi-auto' | 'yolo') => void;
  setStatus: (status: 'idle' | 'running' | 'paused' | 'completed' | 'failed') => void;
  updateStepStatus: (stepId: number, status: 'pending' | 'in_progress' | 'completed' | 'failed') => void;
  reset: () => void;
}

const initialSteps: WorkflowStep[] = [
  { id: 0, name: 'Requirements Assessment', status: 'pending' },
  { id: 1, name: 'API Design', status: 'pending' },
  { id: 2, name: 'Database Design', status: 'pending' },
  { id: 3, name: 'Business Logic', status: 'pending' },
  { id: 4, name: 'Data Validation', status: 'pending' },
  { id: 5, name: 'Infrastructure', status: 'pending' },
  { id: 6, name: 'Security', status: 'pending' },
  { id: 7, name: 'Testing', status: 'pending' },
  { id: 8, name: 'Documentation', status: 'pending' },
  { id: 9, name: 'Deployment', status: 'pending' },
];

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set) => ({
      // Initial state
      workflowId: null,
      currentStep: 0,
      mode: 'manual',
      status: 'idle',
      requirements: '',
      projectName: '',
      boilerplateTemplate: 'REST API Service',
      verificationResult: null,
      assessmentResult: null,
      improvementSuggestions: null,
      projectSummary: null,
      steps: initialSteps,
      
      // Actions
      setRequirements: (requirements) => set({ requirements }),
      setProjectName: (projectName) => set({ projectName }),
      setBoilerplateTemplate: (boilerplateTemplate) => set({ boilerplateTemplate }),
      setVerificationResult: (verificationResult) => set({ verificationResult }),
      setAssessmentResult: (assessmentResult) => set({ assessmentResult }),
      setImprovementSuggestions: (improvementSuggestions) => set({ improvementSuggestions }),
      setProjectSummary: (projectSummary) => set({ projectSummary }),
      setWorkflowId: (workflowId) => set({ workflowId }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setMode: (mode) => set({ mode }),
      setStatus: (status) => set({ status }),
      updateStepStatus: (stepId, status) =>
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId ? { ...step, status } : step
          ),
        })),
      reset: () =>
        set({
          workflowId: null,
          currentStep: 0,
          mode: 'manual',
          status: 'idle',
          requirements: '',
          projectName: '',
          boilerplateTemplate: 'REST API Service',
          verificationResult: null,
          assessmentResult: null,
          improvementSuggestions: null,
          projectSummary: null,
          steps: initialSteps,
        }),
    }),
    {
      name: 'workflow-store',
    }
  )
);