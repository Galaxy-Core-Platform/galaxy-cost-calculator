import React from 'react';

interface StepFormsProps {
  currentStep: number;
  stepData: Record<number, any>;
  stepCompleted: Record<number, boolean>;
  onStepDataChange: (stepId: number, field: string, value: any) => void;
  onStepComplete: (stepId: number) => void;
  onNavigate: (stepId: number) => void;
  setStepMode: (mode: boolean) => void;
  activityLog: string[];
  setActivityLog: React.Dispatch<React.SetStateAction<string[]>>;
  requirementsContent: string;
  setRequirementsContent: (content: string) => void;
  currentProvider: string;
}

export const StepForms: React.FC<StepFormsProps> = ({
  currentStep,
  stepData,
  stepCompleted,
  onStepDataChange,
  onStepComplete,
  onNavigate,
  setStepMode,
  activityLog,
  setActivityLog,
  requirementsContent,
  setRequirementsContent,
  currentProvider
}) => {
  const processSteps = [
    { id: 1, name: 'Setup', description: 'Bootstrap & Requirements' },
    { id: 2, name: 'APIs', description: 'OpenAPI Specification' },
    { id: 3, name: 'Model', description: 'Logical Data Model' },
    { id: 4, name: 'Schema', description: 'Database Schema' },
    { id: 5, name: 'Logic', description: 'Business Logic' },
    { id: 6, name: 'Tests', description: 'Testing & Release' }
  ];

  const handleGenerateAPI = async () => {
    const logEntry = `🚀 **Generating API Specification**\nProvider: ${currentProvider}\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);

    // Mock API generation
    const apiSpec = `openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
    post:
      summary: Create user
  /users/{id}:
    get:
      summary: Get user
    put:
      summary: Update user
    delete:
      summary: Delete user`;

    onStepDataChange(2, 'apiSpec', apiSpec);
    onStepDataChange(2, 'generated', true);

    const completeLog = `✅ **API Specification Generated**\n5 endpoints defined\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [completeLog, ...prev]);
  };

  const handleGenerateModel = async () => {
    const logEntry = `🚀 **Generating Data Model**\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);

    const model = `entities:
  User:
    - id: UUID (primary key)
    - email: string (unique)
    - password_hash: string
    - created_at: timestamp
    - updated_at: timestamp

  Session:
    - id: UUID (primary key)
    - user_id: UUID (foreign key)
    - token: string
    - expires_at: timestamp

relationships:
  - User has many Sessions
  - Session belongs to User`;

    onStepDataChange(3, 'dataModel', model);
    onStepDataChange(3, 'generated', true);

    const completeLog = `✅ **Data Model Generated**\n2 entities, 1 relationship\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [completeLog, ...prev]);
  };

  const handleGenerateSchema = async () => {
    const logEntry = `🚀 **Generating Database Schema**\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);

    const schema = `-- Migration: 001_create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: 002_create_sessions_table.sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);`;

    onStepDataChange(4, 'schema', schema);
    onStepDataChange(4, 'generated', true);

    const completeLog = `✅ **Database Schema Generated**\n2 tables, 2 indexes\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [completeLog, ...prev]);
  };

  const handleGenerateLogic = async () => {
    const logEntry = `🚀 **Generating Business Logic**\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);

    const logic = `# Service Layer Architecture

## UserService
- createUser(email, password)
- authenticateUser(email, password)
- getUserById(id)
- updateUser(id, data)
- deleteUser(id)

## SessionService
- createSession(userId)
- validateSession(token)
- revokeSession(token)

## Business Rules
1. Password must be at least 8 characters
2. Email must be verified before login
3. Sessions expire after 24 hours
4. Rate limiting: 5 requests per minute
5. Failed login attempts trigger account lock after 5 tries`;

    onStepDataChange(5, 'businessLogic', logic);
    onStepDataChange(5, 'generated', true);

    const completeLog = `✅ **Business Logic Generated**\n2 services, 5 business rules\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [completeLog, ...prev]);
  };

  const handleGenerateTests = async () => {
    const logEntry = `🚀 **Generating Test Suite**\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);

    const tests = `# Test Strategy

## Unit Tests
- UserService: 15 tests
- SessionService: 10 tests
- Validators: 8 tests

## Integration Tests
- API Endpoints: 12 tests
- Database Operations: 8 tests

## E2E Tests
- User Registration Flow
- Login/Logout Flow
- Password Reset Flow

## CI/CD Pipeline
1. Run linters and formatters
2. Execute unit tests
3. Run integration tests
4. Deploy to staging
5. Run E2E tests
6. Deploy to production`;

    onStepDataChange(6, 'testSuite', tests);
    onStepDataChange(6, 'generated', true);

    const completeLog = `✅ **Test Suite Generated**\n33 unit tests, 20 integration tests, 3 E2E flows\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [completeLog, ...prev]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Step Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Step {currentStep}: {processSteps[currentStep - 1].name}
        </h2>
        <p className="text-gray-600 mt-1">
          {processSteps[currentStep - 1].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-grow overflow-y-auto">
        {/* Step 1: Setup */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements Document
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={12}
                placeholder="Enter or paste your requirements..."
                value={stepData[1]?.requirements || requirementsContent}
                onChange={(e) => {
                  onStepDataChange(1, 'requirements', e.target.value);
                  setRequirementsContent(e.target.value);
                }}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Requirements Status</p>
                <p className="font-medium">
                  {requirementsContent ? 'Requirements loaded' : 'No requirements'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (requirementsContent) {
                    onStepComplete(1);
                    const logEntry = `✅ **Step 1: Setup Completed**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!requirementsContent}
                className={`px-4 py-2 rounded-md font-medium ${
                  requirementsContent
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Step 2: APIs */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">API Specification</h3>
              <button
                onClick={handleGenerateAPI}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generate API Spec
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAPI Specification
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={15}
                placeholder="API specification will be generated here..."
                value={stepData[2]?.apiSpec || ''}
                onChange={(e) => onStepDataChange(2, 'apiSpec', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">API Status</p>
                <p className="font-medium">
                  {stepData[2]?.generated ? 'API Specification Generated' : 'Not generated'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (stepData[2]?.apiSpec) {
                    onStepComplete(2);
                    const logEntry = `✅ **Step 2: APIs Completed**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!stepData[2]?.apiSpec}
                className={`px-4 py-2 rounded-md font-medium ${
                  stepData[2]?.apiSpec
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Model */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Data Model</h3>
              <button
                onClick={handleGenerateModel}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generate Data Model
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logical Data Model
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={15}
                placeholder="Data model will be generated here..."
                value={stepData[3]?.dataModel || ''}
                onChange={(e) => onStepDataChange(3, 'dataModel', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Model Status</p>
                <p className="font-medium">
                  {stepData[3]?.generated ? 'Data Model Generated' : 'Not generated'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (stepData[3]?.dataModel) {
                    onStepComplete(3);
                    const logEntry = `✅ **Step 3: Model Completed**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!stepData[3]?.dataModel}
                className={`px-4 py-2 rounded-md font-medium ${
                  stepData[3]?.dataModel
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Schema */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Database Schema</h3>
              <button
                onClick={handleGenerateSchema}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generate Schema
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Schema & Migrations
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={15}
                placeholder="Database schema will be generated here..."
                value={stepData[4]?.schema || ''}
                onChange={(e) => onStepDataChange(4, 'schema', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Schema Status</p>
                <p className="font-medium">
                  {stepData[4]?.generated ? 'Schema Generated' : 'Not generated'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (stepData[4]?.schema) {
                    onStepComplete(4);
                    const logEntry = `✅ **Step 4: Schema Completed**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!stepData[4]?.schema}
                className={`px-4 py-2 rounded-md font-medium ${
                  stepData[4]?.schema
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Logic */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Business Logic</h3>
              <button
                onClick={handleGenerateLogic}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generate Business Logic
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Layer & Business Rules
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={15}
                placeholder="Business logic will be generated here..."
                value={stepData[5]?.businessLogic || ''}
                onChange={(e) => onStepDataChange(5, 'businessLogic', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Logic Status</p>
                <p className="font-medium">
                  {stepData[5]?.generated ? 'Business Logic Generated' : 'Not generated'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (stepData[5]?.businessLogic) {
                    onStepComplete(5);
                    const logEntry = `✅ **Step 5: Logic Completed**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!stepData[5]?.businessLogic}
                className={`px-4 py-2 rounded-md font-medium ${
                  stepData[5]?.businessLogic
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Tests */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Test Suite</h3>
              <button
                onClick={handleGenerateTests}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generate Test Suite
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testing Strategy & CI/CD
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={15}
                placeholder="Test suite will be generated here..."
                value={stepData[6]?.testSuite || ''}
                onChange={(e) => onStepDataChange(6, 'testSuite', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Test Status</p>
                <p className="font-medium">
                  {stepData[6]?.generated ? 'Test Suite Generated' : 'Not generated'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (stepData[6]?.testSuite) {
                    onStepComplete(6);
                    const logEntry = `✅ **Step 6: Tests Completed**\n🎉 **All Steps Complete!**\n_${new Date().toLocaleTimeString()}_`;
                    setActivityLog(prev => [logEntry, ...prev]);
                  }
                }}
                disabled={!stepData[6]?.testSuite}
                className={`px-4 py-2 rounded-md font-medium ${
                  stepData[6]?.testSuite
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t pt-4 mt-6 flex justify-between">
        <button
          onClick={() => {
            if (currentStep > 1) {
              onNavigate(currentStep - 1);
            } else {
              setStepMode(false);
            }
          }}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {currentStep === 1 ? 'Exit Steps' : 'Previous'}
        </button>

        <button
          onClick={() => {
            if (currentStep < 6 && (stepCompleted[currentStep] || currentStep === 1)) {
              onNavigate(currentStep + 1);
            }
          }}
          disabled={currentStep === 6 || (!stepCompleted[currentStep] && currentStep !== 1)}
          className={`px-4 py-2 rounded-md ${
            currentStep === 6 || (!stepCompleted[currentStep] && currentStep !== 1)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};