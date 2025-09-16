import React, { useState, useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { requirementsApi } from '../services/api';

export const RequirementsAssessment: React.FC = () => {
  const {
    requirements,
    projectName,
    boilerplateTemplate,
    verificationResult,
    assessmentResult,
    improvementSuggestions,
    setRequirements,
    setProjectName,
    setBoilerplateTemplate,
    setVerificationResult,
    setAssessmentResult,
    setImprovementSuggestions,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requirements' | 'assessment' | 'recommendations' | 'summary'>('requirements');
  const [, setWorkflowId] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setRequirements(content);
      
      // Auto-verify on upload
      try {
        setLoading(true);
        setError(null);
        const result = await requirementsApi.verify({ requirements: content });
        
        if (result.workflow_id) {
          setWorkflowId(result.workflow_id);
          // Poll for status
          pollWorkflowStatus(result.workflow_id);
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }, [setRequirements]);

  // Poll workflow status
  const pollWorkflowStatus = useCallback(async (wfId: string) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await requirementsApi.getStatus(wfId);
        
        if (status.status === 'completed' && status.result) {
          setVerificationResult(status.result);
          return true;
        } else if (status.status === 'failed') {
          setError(status.error || 'Workflow failed');
          return false;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError('Workflow timeout');
        }
      } catch (err: any) {
        setError(err.message || 'Status check failed');
      }
    };
    
    poll();
  }, [setVerificationResult]);

  // Handle assessment
  const handleAssess = useCallback(async () => {
    if (!requirements) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await requirementsApi.assess({ requirements });
      
      if (result.workflow_id) {
        const wfId = result.workflow_id;
        // Poll for status
        const maxAttempts = 30;
        let attempts = 0;
        
        const poll = async () => {
          const status = await requirementsApi.getStatus(wfId);
          
          if (status.status === 'completed' && status.result) {
            setAssessmentResult(status.result.assessment);
            setImprovementSuggestions(status.result.improvements);
            setActiveTab('assessment');
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts && status.status !== 'failed') {
            setTimeout(poll, 2000);
          }
        };
        
        poll();
      }
    } catch (err: any) {
      setError(err.message || 'Assessment failed');
    } finally {
      setLoading(false);
    }
  }, [requirements, setAssessmentResult, setImprovementSuggestions]);

  // Handle recommend
  const handleRecommend = useCallback(() => {
    if (improvementSuggestions) {
      setActiveTab('recommendations');
    }
  }, [improvementSuggestions]);

  // Handle improve
  const handleImprove = useCallback(async () => {
    if (!requirements || !improvementSuggestions) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await requirementsApi.implementImprovements({
        requirements,
        improvements: improvementSuggestions,
      });
      
      if (result.workflow_id) {
        // Poll for status
        // ... similar polling logic
      }
    } catch (err: any) {
      setError(err.message || 'Improvement failed');
    } finally {
      setLoading(false);
    }
  }, [requirements, improvementSuggestions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Galaxy SDLC <span className="text-sm font-normal text-gray-600">• Backend Creation Agent</span>
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Step 0: Requirements Assessment
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Requirements Input</h2>
                
                {/* Project Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                {/* Boilerplate Template */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Boilerplate Template *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={boilerplateTemplate}
                    onChange={(e) => setBoilerplateTemplate(e.target.value)}
                  >
                    <option value="REST API Service">REST API Service</option>
                    <option value="GraphQL Service">GraphQL Service</option>
                    <option value="gRPC Service">gRPC Service</option>
                    <option value="WebSocket Server">WebSocket Server</option>
                    <option value="Event-Driven Service">Event-Driven Service</option>
                  </select>
                </div>

                {/* Requirements Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={10}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Enter or paste your requirements here..."
                  />
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="w-full">
                    <div className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Requirements File</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAssess}
                    disabled={!requirements || loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    Assess
                  </button>
                </div>

                {/* Status Messages */}
                {loading && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                {verificationResult && verificationResult.is_suitable && (
                  <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    ✓ Requirements verified as suitable for backend development (Confidence: {verificationResult.confidence}%)
                  </div>
                )}
              </div>
            </div>

            {/* Results Tabs */}
            {assessmentResult && (
              <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('requirements')}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'requirements'
                          ? 'border-b-2 border-purple-500 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Requirements
                    </button>
                    <button
                      onClick={() => setActiveTab('assessment')}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'assessment'
                          ? 'border-b-2 border-purple-500 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Assessment
                    </button>
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'recommendations'
                          ? 'border-b-2 border-purple-500 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Recommendations
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'requirements' && (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">{requirements}</pre>
                    </div>
                  )}
                  
                  {activeTab === 'assessment' && assessmentResult && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Quality Assessment</h3>
                      <div className="mb-6">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          Overall Score: {assessmentResult.overall}%
                        </div>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(assessmentResult.scores).map(([criterion, score]) => (
                          <div key={criterion}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {criterion.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">{score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  score >= 80 ? 'bg-green-500' : 
                                  score >= 60 ? 'bg-yellow-500' : 
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'recommendations' && improvementSuggestions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Improvement Recommendations</h3>
                      <div className="space-y-4">
                        {improvementSuggestions.recommendations?.map((rec: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r-lg">
                            <div className="font-semibold text-purple-900">{rec.category}</div>
                            <div className="text-sm text-gray-600 mt-1">{rec.issue}</div>
                            <div className="text-sm text-gray-800 mt-2">{rec.suggestion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Actions & Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Workflow Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleRecommend}
                  disabled={!improvementSuggestions}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Recommend
                </button>
                
                <button
                  onClick={handleImprove}
                  disabled={!improvementSuggestions}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Improve
                </button>
                
                <button
                  disabled={true}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Plan
                </button>
                
                <button
                  disabled={true}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                >
                  YOLO Mode
                </button>
                
                <hr className="my-4 border-gray-200" />
                
                <button
                  disabled={!verificationResult?.is_suitable}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                >
                  Next: API Design 
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
              
              {/* Quality Score Display */}
              {assessmentResult && (
                <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Quality Score</div>
                  <div className="relative">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {assessmentResult.overall}%
                    </div>
                    <div className="absolute -right-2 -top-2">
                      {assessmentResult.overall >= 80 ? (
                        <span className="text-green-500 text-2xl">✨</span>
                      ) : assessmentResult.overall >= 60 ? (
                        <span className="text-yellow-500 text-2xl">⚡</span>
                      ) : (
                        <span className="text-orange-500 text-2xl">⚠️</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};