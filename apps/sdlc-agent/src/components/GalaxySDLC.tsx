import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { boilerplateTemplates, getBoilerplateByName } from '../config/boilerplates';
import { boilerplateService } from '../services/boilerplateService';
import { TIMEOUTS } from '../config/app.config';
import plantumlEncoder from 'plantuml-encoder';
import { ChatClient, createChatSession } from '../services/ChatClient';
import type { ChatMessage, ChatSession } from '../services/ChatClient';

interface QualityMetric {
  name: string;
  value: number;
  color: 'green' | 'orange';
}

interface LLMProvider {
  value: string;
  label: string;
  available: boolean;
  selected: boolean;
  models: string[];
}

export const GalaxySDLC: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [boilerplateTemplate, setBoilerplateTemplate] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'requirements' | 'process workflows' | 'recommendations' | 'plan' | 'boilerplate' | 'log'>('requirements');
  const [userQuestion, setUserQuestion] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [llmProviders, setLlmProviders] = useState<LLMProvider[]>([]);
  const [currentProvider, setCurrentProvider] = useState(''); // Will be set from backend
  const [currentModel, setCurrentModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(true); // Start as loading
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);

  const [requirementsContent, setRequirementsContent] = useState('');
  const [boilerplateReadme, setBoilerplateReadme] = useState('');
  const [loadingReadme, setLoadingReadme] = useState(false);
  const [hasUsedRecommend, setHasUsedRecommend] = useState(false);
  const [showAgentProcessing, setShowAgentProcessing] = useState(false);
  const [processingAgents, setProcessingAgents] = useState<Array<{name: string, description: string, status: 'waiting' | 'active' | 'completed'}>>([]);
  const [recommendations, setRecommendations] = useState<Array<{category: string, issue: string, suggestion: string}>>([]);
  const [implementationPlan, setImplementationPlan] = useState('');
  const [yoloCycle, setYoloCycle] = useState(0);
  const [qualityScores, setQualityScores] = useState<number[]>([72]);
  const [projectSummary, setProjectSummary] = useState('');
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepMode, setStepMode] = useState(false);
  const [stepData, setStepData] = useState<Record<number, any>>({
    1: {},  // Setup
    2: {},  // APIs
    3: {},  // Model
    4: {},  // Schema
    5: {},  // Logic
    6: {}   // Tests
  });
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });
  const [processing, setProcessing] = useState(false);

  // PlantUML state
  const [plantUmlSchemas, setPlantUmlSchemas] = useState<Array<{id: string, name: string, content: string}>>([]);
  const [plantUmlWorkflows, setPlantUmlWorkflows] = useState<Array<{id: string, name: string, content: string}>>([]);
  const [showPlantUmlEditor, setShowPlantUmlEditor] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<{id: string, name: string, content: string} | null>(null);
  const [editorType, setEditorType] = useState<'schema' | 'workflow'>('schema');

  // New chat state variables (don't touch existing userQuestion state)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [chatConnected, setChatConnected] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const processSteps = [
    { id: 1, name: 'Setup', description: 'Bootstrap & Requirements' },
    { id: 2, name: 'APIs', description: 'OpenAPI Specification' },
    { id: 3, name: 'Model', description: 'Logical Data Model' },
    { id: 4, name: 'Schema', description: 'Database Schema' },
    { id: 5, name: 'Logic', description: 'Business Logic' },
    { id: 6, name: 'Tests', description: 'Testing & Release' }
  ];

  // Initialize with sample PlantUML schemas
  useEffect(() => {
    if (plantUmlSchemas.length === 0) {
      setPlantUmlSchemas([
        {
          id: 'user-schema',
          name: 'User Schema',
          content: `@startuml
class User {
  +id: UUID
  +username: String
  +email: String
  +password_hash: String
  +created_at: DateTime
  +updated_at: DateTime
}

class Role {
  +id: UUID
  +name: String
  +description: String
}

class UserRole {
  +user_id: UUID
  +role_id: UUID
  +assigned_at: DateTime
}

User ||--o{ UserRole
Role ||--o{ UserRole
@enduml`
        },
        {
          id: 'order-schema',
          name: 'Order Schema',
          content: `@startuml
class Order {
  +id: UUID
  +user_id: UUID
  +status: String
  +total: Decimal
  +created_at: DateTime
}

class OrderItem {
  +id: UUID
  +order_id: UUID
  +product_id: UUID
  +quantity: Integer
  +price: Decimal
}

class Product {
  +id: UUID
  +name: String
  +description: Text
  +price: Decimal
  +stock: Integer
}

Order ||--o{ OrderItem
Product ||--o{ OrderItem
@enduml`
        }
      ]);
    }
  }, []);

  // Initialize with sample PlantUML workflows
  useEffect(() => {
    if (plantUmlWorkflows.length === 0) {
      setPlantUmlWorkflows([
        {
          id: 'user-registration-flow',
          name: 'User Registration Process',
          content: `@startuml
title User Registration Workflow

start

:User visits registration page;
:Fill registration form;
:Submit form;

if (Valid data?) then (yes)
  :Store user data;
  :Send confirmation email;
  if (Email verified?) then (yes)
    :Activate account;
    :Login user;
    :Redirect to dashboard;
    end
  else (no)
    :Show pending verification;
    stop
  endif
else (no)
  :Show validation errors;
  :Return to form;
  stop
endif

@enduml`
        },
        {
          id: 'order-processing-flow',
          name: 'Order Processing Workflow',
          content: `@startuml
title Order Processing Workflow

|Customer|
start
:Browse products;
:Add to cart;
:Proceed to checkout;
:Enter payment details;

|System|
:Validate payment;
if (Payment valid?) then (yes)
  :Process payment;
  :Create order;
  :Update inventory;

  |Fulfillment|
  :Pick items;
  :Package order;
  :Ship to customer;

  |Customer|
  :Receive order;
  end
else (no)
  |Customer|
  :Show payment error;
  :Retry payment;
  stop
endif

@enduml`
        },
        {
          id: 'api-request-flow',
          name: 'API Request Lifecycle',
          content: `@startuml
title API Request Processing

actor Client
participant "API Gateway" as Gateway
participant "Auth Service" as Auth
participant "Business Logic" as Logic
participant "Database" as DB

Client -> Gateway: HTTP Request
Gateway -> Auth: Validate Token
Auth --> Gateway: Token Valid

alt Token Valid
  Gateway -> Logic: Forward Request
  Logic -> DB: Query/Update Data
  DB --> Logic: Return Data
  Logic --> Gateway: Response
  Gateway --> Client: HTTP 200 + Data
else Token Invalid
  Gateway --> Client: HTTP 401 Unauthorized
end

@enduml`
        }
      ]);
    }
  }, []);

  // PlantUML helper functions
  const generatePlantUMLUrl = (plantUmlText: string) => {
    try {
      const encoded = plantumlEncoder.encode(plantUmlText);
      return `http://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch (error) {
      console.error('Error encoding PlantUML:', error);
      return '';
    }
  };

  const openSchemaEditor = (schema: {id: string, name: string, content: string}) => {
    setCurrentSchema(schema);
    setEditorType('schema');
    setShowPlantUmlEditor(true);
  };

  const openWorkflowEditor = (workflow: {id: string, name: string, content: string}) => {
    setCurrentSchema(workflow);
    setEditorType('workflow');
    setShowPlantUmlEditor(true);
  };

  const saveSchema = (id: string, name: string, content: string) => {
    if (editorType === 'schema') {
      setPlantUmlSchemas(prev =>
        prev.map(schema =>
          schema.id === id
            ? { ...schema, name, content }
            : schema
        )
      );
    } else {
      setPlantUmlWorkflows(prev =>
        prev.map(workflow =>
          workflow.id === id
            ? { ...workflow, name, content }
            : workflow
        )
      );
    }
    setCurrentSchema(null);
    setShowPlantUmlEditor(false);
  };

  const createNewSchema = () => {
    const newId = `schema-${Date.now()}`;
    const newSchema = {
      id: newId,
      name: 'New Schema',
      content: `@startuml
class NewEntity {
  +id: UUID
  +name: String
  +created_at: DateTime
}
@enduml`
    };
    setPlantUmlSchemas(prev => [...prev, newSchema]);
    openSchemaEditor(newSchema);
  };

  const createNewWorkflow = () => {
    const newId = `workflow-${Date.now()}`;
    const newWorkflow = {
      id: newId,
      name: 'New Workflow',
      content: `@startuml
title New Process Workflow

start
:Step 1;
:Step 2;
if (Condition?) then (yes)
  :Action A;
else (no)
  :Action B;
endif
:Final step;
end

@enduml`
    };
    setPlantUmlWorkflows(prev => [...prev, newWorkflow]);
    openWorkflowEditor(newWorkflow);
  };

  // New chat initialization functions
  const initializeChat = async (step: number) => {
    if (chatLoading || chatConnected) return chatClient;

    setChatLoading(true);
    try {
      const contextType = getContextTypeForStep(step);
      const initialContext = getInitialContextForStep(step);

      // Create chat session
      const session = await createChatSession(contextType, initialContext);
      setChatSession(session);

      // Create and connect chat client
      const client = new ChatClient(session.session_id);

      client.onMessage((message) => {
        setChatMessages(prev => [...prev, message]);
      });

      client.onStatusUpdate((status) => {
        console.log('Chat status update:', status);
      });

      await client.connect();
      setChatClient(client);
      setChatConnected(true);

      return client; // Return the client for immediate use

    } catch (error) {
      console.error('Failed to initialize chat:', error);
      return null;
    } finally {
      setChatLoading(false);
    }
  };

  const getContextTypeForStep = (step: number): string => {
    switch (step) {
      case 1: return 'requirements_improvement';
      case 2: return 'api_design';
      case 3: return 'data_modeling';
      case 4: return 'schema_design';
      case 5: return 'business_logic';
      case 6: return 'testing_strategy';
      default: return 'custom';
    }
  };

  const getInitialContextForStep = (step: number) => {
    switch (step) {
      case 1:
        return {
          requirements_text: requirementsContent || '',
          project_name: projectName || '',
          boilerplate: boilerplateTemplate || '',
          workflows: plantUmlWorkflows
        };
      case 4:
        return {
          project_name: projectName || '',
          database_type: stepData[4]?.databaseType || 'PostgreSQL',
          existing_schema: stepData[4]?.schema || '',
          plantuml_schemas: plantUmlSchemas,
          requirements: requirementsContent || ''
        };
      default:
        return {
          requirements: requirementsContent || '',
          project_name: projectName || ''
        };
    }
  };

  // Load available LLM models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await fetch('http://localhost:8000/models');
        if (response.ok) {
          const data = await response.json();
          setLlmProviders(data.providers || []);
          setCurrentProvider(data.current_provider || '');
          setCurrentModel(data.current_model || '');
        }
      } catch (error) {
        console.error('Failed to load LLM models:', error);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  // Handle step completion
  const handleStepComplete = (stepId: number) => {
    setStepCompleted(prev => ({ ...prev, [stepId]: true }));
  };

  // Handle step navigation
  const handleStepNavigate = (stepId: number) => {
    setCurrentStep(stepId);
    const logEntry = `🔄 **Navigated to Step ${stepId}: ${processSteps[stepId - 1].name}**\n_${new Date().toLocaleTimeString()}_`;
    setActivityLog(prev => [logEntry, ...prev]);
  };

  // Handle step data change with cascading reset
  const handleStepDataChange = (stepId: number, field: string, value: any) => {
    // Update the step data
    setStepData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value
      }
    }));

    // Reset all subsequent steps if data changed
    if (stepCompleted[stepId]) {
      const stepsToReset: number[] = [];
      for (let i = stepId + 1; i <= 6; i++) {
        if (stepCompleted[i]) {
          stepsToReset.push(i);
        }
      }

      if (stepsToReset.length > 0) {
        // Reset completion status
        setStepCompleted(prev => {
          const updated = { ...prev };
          stepsToReset.forEach(id => {
            updated[id] = false;
          });
          return updated;
        });

        // Clear data for reset steps
        setStepData(prev => {
          const updated = { ...prev };
          stepsToReset.forEach(id => {
            updated[id] = {};
          });
          return updated;
        });

        // Log the cascade reset
        const logEntry = `⚠️ **Step ${stepId} Modified**\nReset steps: ${stepsToReset.join(', ')}\n_${new Date().toLocaleTimeString()}_`;
        setActivityLog(prev => [logEntry, ...prev]);
      }
    }
  };

  // Handle LLM model change
  const handleModelChange = async (provider: string, model?: string) => {
    try {
      const response = await fetch('http://localhost:8000/models/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentProvider(provider);
        setCurrentModel(data.model || '');

        // Add to activity log
        const logEntry = `## LLM Model Changed\n\n**Provider**: ${provider}\n**Model**: ${data.model || 'Default'}\n**Timestamp**: ${new Date().toLocaleString()}`;
        setActivityLog(prev => [logEntry, ...prev]);
      }
    } catch (error) {
      console.error('Failed to change LLM model:', error);
      alert('Failed to change LLM model. Please try again.');
    }
  };

  // Load README when boilerplate is selected
  useEffect(() => {
    const loadReadme = async () => {
      if (boilerplateTemplate) {
        const template = getBoilerplateByName(boilerplateTemplate);
        if (template) {
          setLoadingReadme(true);
          try {
            // Fetch the README content
            const readmeContent = await boilerplateService.fetchReadme(template);
            setBoilerplateReadme(readmeContent);
          } catch (error) {
            console.error('Failed to load README:', error);
            setBoilerplateReadme('Failed to load README.md');
          } finally {
            setLoadingReadme(false);
          }
        }
      } else {
        setBoilerplateReadme('');
      }
    };

    loadReadme();
  }, [boilerplateTemplate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setRequirementsContent(content);
        // Switch to requirements tab to show the uploaded content
        setActiveTab('requirements');

        // Automatically start analysis after upload
        await runInitialAnalysis(content);
      };
      reader.readAsText(file);
    }
  };

  const runInitialAnalysis = async (requirements: string) => {
    // Set up agents for initial processing
    const agents = [
      { name: 'Knock-out Verification Agent', description: 'Verifying requirements suitability for backend development', status: 'waiting' as const },
      { name: 'Quality Assessment Agent', description: 'Analyzing requirements quality and completeness', status: 'waiting' as const },
      { name: 'Summary Generation Agent', description: 'Creating project summary', status: 'waiting' as const }
    ];

    setProcessingAgents(agents);
    setShowAgentProcessing(true);

    if (currentProvider === 'fallback') {
      // Use mock implementation explicitly selected by user
      // Step 1: Knock-out verification
      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'active' } : agent
        ));
      }, 500);

      // Step 2: Knock-out complete, start parallel processing
      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'completed' } :
          { ...agent, status: 'active' }
        ));
      }, 1500);

      // Step 3: Complete all
      setTimeout(() => {
        setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

        // Set mock quality scores
        const mockMetrics: QualityMetric[] = [
          { name: 'Clarity', value: 80, color: 'green' },
          { name: 'Completeness', value: 70, color: 'orange' },
          { name: 'Consistency', value: 90, color: 'green' },
          { name: 'Verifiability', value: 80, color: 'green' },
          { name: 'Feasibility', value: 70, color: 'orange' },
          { name: 'Traceability', value: 60, color: 'orange' },
          { name: 'Modifiability', value: 70, color: 'orange' },
          { name: 'Prioritization', value: 50, color: 'orange' },
          { name: 'Unambiguity', value: 80, color: 'green' },
          { name: 'Correctness', value: 80, color: 'green' },
          { name: 'Understandability', value: 80, color: 'green' },
          { name: 'Achievability', value: 70, color: 'orange' },
          { name: 'Relevance', value: 80, color: 'green' },
        ];
        setQualityMetrics(mockMetrics);
        setOverallScore(72);

        // Set mock recommendations
        const mockRecommendations = [
          {
            category: 'Clarity',
            issue: 'Some requirements could be more specific',
            suggestion: 'Add specific acceptance criteria for each feature'
          },
          {
            category: 'Completeness',
            issue: 'Missing error handling specifications',
            suggestion: 'Define error response formats and status codes'
          }
        ];
        setRecommendations(mockRecommendations);
        setHasUsedRecommend(true); // Enable the Improve button

        // Set mock project summary
        const mockProjectSummary = {
          projectType: "REST API Service",
          overview: "A backend API service with comprehensive features for data management and processing.",
          keyFeatures: [
            "RESTful API endpoints with full CRUD operations",
            "Authentication and authorization system",
            "Real-time data processing capabilities",
            "Comprehensive logging and monitoring",
            "Scalable architecture design"
          ],
          technicalStack: {
            backend: "Rust with Actix-web",
            database: "PostgreSQL",
            authentication: "JWT with OAuth2",
            monitoring: "OpenTelemetry"
          },
          deliverables: [
            "Fully functional REST API",
            "API documentation",
            "Unit and integration tests",
            "Deployment scripts",
            "Monitoring dashboard"
          ]
        };
        setProjectSummary(JSON.stringify(mockProjectSummary, null, 2));

        // Log activity
        const logEntry = `## Requirements Analysis Complete [MOCK DATA]

### Provider Used: Mock Data (No API)
⚠️ This is simulated data for demonstration purposes

### Knock-out Verification
✅ Requirements are suitable for backend development

### Quality Assessment
- Overall Score: 72%
- ${mockRecommendations.length} improvement recommendations generated

### Project Summary
- Type: Backend API Service
- Key features identified
- Technical stack determined

**Timestamp**: ${new Date().toLocaleString()}`;

        setActivityLog(prev => [logEntry, ...prev]);
        setActiveTab('summary');

        setTimeout(() => {
          setShowAgentProcessing(false);
        }, 500);
      }, 3000);
    } else if (currentProvider === '') {
      // Model not loaded yet
      setShowAgentProcessing(false);
      alert('Please wait for the LLM model selection to load, or select a model from the dropdown.');
      return;
    } else {
      // Use real backend APIs
      try {
        // Step 1: Knock-out verification
        setTimeout(() => {
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'active' } : agent
          ));
        }, 500);

        const verifyResponse = await fetch('http://localhost:8000/requirements/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirements })
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();

          if (!verifyData.is_suitable) {
            // Requirements not suitable for backend
            setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
            alert(`Requirements are not suitable for backend development.\n\n${verifyData.feedback}`);
            setShowAgentProcessing(false);
            return;
          }

          // Step 2: Run assessment and summary in parallel
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'completed' } :
            { ...agent, status: 'active' }
          ));

          const assessResponse = await fetch('http://localhost:8000/requirements/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirements })
          });

          if (assessResponse.ok) {
            const data = await assessResponse.json();

            // Update quality scores
            if (data.assessment) {
              if (data.assessment.overall) {
                setOverallScore(Math.round(data.assessment.overall));
              }

              if (data.assessment.scores) {
                const scores = data.assessment.scores;
                const newMetrics: QualityMetric[] = [
                  { name: 'Clarity', value: scores.clarity || 0, color: scores.clarity >= 70 ? 'green' : 'orange' },
                  { name: 'Completeness', value: scores.completeness || 0, color: scores.completeness >= 70 ? 'green' : 'orange' },
                  { name: 'Consistency', value: scores.consistency || 0, color: scores.consistency >= 70 ? 'green' : 'orange' },
                  { name: 'Verifiability', value: scores.verifiability || 0, color: scores.verifiability >= 70 ? 'green' : 'orange' },
                  { name: 'Feasibility', value: scores.feasibility || 0, color: scores.feasibility >= 70 ? 'green' : 'orange' },
                  { name: 'Traceability', value: scores.traceability || 0, color: scores.traceability >= 70 ? 'green' : 'orange' },
                  { name: 'Modifiability', value: scores.modifiability || 0, color: scores.modifiability >= 70 ? 'green' : 'orange' },
                  { name: 'Prioritization', value: scores.prioritization || 0, color: scores.prioritization >= 70 ? 'green' : 'orange' },
                  { name: 'Unambiguity', value: scores.unambiguity || 0, color: scores.unambiguity >= 70 ? 'green' : 'orange' },
                  { name: 'Correctness', value: scores.correctness || 0, color: scores.correctness >= 70 ? 'green' : 'orange' },
                  { name: 'Understandability', value: scores.understandability || 0, color: scores.understandability >= 70 ? 'green' : 'orange' },
                  { name: 'Achievability', value: scores.achievability || 0, color: scores.achievability >= 70 ? 'green' : 'orange' },
                  { name: 'Relevance', value: scores.relevance || 0, color: scores.relevance >= 70 ? 'green' : 'orange' },
                ];
                setQualityMetrics(newMetrics);
              }
            }

            // Set recommendations
            if (data.improvements && data.improvements.recommendations) {
              setRecommendations(data.improvements.recommendations);
              setHasUsedRecommend(true); // Enable the Improve button
            }

            // Store summary
            if (data.summary) {
              setProjectSummary(JSON.stringify(data.summary, null, 2));
            }

            setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

            // Log activity
            const logEntry = `## Requirements Analysis Complete [REAL LLM]

### Provider Used: ${llmProviders.find(m => m.id === currentProvider)?.name || currentProvider}
✅ Real AI-powered analysis completed

### Knock-out Verification
✅ Requirements are suitable for backend development
- Confidence: ${verifyData.confidence}%
- Type: ${verifyData.type_detected}

### Quality Assessment
- Overall Score: ${data.assessment?.overall || 0}%
- ${data.improvements?.recommendations?.length || 0} improvement recommendations generated

### Project Summary
- Type: ${data.summary?.projectType || 'Backend Service'}
- ${data.summary?.keyFeatures?.length || 0} key features identified

**Timestamp**: ${new Date().toLocaleString()}`;

            setActivityLog(prev => [logEntry, ...prev]);
            setActiveTab('summary');

            setTimeout(() => {
              setShowAgentProcessing(false);
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error in initial analysis:', error);
        setShowAgentProcessing(false);
        alert(`Failed to analyze requirements using ${currentProvider}.\n\nError: ${error}\n\nPlease check:\n1. Backend is running on port 8000\n2. Your API key is configured\n3. Or switch to "Mock Data (No API)" mode`);
      }
    }
  };

  const handleSendQuestion = async () => {
    if (userQuestion.trim()) {
      // Store the question before clearing
      const questionToSend = userQuestion;

      // Add user message to chat immediately
      const userMessage: ChatMessage = {
        message_id: `user-${Date.now()}`,
        session_id: chatSession?.session_id || '',
        sender: 'user',
        content: questionToSend,
        timestamp: new Date().toISOString(),
        message_type: 'answer'
      };
      setChatMessages(prev => [...prev, userMessage]);
      setUserQuestion('');

      // Initialize chat if not connected and get client
      let client = chatClient;
      if (!chatConnected && !chatLoading) {
        client = await initializeChat(1); // Returns the client directly
      }

      // Send to backend
      if (client) {
        client.sendMessage(questionToSend);
        console.log('Message sent:', questionToSend);
      } else {
        console.log('Chat client not available, message lost:', questionToSend);
      }
    }
  };

  const handleRecommend = async () => {
    if (!requirementsContent) return;

    // Set up agents for processing
    const agents = [
      { name: 'Quality Assessment Agent', description: 'Analyzing requirements quality and completeness', status: 'waiting' as const },
      { name: 'Improvement Suggestion Agent', description: 'Generating specific improvement recommendations', status: 'waiting' as const }
    ];

    setProcessingAgents(agents);
    setShowAgentProcessing(true);

    // Check if we should use mock data or real API
    if (currentProvider === 'fallback') {
      // Use frontend mock implementation
      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'active' } : agent
        ));
      }, 500);

      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'completed' } :
          idx === 1 ? { ...agent, status: 'active' } : agent
        ));
      }, 2000);

      setTimeout(() => {
        setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

        // Generate sample recommendations
        const sampleRecommendations = [
          {
            category: 'Clarity',
            issue: '[MOCK] Some requirements could be more specific',
            suggestion: '[MOCK] Add specific acceptance criteria for each feature'
          },
          {
            category: 'Completeness',
            issue: '[MOCK] Missing error handling specifications',
            suggestion: '[MOCK] Define error response formats and status codes'
          },
          {
            category: 'Traceability',
            issue: '[MOCK] Requirements lack unique identifiers',
            suggestion: '[MOCK] Add requirement IDs for better tracking'
          }
        ];
        console.log('⚠️ USING MOCK RECOMMENDATIONS - NOT FROM LLM');

        setRecommendations(sampleRecommendations);
        setHasUsedRecommend(true);
        setActiveTab('recommendations');

        setTimeout(() => {
          setShowAgentProcessing(false);
        }, 500);
      }, 3500);
    } else if (currentProvider === '') {
      // Model not loaded yet
      setShowAgentProcessing(false);
      alert('Please wait for the LLM model selection to load, or select a model from the dropdown.');
      return;
    } else {
      // Use real backend API
      console.log('================== REAL LLM RECOMMENDATION REQUEST ==================');
      console.log('Provider:', currentProvider);
      console.log('Model:', llmProviders.find(m => m.id === currentProvider)?.name || currentProvider);
      console.log('Endpoint: http://localhost:8000/requirements/assess');
      console.log('Requirements length:', requirementsContent.length, 'characters');
      console.log('=====================================================================');

      try {
        // Start processing animation
        setTimeout(() => {
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'active' } : agent
          ));
        }, 500);

        // Call the assessment endpoint
        console.log('🚀 Sending request to backend API...');
        const response = await fetch('http://localhost:8000/requirements/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirements: requirementsContent })
        });

        console.log('📡 Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ REAL LLM RESPONSE RECEIVED:', data);

          // Update agents status
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'completed' } :
            idx === 1 ? { ...agent, status: 'active' } : agent
          ));

          // Extract recommendations from improvements
          if (data.improvements && data.improvements.recommendations) {
            console.log('🎯 REAL LLM RECOMMENDATIONS FOUND:');
            console.log('Number of recommendations:', data.improvements.recommendations.length);
            data.improvements.recommendations.forEach((rec: any, idx: number) => {
              console.log(`Recommendation ${idx + 1}:`, rec);
            });
            setRecommendations(data.improvements.recommendations);
          } else {
            console.log('⚠️ No recommendations in LLM response');
          }

          // Update quality scores if available
          if (data.assessment) {
            if (data.assessment.overall) {
              setOverallScore(Math.round(data.assessment.overall));
            }

            // Update individual quality metrics
            if (data.assessment.scores) {
              const scores = data.assessment.scores;
              const newMetrics: QualityMetric[] = [
                { name: 'Clarity', value: scores.clarity || 0, color: scores.clarity >= 70 ? 'green' : 'orange' },
                { name: 'Completeness', value: scores.completeness || 0, color: scores.completeness >= 70 ? 'green' : 'orange' },
                { name: 'Consistency', value: scores.consistency || 0, color: scores.consistency >= 70 ? 'green' : 'orange' },
                { name: 'Verifiability', value: scores.verifiability || 0, color: scores.verifiability >= 70 ? 'green' : 'orange' },
                { name: 'Feasibility', value: scores.feasibility || 0, color: scores.feasibility >= 70 ? 'green' : 'orange' },
                { name: 'Traceability', value: scores.traceability || 0, color: scores.traceability >= 70 ? 'green' : 'orange' },
                { name: 'Modifiability', value: scores.modifiability || 0, color: scores.modifiability >= 70 ? 'green' : 'orange' },
                { name: 'Prioritization', value: scores.prioritization || 0, color: scores.prioritization >= 70 ? 'green' : 'orange' },
                { name: 'Unambiguity', value: scores.unambiguity || 0, color: scores.unambiguity >= 70 ? 'green' : 'orange' },
                { name: 'Correctness', value: scores.correctness || 0, color: scores.correctness >= 70 ? 'green' : 'orange' },
                { name: 'Understandability', value: scores.understandability || 0, color: scores.understandability >= 70 ? 'green' : 'orange' },
                { name: 'Achievability', value: scores.achievability || 0, color: scores.achievability >= 70 ? 'green' : 'orange' },
                { name: 'Relevance', value: scores.relevance || 0, color: scores.relevance >= 70 ? 'green' : 'orange' },
              ];
              setQualityMetrics(newMetrics);
            }
          }

          // Store the full assessment data
          if (data.summary) {
            setProjectSummary(JSON.stringify(data.summary, null, 2));
          }

          setTimeout(() => {
            setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
            setHasUsedRecommend(true);
            setActiveTab('recommendations');
            setShowAgentProcessing(false);
          }, 1000);
        } else {
          throw new Error('Failed to get recommendations');
        }
      } catch (error) {
        console.error('Error calling backend:', error);
        alert(`Failed to get recommendations using ${currentProvider}.\n\nError: ${error}\n\nPlease check:\n1. Backend is running on port 8000\n2. Your API key is configured\n3. Or switch to "Mock Data (No API)" mode`);
        setShowAgentProcessing(false);
      }
    }
  };

  const handleGeneratePlan = async () => {
    if (!requirementsContent) return;

    // Set up agent for plan generation
    const agents = [
      { name: 'Implementation Planning Agent', description: 'Creating detailed implementation plan', status: 'waiting' as const }
    ];

    setProcessingAgents(agents);
    setShowAgentProcessing(true);

    if (currentProvider === 'fallback') {
      // Use frontend mock implementation
      setTimeout(() => {
        setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'active' })));
      }, 500);

      setTimeout(() => {
        setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

        // Generate sample plan following the 6-step process
        const samplePlan = `## Implementation Plan - 6-Step SDLC Process

### Step 1: Setup (Bootstrap & Requirements) - Week 1
**Duration:** 3-5 days
**Tasks:**
- Analyze and refine requirements document
- Set up project repository and structure
- Configure development environment
- Define acceptance criteria
- Create project documentation structure

### Step 2: APIs (OpenAPI Specification) - Week 1-2
**Duration:** 3-4 days
**Tasks:**
- Design RESTful API endpoints
- Create OpenAPI 3.0 specification
- Define request/response schemas
- Document authentication methods
- Set up API versioning strategy

### Step 3: Model (Logical Data Model) - Week 2
**Duration:** 2-3 days
**Tasks:**
- Design entity-relationship diagram
- Define data entities and attributes
- Establish relationships and constraints
- Create data validation rules
- Document data flow patterns

### Step 4: Schema (Database Schema) - Week 2-3
**Duration:** 2-3 days
**Tasks:**
- Generate SQL schema from data model
- Create migration scripts
- Set up indexes for performance
- Implement database constraints
- Configure backup strategy

### Step 5: Logic (Business Logic) - Week 3-4
**Duration:** 5-7 days
**Tasks:**
- Implement service layer architecture
- Code business rules and validations
- Create data access layer
- Implement error handling
- Add logging and monitoring

### Step 6: Tests (Testing & Release) - Week 4
**Duration:** 3-5 days
**Tasks:**
- Write unit tests (80% coverage target)
- Create integration test suite
- Perform security testing
- Set up CI/CD pipeline
- Deploy to staging and production

**Total Timeline:** 4 weeks
**Team Size:** 2-3 developers
**Deliverables:** Fully tested and deployed backend service`;

        setImplementationPlan(samplePlan);
        setActiveTab('plan');

        setTimeout(() => {
          setShowAgentProcessing(false);
        }, 500);
      }, 2500);
    } else {
      // Use real backend API
      try {
        setTimeout(() => {
          setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'active' })));
        }, 500);

        const response = await fetch('http://localhost:8000/requirements/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirements: requirementsContent })
        });

        if (response.ok) {
          const data = await response.json();

          setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

          if (data.plan) {
            setImplementationPlan(data.plan);
            setActiveTab('plan');
          }

          setTimeout(() => {
            setShowAgentProcessing(false);
          }, 500);
        } else {
          throw new Error('Failed to generate plan');
        }
      } catch (error) {
        console.error('Error calling backend:', error);
        alert('Failed to generate plan. Please check if the backend is running.');
        setShowAgentProcessing(false);
      }
    }
  };

  const handleYolo = async () => {
    if (!requirementsContent) return;

    const cycleNumber = yoloCycle + 1;
    setYoloCycle(cycleNumber);

    // Set up agents for YOLO cycle
    const agents = [
      { name: 'Quality Assessment Agent', description: 'Analyzing requirements quality', status: 'waiting' as const },
      { name: 'Improvement Implementation Agent', description: 'Applying improvements automatically', status: 'waiting' as const },
      { name: 'Re-assessment Agent', description: 'Evaluating improved requirements', status: 'waiting' as const },
      { name: 'Summary Generation Agent', description: 'Generating project summary', status: 'waiting' as const }
    ];

    setProcessingAgents(agents);
    setShowAgentProcessing(true);

    if (currentProvider === 'fallback') {
      // Use frontend mock implementation for YOLO

    // Step 1: Quality Assessment
    setTimeout(() => {
      setProcessingAgents(prev => prev.map((agent, idx) =>
        idx === 0 ? { ...agent, status: 'active' } : agent
      ));
    }, 500);

    // Step 2: Improvement Implementation
    setTimeout(() => {
      setProcessingAgents(prev => prev.map((agent, idx) =>
        idx === 0 ? { ...agent, status: 'completed' } :
        idx === 1 ? { ...agent, status: 'active' } : agent
      ));
    }, 1500);

    // Step 3: Re-assessment
    setTimeout(() => {
      setProcessingAgents(prev => prev.map((agent, idx) =>
        idx <= 1 ? { ...agent, status: 'completed' } :
        idx === 2 ? { ...agent, status: 'active' } : agent
      ));
    }, 2500);

    // Step 4: Summary Generation
    setTimeout(() => {
      setProcessingAgents(prev => prev.map((agent, idx) =>
        idx <= 2 ? { ...agent, status: 'completed' } :
        idx === 3 ? { ...agent, status: 'active' } : agent
      ));
    }, 3500);

    // Complete cycle and update scores
    setTimeout(() => {
      setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

      // Calculate new quality score (simulate improvement)
      const previousScore = qualityScores[qualityScores.length - 1];
      const improvement = Math.min(8, Math.floor(Math.random() * 5 + 3)); // 3-8 points improvement
      const newScore = Math.min(100, previousScore + improvement);

      setQualityScores(prev => [...prev, newScore]);
      setOverallScore(newScore);

      // Generate improved recommendations
      const improvedRecommendations = [
        {
          category: 'Performance',
          issue: 'Response time requirements not specified',
          suggestion: 'Add specific latency targets (e.g., < 200ms)'
        },
        {
          category: 'Security',
          issue: 'Authentication method not detailed',
          suggestion: 'Specify OAuth2/JWT implementation details'
        }
      ];
      setRecommendations(improvedRecommendations);

      // Generate summary
      const summary = `## YOLO Cycle ${cycleNumber} Summary

### Quality Improvement
- Previous Score: ${previousScore}%
- Current Score: ${newScore}%
- Improvement: +${newScore - previousScore}%

### Automated Improvements Applied
- Enhanced requirement clarity
- Added missing acceptance criteria
- Improved technical specifications
- Standardized formatting

### Key Achievements
- ${improvedRecommendations.length} critical issues addressed
- Requirements completeness increased
- Technical debt reduced

### Next Steps
- ${newScore < 90 ? 'Run another YOLO cycle for further improvements' : 'Requirements are ready for implementation'}`;

      setActivityLog(prev => [summary, ...prev]);
      setActiveTab('log');

      setTimeout(() => {
        setShowAgentProcessing(false);
      }, 500);
    }, 4500);
    } else {
      // Use real backend API for YOLO (combining assess + implement improvements)
      (async () => {
        try {
          // Step 1: Quality Assessment
          setTimeout(() => {
            setProcessingAgents(prev => prev.map((agent, idx) =>
              idx === 0 ? { ...agent, status: 'active' } : agent
            ));
          }, 500);

          // First, assess the requirements
          const assessResponse = await fetch('http://localhost:8000/requirements/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirements: requirementsContent })
          });

          if (!assessResponse.ok) throw new Error('Assessment failed');
          const assessData = await assessResponse.json();

          // Step 2: Improvement Implementation
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'completed' } :
            idx === 1 ? { ...agent, status: 'active' } : agent
          ));

          // Apply improvements if recommendations exist
          if (assessData.improvements && assessData.improvements.recommendations) {
            const improveResponse = await fetch('http://localhost:8000/requirements/implement-improvements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requirements: requirementsContent,
                improvements: assessData.improvements
              })
            });

            if (improveResponse.ok) {
              const improveData = await improveResponse.json();

              // Step 3: Re-assessment
              setProcessingAgents(prev => prev.map((agent, idx) =>
                idx <= 1 ? { ...agent, status: 'completed' } :
                idx === 2 ? { ...agent, status: 'active' } : agent
              ));

              // Update requirements
              if (improveData.improved_requirements) {
                setRequirementsContent(improveData.improved_requirements);
              }

              // Step 4: Summary Generation
              setTimeout(() => {
                setProcessingAgents(prev => prev.map((agent, idx) =>
                  idx <= 2 ? { ...agent, status: 'completed' } :
                  idx === 3 ? { ...agent, status: 'active' } : agent
                ));
              }, 500);

              const previousScore = qualityScores[qualityScores.length - 1];
              const newScore = improveData.new_assessment ? Math.round(improveData.new_assessment.overall) : Math.min(100, previousScore + 15);
              setOverallScore(newScore);
              setQualityScores(prev => [...prev, newScore]);

              // Generate summary
              const summary = `## YOLO Cycle ${cycleNumber} Summary

### Quality Improvement
- Previous Score: ${previousScore}%
- Current Score: ${newScore}%
- Improvement: +${newScore - previousScore}%

### Automated Improvements Applied
${improveData.changes_made ? improveData.changes_made.map((change: string) => `- ${change}`).join('\n') : '- Enhanced requirement clarity\n- Added missing acceptance criteria\n- Improved technical specifications'}

### Next Steps
- ${newScore < 90 ? 'Run another YOLO cycle for further improvements' : 'Requirements are ready for implementation'}

**Timestamp**: ${new Date().toLocaleString()}`;

              setActivityLog(prev => [summary, ...prev]);
              setRecommendations([]);
              setActiveTab('log');

              setTimeout(() => {
                setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
                setShowAgentProcessing(false);
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Error in YOLO cycle:', error);
          alert('YOLO cycle failed. Please check if the backend is running.');
          setShowAgentProcessing(false);
        }
      })();
    }
  };

  const handleImprove = async () => {
    if (!requirementsContent || !recommendations.length) return;

    // Set up agent for improvement implementation
    const agents = [
      { name: 'Requirements Enhancement Agent', description: 'Applying improvements to requirements', status: 'waiting' as const },
      { name: 'Quality Re-assessment Agent', description: 'Re-analyzing improved requirements', status: 'waiting' as const }
    ];

    setProcessingAgents(agents);
    setShowAgentProcessing(true);

    if (currentProvider === 'fallback') {
      // Use frontend mock implementation
      // Step 1: Enhancement
      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'active' } : agent
        ));
      }, 500);

      // Step 2: Re-assessment
      setTimeout(() => {
        setProcessingAgents(prev => prev.map((agent, idx) =>
          idx === 0 ? { ...agent, status: 'completed' } :
          idx === 1 ? { ...agent, status: 'active' } : agent
        ));
      }, 2000);

      // Complete and show results
      setTimeout(() => {
        setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));

        // Simulate improved requirements
        const improvedRequirements = requirementsContent + '\n\n## Improvements Applied:\n' +
          recommendations.map(rec => `- ${rec.category}: ${rec.suggestion}`).join('\n');

        setRequirementsContent(improvedRequirements);

      // Generate improvement summary
      const improvementSummary = `## Improvement Applied Successfully

### Improvements Implemented
${recommendations.map(rec => `- **${rec.category}**: ${rec.suggestion}`).join('\n')}

### Impact on Requirements
- Enhanced clarity and specificity
- Added measurable acceptance criteria
- Improved technical specifications
- Better alignment with best practices

### Quality Score Impact
- Previous Score: ${overallScore}%
- Estimated New Score: ${Math.min(100, overallScore + 10)}%
- Improvement: +10%

### Next Steps
1. Review the updated requirements in the Requirements tab
2. Run "Recommend" again to check for additional improvements
3. Generate an implementation plan using the "Plan" button
4. Proceed with development when satisfied

**Timestamp**: ${new Date().toLocaleString()}`;

      setActivityLog(prev => [improvementSummary, ...prev]);

      // Update quality score
      const newScore = Math.min(100, overallScore + 10);
      setOverallScore(newScore);
      setQualityScores(prev => [...prev, newScore]);

      // Clear recommendations since they've been applied
      setRecommendations([]);
      setHasUsedRecommend(false);

      // Switch to log tab to show what was done
      setActiveTab('log');

        setTimeout(() => {
          setShowAgentProcessing(false);
        }, 500);
      }, 3000);
    } else {
      // Use real backend API
      try {
        // Step 1: Enhancement animation
        setTimeout(() => {
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'active' } : agent
          ));
        }, 500);

        // Set a timeout for the modal (185 seconds, slightly longer than fetch timeout)
        const modalTimeout = setTimeout(() => {
          console.warn('Improvement process timed out');
          alert('The improvement process is taking longer than expected. Please try again.');
          setShowAgentProcessing(false);
        }, TIMEOUTS.improvementModal);

        // Call the implement improvements endpoint with timeout (180 seconds)
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), TIMEOUTS.improvementFetch);
        
        const response = await fetch('http://localhost:8000/requirements/implement-improvements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirements: requirementsContent,
            improvements: { recommendations }
          }),
          signal: controller.signal
        });
        
        clearTimeout(fetchTimeout);
        clearTimeout(modalTimeout);

        if (response.ok) {
          const data = await response.json();

          // Step 2: Re-assessment animation
          setProcessingAgents(prev => prev.map((agent, idx) =>
            idx === 0 ? { ...agent, status: 'completed' } :
            idx === 1 ? { ...agent, status: 'active' } : agent
          ));

          // Update requirements with improved version
          if (data.improved_requirements) {
            setRequirementsContent(data.improved_requirements);
          }

          // Update quality score if available
          if (data.new_assessment && data.new_assessment.overall) {
            setOverallScore(Math.round(data.new_assessment.overall));
          }

          // Generate improvement summary
          const improvementSummary = `## Improvement Applied Successfully

### Improvements Implemented
${data.changes_made ? data.changes_made.map((change: string) => `- ${change}`).join('\n') : recommendations.map(rec => `- **${rec.category}**: ${rec.suggestion}`).join('\n')}

### Quality Score Impact
- Previous Score: ${overallScore}%
- New Score: ${data.new_assessment ? Math.round(data.new_assessment.overall) : Math.min(100, overallScore + 10)}%
- Improvement: +${data.new_assessment ? Math.round(data.new_assessment.overall) - overallScore : 10}%

### Next Steps
1. Review the updated requirements in the Requirements tab
2. Run "Recommend" again to check for additional improvements
3. Generate an implementation plan using the "Plan" button

**Timestamp**: ${new Date().toLocaleString()}`;

          setActivityLog(prev => [improvementSummary, ...prev]);

          setTimeout(() => {
            setProcessingAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
            setRecommendations([]);
            setHasUsedRecommend(false);
            setActiveTab('log');
            setShowAgentProcessing(false);
          }, 1000);
        } else {
          throw new Error('Failed to apply improvements');
        }
      } catch (error: any) {
        console.error('Error calling backend:', error);
        if (error.name === 'AbortError') {
          alert('Request timed out. The improvement process is taking too long. Please try again.');
        } else {
          alert('Failed to apply improvements. Please check if the backend is running.');
        }
        setShowAgentProcessing(false);
      }
    }
  };

  // Step-specific handler functions for forms 2-6
  const handleStepRecommend = async (step: number) => {
    setProcessing(true);

    try {
      // Get context based on step
      let context = '';
      let operation = '';

      switch(step) {
        case 2: // APIs
          context = requirementsContent;
          operation = 'generate_api_specification';
          break;
        case 3: // Model
          context = stepData[2]?.apiSpec || '';
          operation = 'generate_data_model';
          break;
        case 4: // Schema
          context = stepData[3]?.dataModel || '';
          operation = 'generate_database_schema';
          break;
        case 5: // Logic
          context = `${stepData[2]?.apiSpec || ''}\n${stepData[4]?.schema || ''}`;
          operation = 'generate_business_logic';
          break;
        case 6: // Tests
          context = stepData[5]?.businessLogic || '';
          operation = 'generate_test_suite';
          break;
      }

      if (currentProvider === 'fallback') {
        // Mock implementation
        setTimeout(() => {
          const mockRecommendations = [
            {
              category: 'Structure',
              issue: `[MOCK] Step ${step} structure could be improved`,
              suggestion: `[MOCK] Apply best practices for step ${step}`
            },
            {
              category: 'Completeness',
              issue: `[MOCK] Missing elements in step ${step}`,
              suggestion: `[MOCK] Add missing components for step ${step}`
            }
          ];

          setRecommendations(mockRecommendations);
          handleStepDataChange(step, 'recommendations', mockRecommendations);

          const logEntry = `✅ **Recommendations Generated for Step ${step}**\n_${new Date().toLocaleTimeString()}_\n[MOCK DATA]`;
          setActivityLog(prev => [logEntry, ...prev]);
        }, 1500);
      } else {
        // Real API call
        const response = await fetch('http://localhost:8000/requirements/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirements: context,
            step,
            operation
          })
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
          handleStepDataChange(step, 'recommendations', data.recommendations || []);

          const logEntry = `✅ **Recommendations Generated for Step ${step}**\n_${new Date().toLocaleTimeString()}_`;
          setActivityLog(prev => [logEntry, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert(`Failed to generate recommendations for step ${step}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleStepImprove = async (step: number) => {
    if (!recommendations.length) return;

    setProcessing(true);

    try {
      const artifact = stepData[step]?.artifact || stepData[step]?.apiSpec ||
                      stepData[step]?.dataModel || stepData[step]?.schema ||
                      stepData[step]?.businessLogic || stepData[step]?.testSuite || '';

      if (currentProvider === 'fallback') {
        // Mock implementation
        setTimeout(() => {
          const improvedArtifact = `${artifact}\n// [MOCK] Improvements applied based on recommendations`;

          // Update the appropriate field based on step
          switch(step) {
            case 2:
              handleStepDataChange(step, 'apiSpec', improvedArtifact);
              break;
            case 3:
              handleStepDataChange(step, 'dataModel', improvedArtifact);
              break;
            case 4:
              handleStepDataChange(step, 'schema', improvedArtifact);
              break;
            case 5:
              handleStepDataChange(step, 'businessLogic', improvedArtifact);
              break;
            case 6:
              handleStepDataChange(step, 'testSuite', improvedArtifact);
              break;
          }

          // Clear recommendations after applying
          setRecommendations([]);
          handleStepDataChange(step, 'recommendations', []);

          // Update quality score
          setOverallScore(prev => Math.min(100, prev + 10));

          const logEntry = `✅ **Improvements Applied for Step ${step}**\n_${new Date().toLocaleTimeString()}_\n[MOCK DATA]`;
          setActivityLog(prev => [logEntry, ...prev]);
        }, 1500);
      } else {
        // Real API call
        const response = await fetch('http://localhost:8000/requirements/implement-improvements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirements: artifact,
            improvements: { recommendations },
            step
          })
        });

        if (response.ok) {
          const data = await response.json();
          const improvedArtifact = data.improved_requirements || artifact;

          // Update the appropriate field based on step
          switch(step) {
            case 2:
              handleStepDataChange(step, 'apiSpec', improvedArtifact);
              break;
            case 3:
              handleStepDataChange(step, 'dataModel', improvedArtifact);
              break;
            case 4:
              handleStepDataChange(step, 'schema', improvedArtifact);
              break;
            case 5:
              handleStepDataChange(step, 'businessLogic', improvedArtifact);
              break;
            case 6:
              handleStepDataChange(step, 'testSuite', improvedArtifact);
              break;
          }

          // Clear recommendations after applying
          setRecommendations([]);
          handleStepDataChange(step, 'recommendations', []);

          // Update quality score
          if (data.new_assessment) {
            setOverallScore(Math.round(data.new_assessment.overall));
          }

          const logEntry = `✅ **Improvements Applied for Step ${step}**\n_${new Date().toLocaleTimeString()}_`;
          setActivityLog(prev => [logEntry, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error applying improvements:', error);
      alert(`Failed to apply improvements for step ${step}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleStepYOLO = async (step: number) => {
    let iterations = 0;
    const maxIterations = 5;
    const targetScore = 85;

    setProcessing(true);

    try {
      // First check if artifact exists, if not generate it
      if (!hasArtifact(step)) {
        const logEntry = `🚀 **YOLO Starting - Generating initial artifact for Step ${step}**\n_${new Date().toLocaleTimeString()}_`;
        setActivityLog(prev => [logEntry, ...prev]);
        await handleGenerate(step);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      while (iterations < maxIterations) {
        // Generate recommendations
        await handleStepRecommend(step);

        // Wait a bit for recommendations to be set
        await new Promise(resolve => setTimeout(resolve, 500));

        // Only improve if recommendations exist
        if (recommendations.length > 0) {
          await handleStepImprove(step);
        }

        // Check if score is good enough
        if (overallScore >= targetScore) {
          const logEntry = `🎯 **YOLO Complete for Step ${step}** - Score: ${overallScore}%\n_${new Date().toLocaleTimeString()}_`;
          setActivityLog(prev => [logEntry, ...prev]);
          break;
        }

        iterations++;
      }

      if (iterations >= maxIterations) {
        const logEntry = `⚠️ **YOLO Reached Max Iterations for Step ${step}** - Final Score: ${overallScore}%\n_${new Date().toLocaleTimeString()}_`;
        setActivityLog(prev => [logEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error in YOLO cycle:', error);
      alert(`YOLO cycle failed for step ${step}`);
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to check if artifact exists for a step
  const hasArtifact = (step: number): boolean => {
    switch(step) {
      case 2: return !!stepData[2]?.apiSpec && stepData[2].apiSpec.trim() !== '';
      case 3: return !!stepData[3]?.dataModel && stepData[3].dataModel.trim() !== '';
      case 4: return !!stepData[4]?.schema && stepData[4].schema.trim() !== '';
      case 5: return !!stepData[5]?.businessLogic && stepData[5].businessLogic.trim() !== '';
      case 6: return !!stepData[6]?.testSuite && stepData[6].testSuite.trim() !== '';
      default: return false;
    }
  };

  // Generate artifact handler for steps 2-6
  const handleGenerate = async (step: number) => {
    setProcessing(true);

    try {
      // Get input context based on step
      let input = '';
      let operation = '';

      switch(step) {
        case 2: // Generate API from requirements
          input = requirementsContent;
          operation = 'generateApi';
          break;
        case 3: // Generate Model from API
          input = stepData[2]?.apiSpec || '';
          operation = 'generateDataModel';
          break;
        case 4: // Generate Schema from Model
          input = stepData[3]?.dataModel || '';
          operation = 'generateDatabaseSchema';
          break;
        case 5: // Generate Logic from API + Schema
          input = `API: ${stepData[2]?.apiSpec || ''}\n\nSchema: ${stepData[4]?.schema || ''}`;
          operation = 'generateBusinessLogic';
          break;
        case 6: // Generate Tests from Logic
          input = stepData[5]?.businessLogic || '';
          operation = 'generateTestSuite';
          break;
      }

      if (currentProvider === 'fallback') {
        // Mock implementation
        setTimeout(() => {
          let mockArtifact = '';
          switch(step) {
            case 2:
              mockArtifact = `openapi: 3.0.0
info:
  title: Generated API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
    post:
      summary: Create user
[MOCK DATA]`;
              handleStepDataChange(2, 'apiSpec', mockArtifact);
              break;
            case 3:
              mockArtifact = `// Data Model
entities:
  - User
  - Session
  - Role
[MOCK DATA]`;
              handleStepDataChange(3, 'dataModel', mockArtifact);
              break;
            case 4:
              mockArtifact = `-- Database Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE
);
[MOCK DATA]`;
              handleStepDataChange(4, 'schema', mockArtifact);
              break;
            case 5:
              mockArtifact = `// Business Logic
class UserService {
  async createUser() { }
  async getUser() { }
}
[MOCK DATA]`;
              handleStepDataChange(5, 'businessLogic', mockArtifact);
              break;
            case 6:
              mockArtifact = `// Test Suite
describe('UserService', () => {
  it('should create user', () => { });
});
[MOCK DATA]`;
              handleStepDataChange(6, 'testSuite', mockArtifact);
              break;
          }

          const logEntry = `✅ **Generated Artifact for Step ${step}**\n_${new Date().toLocaleTimeString()}_\n[MOCK DATA]`;
          setActivityLog(prev => [logEntry, ...prev]);
        }, 1500);
      } else {
        // Real API call
        const response = await fetch('http://localhost:8000/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input,
            step,
            operation
          })
        });

        if (response.ok) {
          const data = await response.json();
          const artifact = data.artifact || data.result || '';

          // Store the generated artifact
          switch(step) {
            case 2:
              handleStepDataChange(2, 'apiSpec', artifact);
              break;
            case 3:
              handleStepDataChange(3, 'dataModel', artifact);
              break;
            case 4:
              handleStepDataChange(4, 'schema', artifact);
              break;
            case 5:
              handleStepDataChange(5, 'businessLogic', artifact);
              break;
            case 6:
              handleStepDataChange(6, 'testSuite', artifact);
              break;
          }

          const logEntry = `✅ **Generated Artifact for Step ${step}**\n_${new Date().toLocaleTimeString()}_`;
          setActivityLog(prev => [logEntry, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error generating artifact:', error);
      alert(`Failed to generate artifact for step ${step}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleNext = async () => {
    if (!requirementsContent) {
      alert('Please upload requirements first.');
      return;
    }

    if (!implementationPlan) {
      // Inform user and generate plan
      if (confirm('A plan is required to proceed. Would you like to generate one now?')) {
        handleGeneratePlan();
      }
      return;
    }

    // Proceed to next step
    console.log('Proceeding to next step with plan:', implementationPlan);
    setCurrentStep(2);  // Move to Step 2: APIs
    handleStepComplete(1);  // Mark Step 1 as complete
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-sm border-b border-white/10 mb-4 -m-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-white">Galaxy SDLC</h1>
            <span className="text-white/70">•</span>
            <span className="text-white/70 text-sm">Backend Creation Agent</span>
          </div>

          {/* Process Steps - Equal width for all steps */}
          <div className="flex items-center">
            {processSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 cursor-pointer"
                style={{ width: '100px' }}
                onClick={() => {
                  // Simply set the current step - no restrictions for now
                  setCurrentStep(step.id);
                  const logEntry = `🔄 **Navigated to Step ${step.id}: ${step.name}**\n_${new Date().toLocaleTimeString()}_`;
                  setActivityLog(prev => [logEntry, ...prev]);
                }}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                  stepCompleted[step.id]
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white/60 hover:bg-white/30'
                }`}>
                  {stepCompleted[step.id] ? '✓' : step.id}
                </div>
                <span className={`text-xs font-medium ${
                  currentStep === step.id
                    ? 'text-white'
                    : stepCompleted[step.id]
                    ? 'text-green-300'
                    : 'text-white/50'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Container - Fixed Heights */}
      <div className="grid grid-cols-12 gap-4 mt-8" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Step-based Layout */}
        {currentStep === 1 ? (
          <>
        {/* STEP 1: Original Layout - Left Sidebar - Column 1-3 */}
        <div className="col-span-3 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
          {/* Project Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., payment-service"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Boilerplate Template */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Boilerplate Template *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              value={boilerplateTemplate}
              onChange={(e) => setBoilerplateTemplate(e.target.value)}
            >
              <option value="">-- Choose a template --</option>
              {boilerplateTemplates.map(template => (
                <option key={template.id} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <div className="mb-4">
            <label className="block">
              <div className={`px-4 py-2 rounded-lg text-center text-sm font-medium transition ${
                requirementsContent
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700'
              }`}>
                Upload Requirements
              </div>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                disabled={!!requirementsContent}
              />
            </label>
          </div>

          {/* Assistant Section - Fills remaining space */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
            {/* Header - Only this part is colored */}
            <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
              <h3 className="text-white font-semibold text-sm">Assistant</h3>
            </div>

            {/* Message Area - Expands to fill space */}
            <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
              <div className="space-y-2">
                {chatMessages.length === 0 ? (
                  <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                    {chatConnected
                      ? "Hello! I can help you improve your requirements. Ask me anything!"
                      : (chatLoading
                        ? "Connecting to assistant..."
                        : "Hello. I'll ask my questions here.")}
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-100 text-blue-800 ml-8'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      {message.content}
                      {message.options && message.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.options.map((option, optIndex) => (
                            <button
                              key={optIndex}
                              onClick={() => {
                                setUserQuestion(option);
                                setTimeout(handleSendQuestion, 100);
                              }}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ask a question..."
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                />
                <button
                  onClick={handleSendQuestion}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content - Expanded width */}
        <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {['Summary', 'Requirements', 'Process Workflows', 'Advice', 'Plan', 'Boilerplate', 'Activity Log'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab === 'Activity Log' ? 'log' : (tab === 'Process Workflows' ? 'process workflows' : tab.toLowerCase()) as any)}
                className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                  activeTab === (tab === 'Activity Log' ? 'log' : (tab === 'Process Workflows' ? 'process workflows' : tab.toLowerCase()))
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content - Fixed Height with Scroll */}
          <div className="flex-grow overflow-y-auto p-6" style={{ maxHeight: 'calc(100% - 48px)' }}>
            {activeTab === 'requirements' && (
              requirementsContent ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                      ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">{children}</ol>,
                      li: ({children}) => <li className="ml-4">{children}</li>,
                      p: ({children}) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                      code: ({inline, children}) => 
                        inline ? 
                        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">{children}</code> :
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>{children}</code></pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                      hr: () => <hr className="my-6 border-gray-300" />,
                      table: ({children}) => <table className="min-w-full divide-y divide-gray-200 mb-4">{children}</table>,
                      thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                      tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                      th: ({children}) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
                      td: ({children}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>,
                    }}
                  >
                    {requirementsContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No requirements loaded</p>
                  <p className="text-sm">Upload a requirements file to get started</p>
                </div>
              )
            )}

            {activeTab === 'summary' && (
              requirementsContent ? (
                projectSummary ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Project Summary</h2>
                    {(() => {
                      try {
                        const summary = typeof projectSummary === 'string'
                          ? JSON.parse(projectSummary)
                          : projectSummary;
                        return (
                          <div className="space-y-6">
                            {/* Project Type & Overview */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-2">Project Type</h3>
                              <p className="text-gray-700">{summary.projectType}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                              <p className="text-gray-700">{summary.overview}</p>
                            </div>

                            {/* Key Features */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                              <ul className="space-y-2">
                                {summary.keyFeatures?.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    <span className="text-gray-700">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Technical Stack */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-3">Technical Stack</h3>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(summary.technicalStack || {}).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-600 capitalize">{key}:</span>
                                    <span className="ml-2 text-gray-900">{value as string}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Deliverables */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-3">Deliverables</h3>
                              <ul className="space-y-2">
                                {summary.deliverables?.map((deliverable: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      } catch (e) {
                        // Fallback to raw display if not valid JSON
                        return (
                          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                            {projectSummary}
                          </pre>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Project Summary</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm">
                        Analyzing requirements... Please wait.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No requirements uploaded</p>
                  <p className="text-sm">Please upload requirements first to see the summary</p>
                </div>
              )
            )}

            {activeTab === 'process workflows' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Process Workflows</h3>
                  <button
                    onClick={createNewWorkflow}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    + New Workflow
                  </button>
                </div>
                <div className="space-y-3">
                  {plantUmlWorkflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-800">{workflow.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {workflow.content.split('\n').length} lines
                          </p>
                        </div>
                        <button
                          onClick={() => openWorkflowEditor(workflow)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  {plantUmlWorkflows.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No workflows created yet.</p>
                      <button
                        onClick={createNewWorkflow}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Create your first workflow
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              requirementsContent ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-indigo-600 mb-2">{rec.category}</h3>
                          <p className="text-sm text-red-600 mb-2">
                            <span className="font-medium">Issue:</span> {rec.issue}
                          </p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Suggestion:</span> {rec.suggestion}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>How to apply improvements:</strong> Click the "Improve" button to apply these recommendations to your requirements.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm">
                        Click "Recommend" button to analyze requirements and generate recommendations.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No requirements uploaded</p>
                  <p className="text-sm">Please upload requirements first to get recommendations</p>
                </div>
              )
            )}

            {activeTab === 'plan' && (
              requirementsContent ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Implementation Plan</h2>
                  {implementationPlan ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">{implementationPlan}</pre>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm">
                        Click "Plan" button to generate an implementation plan based on your requirements.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No requirements uploaded</p>
                  <p className="text-sm">Please upload requirements first to generate a plan</p>
                </div>
              )
            )}

            {activeTab === 'boilerplate' && (
              (() => {
                const selectedTemplate = getBoilerplateByName(boilerplateTemplate);
                return selectedTemplate ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Boilerplate Template</h2>

                    {/* Template Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 font-medium">Selected Template: {selectedTemplate.name}</p>
                          <p className="text-sm text-blue-700 mt-1">Path: {selectedTemplate.path}</p>
                        </div>
                      </div>
                    </div>

                    {/* README Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">README Documentation</h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        {loadingReadme ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading README.md...</span>
                            </div>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                            {boilerplateReadme}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No boilerplate selected</p>
                  <p className="text-sm">Select a boilerplate template from the dropdown</p>
                </div>
                );
              })()
            )}

            {activeTab === 'log' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
                {activityLog.length > 0 ? (
                  <div className="space-y-3">
                    {activityLog.map((entry, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{entry}</pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Getting Started:</strong><br/>
                      • Run <strong>YOLO</strong> to automatically analyze, improve, and assess your requirements in cycles<br/>
                      • Or use <strong>Recommend → Review → Improve</strong> for manual control over improvements<br/>
                      • All activities will be logged here for your reference
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Reduced width */}
        <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 flex flex-col h-full">
          {/* Quality Score */}
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <span className="text-3xl font-bold text-white">{overallScore}%</span>
            </div>
          </div>

          {/* Quality Metrics - Scrollable - Takes up remaining space */}
          <div className="flex-grow overflow-y-auto mb-4">
            <div className="space-y-1">
              {qualityMetrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 truncate">{metric.name}</span>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ml-2 ${
                    metric.value >= 70 ? 'bg-green-500' :
                    metric.value >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {metric.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - At the bottom */}
          <div className="mt-auto space-y-2">
            <button
              disabled={!requirementsContent}
              onClick={handleYolo}
              className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                requirementsContent
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              YOLO {yoloCycle > 0 && `(Cycle ${yoloCycle})`}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={!requirementsContent}
                onClick={handleRecommend}
                className={`py-3 rounded-lg transition font-medium text-sm ${
                  requirementsContent
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Advise
              </button>
              <button
                disabled={recommendations.length === 0}
                onClick={handleImprove}
                className={`py-3 rounded-lg transition font-medium text-sm ${
                  recommendations.length > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>

            <button
              disabled={!implementationPlan}
              onClick={() => {
                setCurrentStep(2);
                handleStepComplete(1);
              }}
              className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                implementationPlan
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Generate Plan
            </button>

            <button
              disabled={!requirementsContent}
              onClick={handleNext}
              className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                requirementsContent
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>

          {/* Model Selector - At the very bottom */}
          <div className="mt-4 pt-3 border-t">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              value={currentProvider}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={loadingModels}
            >
              {loadingModels ? (
                <option>Loading models...</option>
              ) : (
                <>
                  {currentProvider === '' && <option value="">Select a model...</option>}
                  {llmProviders.map(provider => (
                    <option
                      key={provider.value}
                      value={provider.value}
                      disabled={!provider.available}
                    >
                      {provider.label} {!provider.available && '(Not Available)'}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
          </>
        ) : (
          // STEPS 2-6: Different layouts for each step
          <>
            {currentStep === 2 && (
              <>
                {/* Step 2: APIs - Left Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Project Name - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={projectName || 'No project name'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Boilerplate Selected - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Boilerplate Selected
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={boilerplateTemplate || 'No template selected'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Upload API Specification Button */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="px-4 py-2 rounded-lg text-center text-sm font-medium bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                        Upload API Specification
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".yaml,.yml,.json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              handleStepDataChange(2, 'apiSpec', content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Assistant Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
                    <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
                      <h3 className="text-white font-semibold text-sm">Assistant</h3>
                    </div>
                    <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                        I can help you design your API endpoints.
                      </div>
                    </div>
                    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask about API design..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: APIs - Center Panel with Tabs */}
                <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    {['API Endpoints', 'API Specification', 'Requirements', 'Advice', 'Activity Log'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleStepDataChange(2, 'activeTab', tab)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                          (stepData[2]?.activeTab || 'API Specification') === tab
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      + ' ' + 'text-[10px]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      + ' ' + 'text-[10px]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto p-6">
                    {(stepData[2]?.activeTab || 'API Specification') === 'API Endpoints' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">GET /users - List all users</div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">POST /users - Create new user</div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">GET /users/:id - Get user by ID</div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">PUT /users/:id - Update user</div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">DELETE /users/:id - Delete user</div>
                      </div>
                    )}

                    {(stepData[2]?.activeTab || 'API Specification') === 'API Specification' && (
                      <textarea
                        className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                        placeholder="OpenAPI 3.0 specification will appear here..."
                        value={stepData[2]?.apiSpec || ''}
                        onChange={(e) => handleStepDataChange(2, 'apiSpec', e.target.value)}
                      />
                    )}

                    {(stepData[2]?.activeTab || 'API Specification') === 'Requirements' && (
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                        {requirementsContent || 'No requirements loaded'}
                      </pre>
                    )}

                    {(stepData[2]?.activeTab || 'API Specification') === 'Advice' && (
                      <div className="space-y-4">
                        {recommendations.length > 0 ? (
                          <>
                            <h3 className="text-lg font-semibold text-gray-800">API Recommendations</h3>
                            {recommendations.map((rec, index) => (
                              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 text-lg">💡</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.category}</h4>
                                    <p className="text-sm text-gray-600 mb-2">Issue: {rec.issue}</p>
                                    <p className="text-sm text-gray-700">Suggestion: {rec.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No recommendations available.</p>
                            <p className="text-sm text-gray-400">Please use Recommend to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(stepData[2]?.activeTab || 'API Specification') === 'Activity Log' && (
                      <div className="space-y-3">
                        {activityLog.length > 0 ? (
                          activityLog.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities logged yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: APIs - Right Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Quality Score Section - Always show, 0% when not assessed */}
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                      <span className="text-3xl font-bold text-white">{stepData[2]?.score || 0}%</span>
                    </div>
                  </div>

                  {/* Spacer - Takes up remaining space */}
                  <div className="flex-grow"></div>

                  {/* Action Buttons Section - At the bottom */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerate(2)}
                      disabled={processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Generate API
                    </button>

                    <button
                      onClick={() => handleStepYOLO(2)}
                      disabled={!hasArtifact(2) || processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        !hasArtifact(2) || processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      YOLO
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStepRecommend(2)}
                        disabled={!hasArtifact(2) || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(2) || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Advise
                      </button>
                      <button
                        onClick={() => handleStepImprove(2)}
                        disabled={!hasArtifact(2) || !recommendations.length || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(2) || !recommendations.length || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Model Selector - At the very bottom */}
                  <div className="mt-4 pt-3 border-t">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      value={currentProvider}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="fallback">Mock Data (No API)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                {/* Step 3: Model - Left Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Project Name - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={projectName || 'No project name'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Database Type - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={stepData[3]?.databaseType || 'PostgreSQL'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Upload Data Model Button */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="px-4 py-2 rounded-lg text-center text-sm font-medium bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                        Upload Data Model
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".json,.yaml,.yml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              handleStepDataChange(3, 'dataModel', content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Assistant Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
                    <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
                      <h3 className="text-white font-semibold text-sm">Assistant</h3>
                    </div>
                    <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                        I can help you design your data model and entity relationships.
                      </div>
                    </div>
                    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask about data modeling..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Model - Center Panel with Tabs */}
                <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    {['Entities', 'Data Model', 'Requirements', 'Advice', 'Activity Log'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleStepDataChange(3, 'activeTab', tab)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                          (stepData[3]?.activeTab || 'Data Model') === tab
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      + ' ' + 'text-[10px]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      + ' ' + 'text-[10px]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto p-6">
                    {(stepData[3]?.activeTab || 'Data Model') === 'Entities' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Entity List</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">User Entity</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Session Entity</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Role Entity</div>
                        </div>
                      </div>
                    )}

                    {(stepData[3]?.activeTab || 'Data Model') === 'Data Model' && (
                      <textarea
                        className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                        placeholder="Logical data model will appear here..."
                        value={stepData[3]?.dataModel || ''}
                        onChange={(e) => handleStepDataChange(3, 'dataModel', e.target.value)}
                      />
                    )}

                    {(stepData[3]?.activeTab || 'Data Model') === 'Requirements' && (
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                        {requirementsContent || 'No requirements loaded'}
                      </pre>
                    )}

                    {(stepData[3]?.activeTab || 'Data Model') === 'Advice' && (
                      <div className="space-y-4">
                        {recommendations.length > 0 ? (
                          <>
                            <h3 className="text-lg font-semibold text-gray-800">Model Recommendations</h3>
                            {recommendations.map((rec, index) => (
                              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 text-lg">💡</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.category}</h4>
                                    <p className="text-sm text-gray-600 mb-2">Issue: {rec.issue}</p>
                                    <p className="text-sm text-gray-700">Suggestion: {rec.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No recommendations available.</p>
                            <p className="text-sm text-gray-400">Please use Recommend to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(stepData[3]?.activeTab || 'Data Model') === 'Activity Log' && (
                      <div className="space-y-3">
                        {activityLog.length > 0 ? (
                          activityLog.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities logged yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Model - Right Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Quality Score Section - Only show if artifact exists */}
                  {hasArtifact(3) && (
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">{stepData[3]?.score || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Spacer - Takes up remaining space */}
                  <div className="flex-grow"></div>

                  {/* Action Buttons Section - At the bottom */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerate(3)}
                      disabled={processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Generate Model
                    </button>

                    <button
                      onClick={() => handleStepYOLO(3)}
                      disabled={!hasArtifact(3) || processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        !hasArtifact(3) || processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      YOLO
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStepRecommend(3)}
                        disabled={!hasArtifact(3) || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(3) || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Advise
                      </button>
                      <button
                        onClick={() => handleStepImprove(3)}
                        disabled={!hasArtifact(3) || !recommendations.length || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(3) || !recommendations.length || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Model Selector - At the very bottom */}
                  <div className="mt-4 pt-3 border-t">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      value={currentProvider}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="fallback">Mock Data (No API)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                {/* Step 4: Schema - Left Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Project Name - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={projectName || 'No project name'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Database Type - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={stepData[4]?.databaseType || 'PostgreSQL'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Upload Schema Button */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="px-4 py-2 rounded-lg text-center text-sm font-medium bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                        Upload Schema
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".sql,.ddl"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              handleStepDataChange(4, 'schema', content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Assistant Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
                    <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
                      <h3 className="text-white font-semibold text-sm">Assistant</h3>
                    </div>
                    <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                        I can help you design your database schema and migrations.
                      </div>
                    </div>
                    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask about database schema..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Schema - Center Panel with Tabs */}
                <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    {['Tables', 'Schema SQL', 'Migrations', 'PlantUML Schemas', 'Advice', 'Activity Log'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleStepDataChange(4, 'activeTab', tab)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                          (stepData[4]?.activeTab || 'Schema SQL') === tab
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      + ' ' + 'text-[10px]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      + ' ' + 'text-[10px]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto p-6">
                    {(stepData[4]?.activeTab || 'Schema SQL') === 'Tables' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Database Tables</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">users table</div>
                          <div className="p-3 bg-gray-50 rounded-lg">sessions table</div>
                          <div className="p-3 bg-gray-50 rounded-lg">roles table</div>
                          <div className="p-3 bg-gray-50 rounded-lg">user_roles table</div>
                        </div>
                      </div>
                    )}

                    {(stepData[4]?.activeTab || 'Schema SQL') === 'Schema SQL' && (
                      <textarea
                        className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                        placeholder="SQL schema will appear here..."
                        value={stepData[4]?.schema || ''}
                        onChange={(e) => handleStepDataChange(4, 'schema', e.target.value)}
                      />
                    )}

                    {(stepData[4]?.activeTab || 'Schema SQL') === 'Migrations' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Database Migrations</h3>
                        <pre className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                          {stepData[4]?.migrations || 'No migrations generated yet'}
                        </pre>
                      </div>
                    )}

                    {(stepData[4]?.activeTab || 'Schema SQL') === 'PlantUML Schemas' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-800">PlantUML Database Schemas</h3>
                          <button
                            onClick={createNewSchema}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                          >
                            + New Schema
                          </button>
                        </div>
                        <div className="space-y-3">
                          {plantUmlSchemas.map((schema) => (
                            <div key={schema.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold text-gray-800">{schema.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {schema.content.split('\n').length} lines
                                  </p>
                                </div>
                                <button
                                  onClick={() => openSchemaEditor(schema)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          ))}
                          {plantUmlSchemas.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-gray-500 mb-2">No schemas created yet.</p>
                              <button
                                onClick={createNewSchema}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                Create your first schema
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(stepData[4]?.activeTab || 'Schema SQL') === 'Advice' && (
                      <div className="space-y-4">
                        {recommendations.length > 0 ? (
                          <>
                            <h3 className="text-lg font-semibold text-gray-800">Schema Recommendations</h3>
                            {recommendations.map((rec, index) => (
                              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 text-lg">💡</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.category}</h4>
                                    <p className="text-sm text-gray-600 mb-2">Issue: {rec.issue}</p>
                                    <p className="text-sm text-gray-700">Suggestion: {rec.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No recommendations available.</p>
                            <p className="text-sm text-gray-400">Please use Recommend to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(stepData[4]?.activeTab || 'Schema SQL') === 'Activity Log' && (
                      <div className="space-y-3">
                        {activityLog.length > 0 ? (
                          activityLog.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities logged yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4: Schema - Right Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Quality Score Section - Only show if artifact exists */}
                  {hasArtifact(4) && (
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">{stepData[4]?.score || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Spacer - Takes up remaining space */}
                  <div className="flex-grow"></div>

                  {/* Action Buttons Section - At the bottom */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerate(4)}
                      disabled={processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Generate Schema
                    </button>

                    <button
                      onClick={() => handleStepYOLO(4)}
                      disabled={!hasArtifact(4) || processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        !hasArtifact(4) || processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      YOLO
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStepRecommend(4)}
                        disabled={!hasArtifact(4) || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(4) || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Advise
                      </button>
                      <button
                        onClick={() => handleStepImprove(4)}
                        disabled={!hasArtifact(4) || !recommendations.length || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(4) || !recommendations.length || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Model Selector - At the very bottom */}
                  <div className="mt-4 pt-3 border-t">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      value={currentProvider}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="fallback">Mock Data (No API)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 5 && (
              <>
                {/* Step 5: Logic - Left Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Project Name - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={projectName || 'No project name'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Framework - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Framework
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={stepData[5]?.framework || 'FastAPI'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Upload Business Logic Button */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="px-4 py-2 rounded-lg text-center text-sm font-medium bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                        Upload Business Logic
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".py,.js,.ts,.java"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              handleStepDataChange(5, 'businessLogic', content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Assistant Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
                    <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
                      <h3 className="text-white font-semibold text-sm">Assistant</h3>
                    </div>
                    <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                        I can help you implement business logic and services.
                      </div>
                    </div>
                    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask about business logic..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5: Logic - Center Panel with Tabs */}
                <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    {['Services', 'Business Logic', 'Business Rules', 'Advice', 'Activity Log'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleStepDataChange(5, 'activeTab', tab)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                          (stepData[5]?.activeTab || 'Business Logic') === tab
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      + ' ' + 'text-[10px]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      + ' ' + 'text-[10px]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto p-6">
                    {(stepData[5]?.activeTab || 'Business Logic') === 'Services' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Service Components</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">UserService</div>
                          <div className="p-3 bg-gray-50 rounded-lg">AuthService</div>
                          <div className="p-3 bg-gray-50 rounded-lg">SessionService</div>
                          <div className="p-3 bg-gray-50 rounded-lg">EmailService</div>
                        </div>
                      </div>
                    )}

                    {(stepData[5]?.activeTab || 'Business Logic') === 'Business Logic' && (
                      <textarea
                        className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                        placeholder="Service layer code will appear here..."
                        value={stepData[5]?.businessLogic || ''}
                        onChange={(e) => handleStepDataChange(5, 'businessLogic', e.target.value)}
                      />
                    )}

                    {(stepData[5]?.activeTab || 'Business Logic') === 'Business Rules' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Business Rules</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">• Password minimum 8 characters</div>
                          <div className="p-3 bg-gray-50 rounded-lg">• Email verification required</div>
                          <div className="p-3 bg-gray-50 rounded-lg">• Session timeout 24 hours</div>
                          <div className="p-3 bg-gray-50 rounded-lg">• Maximum 5 login attempts</div>
                        </div>
                      </div>
                    )}

                    {(stepData[5]?.activeTab || 'Business Logic') === 'Advice' && (
                      <div className="space-y-4">
                        {recommendations.length > 0 ? (
                          <>
                            <h3 className="text-lg font-semibold text-gray-800">Logic Recommendations</h3>
                            {recommendations.map((rec, index) => (
                              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 text-lg">💡</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.category}</h4>
                                    <p className="text-sm text-gray-600 mb-2">Issue: {rec.issue}</p>
                                    <p className="text-sm text-gray-700">Suggestion: {rec.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No recommendations available.</p>
                            <p className="text-sm text-gray-400">Please use Recommend to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(stepData[5]?.activeTab || 'Business Logic') === 'Activity Log' && (
                      <div className="space-y-3">
                        {activityLog.length > 0 ? (
                          activityLog.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities logged yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 5: Logic - Right Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Quality Score Section - Only show if artifact exists */}
                  {hasArtifact(5) && (
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">{stepData[5]?.score || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Spacer - Takes up remaining space */}
                  <div className="flex-grow"></div>

                  {/* Action Buttons Section - At the bottom */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerate(5)}
                      disabled={processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Generate Logic
                    </button>

                    <button
                      onClick={() => handleStepYOLO(5)}
                      disabled={!hasArtifact(5) || processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        !hasArtifact(5) || processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      YOLO
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStepRecommend(5)}
                        disabled={!hasArtifact(5) || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(5) || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Advise
                      </button>
                      <button
                        onClick={() => handleStepImprove(5)}
                        disabled={!hasArtifact(5) || !recommendations.length || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(5) || !recommendations.length || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(6)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Model Selector - At the very bottom */}
                  <div className="mt-4 pt-3 border-t">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      value={currentProvider}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="fallback">Mock Data (No API)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 6 && (
              <>
                {/* Step 6: Tests - Left Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Project Name - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={projectName || 'No project name'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Test Framework - Not Editable */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Framework
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      value={stepData[6]?.testFramework || 'pytest'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Upload Test Suite Button */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="px-4 py-2 rounded-lg text-center text-sm font-medium bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                        Upload Test Suite
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".py,.js,.ts,.java"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              handleStepDataChange(6, 'testSuite', content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Assistant Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col">
                    <div className="bg-indigo-600 px-4 py-2 flex-shrink-0">
                      <h3 className="text-white font-semibold text-sm">Assistant</h3>
                    </div>
                    <div className="bg-gray-50 p-4 flex-grow overflow-y-auto">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                        I can help you write comprehensive test suites.
                      </div>
                    </div>
                    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask about testing..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 6: Tests - Center Panel with Tabs */}
                <div className="col-span-7 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    {['Test Suites', 'Test Code', 'Coverage', 'Advice', 'Activity Log'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleStepDataChange(6, 'activeTab', tab)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-medium transition ${
                          (stepData[6]?.activeTab || 'Test Code') === tab
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      + ' ' + 'text-[10px]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      + ' ' + 'text-[10px]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto p-6">
                    {(stepData[6]?.activeTab || 'Test Code') === 'Test Suites' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Test Categories</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">Unit Tests</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Integration Tests</div>
                          <div className="p-3 bg-gray-50 rounded-lg">End-to-End Tests</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Performance Tests</div>
                        </div>
                      </div>
                    )}

                    {(stepData[6]?.activeTab || 'Test Code') === 'Test Code' && (
                      <textarea
                        className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                        placeholder="Test code will appear here..."
                        value={stepData[6]?.testSuite || ''}
                        onChange={(e) => handleStepDataChange(6, 'testSuite', e.target.value)}
                      />
                    )}

                    {(stepData[6]?.activeTab || 'Test Code') === 'Coverage' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Test Coverage Report</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">Overall Coverage: 0%</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Lines Covered: 0/0</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Functions Covered: 0/0</div>
                          <div className="p-3 bg-gray-50 rounded-lg">Branches Covered: 0/0</div>
                        </div>
                      </div>
                    )}

                    {(stepData[6]?.activeTab || 'Test Code') === 'Advice' && (
                      <div className="space-y-4">
                        {recommendations.length > 0 ? (
                          <>
                            <h3 className="text-lg font-semibold text-gray-800">Testing Recommendations</h3>
                            {recommendations.map((rec, index) => (
                              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 text-lg">💡</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.category}</h4>
                                    <p className="text-sm text-gray-600 mb-2">Issue: {rec.issue}</p>
                                    <p className="text-sm text-gray-700">Suggestion: {rec.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No recommendations available.</p>
                            <p className="text-sm text-gray-400">Please use Recommend to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(stepData[6]?.activeTab || 'Test Code') === 'Activity Log' && (
                      <div className="space-y-3">
                        {activityLog.length > 0 ? (
                          activityLog.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities logged yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 6: Tests - Right Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                  {/* Quality Score Section - Only show if artifact exists */}
                  {hasArtifact(6) && (
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Quality Score</h3>
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">{stepData[6]?.score || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Spacer - Takes up remaining space */}
                  <div className="flex-grow"></div>

                  {/* Action Buttons Section - At the bottom */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerate(6)}
                      disabled={processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Generate Tests
                    </button>

                    <button
                      onClick={() => handleStepYOLO(6)}
                      disabled={!hasArtifact(6) || processing}
                      className={`w-full py-3 rounded-lg transition font-medium text-sm ${
                        !hasArtifact(6) || processing
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      YOLO
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStepRecommend(6)}
                        disabled={!hasArtifact(6) || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(6) || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Advise
                      </button>
                      <button
                        onClick={() => handleStepImprove(6)}
                        disabled={!hasArtifact(6) || !recommendations.length || processing}
                        className={`py-3 rounded-lg transition font-medium text-sm ${
                          !hasArtifact(6) || !recommendations.length || processing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => alert('Project Complete!')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        Finish
                      </button>
                    </div>
                  </div>

                  {/* Model Selector - At the very bottom */}
                  <div className="mt-4 pt-3 border-t">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      value={currentProvider}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="fallback">Mock Data (No API)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Agent Processing Modal */}
      {showAgentProcessing && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 min-w-[450px] p-8">
            {/* Close button */}
            <button
              onClick={() => setShowAgentProcessing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">AI Agents Processing</h3>
              <p className="text-sm text-gray-600 mt-2">Multiple specialized agents are analyzing your requirements</p>
            </div>

            <div className="space-y-3">
              {processingAgents.map((agent, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    agent.status === 'active'
                      ? 'bg-blue-50 border-blue-300'
                      : agent.status === 'completed'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="mr-4">
                    {agent.status === 'waiting' && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                    {agent.status === 'active' && (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    )}
                    {agent.status === 'completed' && (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* PlantUML Editor Modal */}
      {showPlantUmlEditor && currentSchema && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-7xl max-h-screen overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editorType === 'schema' ? 'Edit PlantUML Schema' : 'Edit Process Workflow'}
                </h2>
                <input
                  type="text"
                  value={currentSchema.name}
                  onChange={(e) => setCurrentSchema({...currentSchema, name: e.target.value})}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
                  placeholder="Schema name"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveSchema(currentSchema.id, currentSchema.name, currentSchema.content)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setCurrentSchema(null);
                    setShowPlantUmlEditor(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Modal Content - Split Pane */}
            <div className="flex h-full">
              {/* Left Pane - Editor */}
              <div className="w-1/2 border-r flex flex-col">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium text-gray-700">{editorType === 'schema' ? 'PlantUML Source' : 'Workflow Source'}</h3>
                </div>
                <div className="flex-1 p-0">
                  <textarea
                    value={currentSchema.content}
                    onChange={(e) => setCurrentSchema({...currentSchema, content: e.target.value})}
                    className="w-full h-full p-4 border-0 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={editorType === 'schema' ? "Enter PlantUML code here..." : "Enter workflow PlantUML code here..."}
                  />
                </div>
              </div>

              {/* Right Pane - Preview */}
              <div className="w-1/2 flex flex-col">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium text-gray-700">Diagram Preview</h3>
                </div>
                <div className="flex-1 p-4 overflow-auto bg-gray-50">
                  {currentSchema.content.trim() ? (
                    <div className="flex justify-center">
                      <img
                        src={generatePlantUMLUrl(currentSchema.content)}
                        alt="PlantUML Diagram"
                        className="max-w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const errorDiv = (e.target as HTMLImageElement).parentElement?.querySelector('.error-message');
                          if (!errorDiv) {
                            const error = document.createElement('div');
                            error.className = 'error-message text-red-600 text-sm p-4 bg-red-50 rounded border border-red-200';
                            error.textContent = 'Error rendering PlantUML diagram. Please check your syntax.';
                            (e.target as HTMLImageElement).parentElement?.appendChild(error);
                          }
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                          const errorDiv = (e.target as HTMLImageElement).parentElement?.querySelector('.error-message');
                          if (errorDiv) {
                            errorDiv.remove();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">Enter PlantUML code to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};