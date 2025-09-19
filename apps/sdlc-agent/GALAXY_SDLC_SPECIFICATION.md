# Galaxy SDLC Agent - Technical Specification

## 1. Executive Summary

### 1.1 Current State
Galaxy SDLC Agent is a workflow automation tool for generating backend applications through a 6-step Software Development Life Cycle process. Currently operating as a local development tool with React frontend and FastAPI backend, integrated with Temporal workflow engine.

### 1.2 Target Vision
Transform into a full SaaS platform offering automated code generation for backend applications, supporting multiple programming languages, frameworks, and deployment targets. Enable teams to go from requirements to production-ready code in hours instead of weeks.

### 1.3 Key Differentiators
- **AI-Powered Requirements Analysis**: Automatic quality assessment and improvement
- **Multi-Language Support**: Generate code in Rust, Python, Go, Node.js, Java
- **Complete SDLC Coverage**: From requirements to deployed application
- **Interactive Refinement**: AI assistant for requirement clarification
- **Enterprise-Ready**: Temporal-based workflows for reliability and scalability

## 2. Current Implementation

### 2.1 Architecture

#### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Port**: 5175

#### Backend Stack
- **Framework**: FastAPI (Python)
- **Workflow Engine**: Temporal
- **LLM Integration**: OpenAI/Anthropic APIs
- **Port**: 8000
- **Worker Port**: Temporal on 7233

#### Current File Structure
```
/galaxy-admin-landing-page/apps/sdlc-agent/
├── src/
│   ├── components/
│   │   ├── GalaxySDLC.tsx (main UI - 4000+ lines)
│   │   └── SDLCLanding.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── boilerplateService.ts
│   │   └── ChatClient.ts
│   └── config/
│       ├── app.config.ts
│       └── boilerplates.ts
└── .env (configuration)

/galaxy-governance/sdlc-agent/
├── src/
│   ├── api/
│   │   ├── main.py
│   │   └── interactive_dialog_endpoints.py
│   └── temporal/
│       └── worker.py
```

### 2.2 Working Features

#### Requirements Management
- **Upload**: Support for .txt file upload
- **Quality Assessment**:
  - 13 metrics (Clarity, Completeness, Consistency, etc.)
  - Scoring algorithm with color-coded visualization
  - Overall quality percentage
- **Recommendations**: AI-generated improvement suggestions
- **Improvement Workflow**: Automatic requirements enhancement
- **Mock Mode**: Fallback UI demonstration mode

#### UI/UX Components
- **Step Navigation**: 6-step horizontal progress bar
- **Tab System**: Multiple views per step
- **Activity Log**: Real-time process tracking
- **Agent Processing**: Visual feedback for AI operations
- **PlantUML Editor**: Workflow and schema diagram creation

#### Backend Endpoints (Functional)
```
POST /requirements/assess - Quality assessment
POST /requirements/verify - Knock-out verification
POST /requirements/implement-improvements - Apply improvements
POST /requirements/plan - Generate development plan
POST /generate - Code generation (partial)
GET /models - LLM model listing (broken)
POST /models/set - Model selection
```

#### Temporal Workflows
- SDLCWorkflow - Main orchestrator
- RequirementsAssessmentWorkflow - Quality evaluation
- RequirementsImprovementWorkflow - Iterative enhancement
- InteractiveDialogWorkflow - Q&A refinement (not integrated)

### 2.3 Known Issues

| Issue | Description | Impact | Location |
|-------|------------|--------|----------|
| LLM Selector Hang | `/models` endpoint returns 200 but no data | Cannot select AI model | GalaxySDLC.tsx:74-93 |
| Generate API Disabled | Button incorrectly disabled when artifacts exist | Cannot regenerate APIs | Step 2 UI logic |
| No Persistence | All data lost on page refresh | Poor UX | Entire application |
| Missing README Endpoint | `/api/boilerplate/readme` not implemented | Cannot view templates | Backend |
| Chat Not Integrated | Interactive assistant backend exists but not connected | Missing key feature | Frontend |

## 3. SDLC Process Workflow

### 3.1 Current 6-Step Process

#### Step 1: Setup (Bootstrap & Requirements)
**Purpose**: Initialize project and gather requirements
- **Input**: Requirements document (.txt file)
- **Processing**:
  - Knock-out verification (is this suitable for backend?)
  - Initial quality assessment
  - Project summary generation
- **Output**: Validated requirements, quality scores
- **Actions**: YOLO, Recommend, Improve, Generate Plan, Next

#### Step 2: APIs (OpenAPI Specification)
**Purpose**: Generate API specifications from requirements
- **Input**: Validated requirements
- **Processing**:
  - Extract API endpoints
  - Define request/response schemas
  - Generate OpenAPI 3.0 specification
- **Output**: openapi.yaml file
- **Tabs**: API Endpoints, API Specification, Requirements, Advice, Activity Log

#### Step 3: Model (Logical Data Model)
**Purpose**: Design data structures and relationships
- **Input**: API specifications
- **Processing**:
  - Identify entities
  - Define relationships
  - Create logical model
- **Output**: Entity-relationship diagrams, model definitions
- **Tabs**: Entities, Data Model, Requirements, Advice, Activity Log

#### Step 4: Schema (Database Schema)
**Purpose**: Generate database implementation
- **Input**: Logical data model
- **Processing**:
  - Convert to database tables
  - Add indexes and constraints
  - Generate migrations
- **Output**: SQL schemas, migration files
- **Tabs**: Tables, Schema SQL, Migrations, PlantUML Schemas, Advice, Activity Log

#### Step 5: Logic (Business Logic)
**Purpose**: Implement business rules and services
- **Input**: APIs, Models, Schemas
- **Processing**:
  - Generate service layers
  - Implement business rules
  - Create validation logic
- **Output**: Service implementations, business logic code
- **Tabs**: Services, Business Logic, Business Rules, Advice, Activity Log

#### Step 6: Tests (Testing & Release)
**Purpose**: Generate tests and prepare for deployment
- **Input**: All previous artifacts
- **Processing**:
  - Generate unit tests
  - Create integration tests
  - Setup CI/CD pipeline
- **Output**: Test suites, deployment configuration
- **Tabs**: Test Suites, Test Code, Coverage, Advice, Activity Log

### 3.2 Process Enhancement Opportunities

#### Automated Transitions
- Auto-advance on successful completion
- Parallel processing where possible
- Rollback capability on failures

#### Interactive Refinement
- AI chat at each step for clarification
- Real-time validation and feedback
- Suggestion system for best practices

#### Quality Gates
- Minimum score requirements per step
- Automated testing before progression
- Manual approval options for enterprise

## 4. Target SaaS Implementation

### 4.1 Planned Architecture

#### Multi-Tenant Infrastructure
```
┌─────────────────────────────────────────┐
│            Load Balancer                 │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│         API Gateway (Kong/Nginx)        │
└────────────┬────────────────────────────┘
             │
┌────────────┼────────────────────────────┐
│     Authentication Service (Auth0/Keycloak)│
└────────────┼────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│    FastAPI Application Servers (3+)     │
│    - Horizontal scaling                 │
│    - WebSocket support                  │
└────────────┬────────────────────────────┘
             │
┌────────────┼────────────────────────────┐
│      Message Queue (RabbitMQ/Kafka)     │
└────────────┼────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│     Temporal Workflow Cluster           │
│     - Multiple workers                  │
│     - Cassandra/PostgreSQL backend      │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│        Data Layer                       │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ PostgreSQL   │  │ Redis Cache     │ │
│  │ (Primary DB) │  │ (Sessions)      │ │
│  └──────────────┘  └─────────────────┘ │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ S3/MinIO     │  │ ElasticSearch   │ │
│  │ (Artifacts)  │  │ (Logs/Search)   │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

### 4.2 Database Schema

#### Core Tables
```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan_type VARCHAR(50), -- free, pro, team, enterprise
    created_at TIMESTAMP,
    settings JSONB
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    organization_id UUID REFERENCES organizations(id),
    role VARCHAR(50), -- owner, admin, developer, viewer
    created_at TIMESTAMP,
    last_login TIMESTAMP
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    quality_score FLOAT,
    status VARCHAR(50), -- draft, in_progress, completed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    metadata JSONB
);

-- Artifacts
CREATE TABLE artifacts (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    step_number INTEGER,
    artifact_type VARCHAR(50), -- api_spec, model, schema, logic, tests
    content TEXT,
    file_path VARCHAR(500),
    version INTEGER,
    created_at TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    workflow_type VARCHAR(100),
    status VARCHAR(50),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    temporal_workflow_id VARCHAR(255)
);
```

### 4.3 Feature Roadmap

#### Phase 1: Foundation (Weeks 1-2)
- [ ] User authentication (JWT/OAuth)
- [ ] Organization management
- [ ] Project CRUD operations
- [ ] Fix existing bugs
- [ ] Add data persistence

#### Phase 2: Core Features (Weeks 3-4)
- [ ] Complete code generation pipeline
- [ ] Multi-language support (Rust, Python, Go)
- [ ] Artifact storage and versioning
- [ ] Real-time collaboration
- [ ] Export functionality

#### Phase 3: Enterprise (Weeks 5-6)
- [ ] Role-based access control
- [ ] Audit logging
- [ ] SSO integration
- [ ] Custom templates
- [ ] API access

#### Phase 4: Monetization (Weeks 7-8)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage metering
- [ ] Billing portal
- [ ] Invoice generation

#### Phase 5: Scale (Weeks 9-10)
- [ ] Kubernetes deployment
- [ ] Auto-scaling
- [ ] CDN integration
- [ ] Global deployment
- [ ] Performance optimization

### 4.4 API Specifications

#### REST API Structure
```
/api/v1/
├── /auth/
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── POST /register
├── /organizations/
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /projects/
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   ├── DELETE /{id}
│   └── POST /{id}/generate
├── /artifacts/
│   ├── GET /projects/{project_id}/artifacts
│   ├── GET /{id}
│   ├── POST /
│   └── GET /{id}/download
└── /workflows/
    ├── GET /projects/{project_id}/executions
    ├── POST /execute
    └── GET /{id}/status
```

#### WebSocket Events
```
ws://api.galaxy-sdlc.com/ws/{project_id}

Events:
- workflow.started
- workflow.step.completed
- workflow.completed
- workflow.failed
- artifact.generated
- chat.message
- collaboration.update
```

## 5. Implementation Timeline

### MVP Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 1-2 | Fix Core Issues | Working LLM selector, API generation, README display |
| 3-4 | Authentication | User accounts, JWT tokens, session management |
| 5-6 | Data Persistence | PostgreSQL integration, project saving/loading |
| 7-8 | Code Generation | Complete pipeline for 2+ languages |
| 9-10 | Billing | Stripe integration, subscription tiers |
| 11-12 | Deployment | Docker containers, Kubernetes configs, CI/CD |

### Resource Requirements

#### Development Team
- 2 Full-stack developers
- 1 DevOps engineer
- 1 UI/UX designer
- 1 QA engineer

#### Infrastructure Costs (Monthly)
- **Development**: $500
  - Staging servers
  - Development databases
  - CI/CD pipeline
- **Production**: $2,000-5,000
  - Application servers
  - Database cluster
  - Temporal cluster
  - CDN and storage

## 6. Monetization Strategy

### Pricing Tiers

| Tier | Price | Features | Limits |
|------|-------|----------|--------|
| **Free** | $0 | Basic SDLC, 1 language | 3 projects/month |
| **Pro** | $49/user | All languages, priority queue | 50 projects/month |
| **Team** | $199/team | Collaboration, shared workspace | Unlimited projects |
| **Enterprise** | Custom | SSO, SLA, custom models | Unlimited |

### Revenue Projections
- **Year 1**: 1,000 paying users = $50,000 MRR
- **Year 2**: 5,000 paying users = $250,000 MRR
- **Year 3**: 20,000 paying users = $1,000,000 MRR

## 7. Technical Decisions

### Technology Choices

| Component | Current | Target | Rationale |
|-----------|---------|--------|-----------|
| Frontend | React | React/Next.js | SSR for SEO, better performance |
| Backend | FastAPI | FastAPI | Already scalable, async support |
| Database | None | PostgreSQL | Reliable, ACID compliant |
| Cache | None | Redis | Session management, caching |
| Queue | None | RabbitMQ | Reliable message delivery |
| Search | None | ElasticSearch | Log analysis, artifact search |
| Monitoring | None | Prometheus + Grafana | Industry standard |

### Security Considerations
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: JWT with refresh tokens
- **Authorization**: RBAC with fine-grained permissions
- **Compliance**: SOC2, GDPR ready architecture
- **Secrets Management**: HashiCorp Vault or AWS KMS
- **Code Scanning**: Static analysis on generated code

## 8. Risk Analysis

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM API costs | High | Implement caching, offer self-hosted option |
| Scaling Temporal | Medium | Design for horizontal scaling from start |
| Code quality | High | Extensive testing, human review option |
| Vendor lock-in | Medium | Abstract LLM providers, support multiple |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow adoption | High | Freemium model, extensive documentation |
| Competition | Medium | Focus on quality, enterprise features |
| Support burden | Medium | Self-service docs, community forum |

## 9. Success Metrics

### Technical KPIs
- **Uptime**: 99.9% SLA
- **Response Time**: <200ms p95
- **Generation Time**: <60s for full SDLC
- **Error Rate**: <0.1%

### Business KPIs
- **MRR Growth**: 20% month-over-month
- **Churn Rate**: <5% monthly
- **CAC Payback**: <12 months
- **NPS Score**: >50

### User Engagement
- **Daily Active Users**: 40% of total
- **Projects per User**: 5+ monthly
- **Completion Rate**: 80% of started projects
- **Time to Value**: <1 hour

## 10. Appendices

### A. Current Bug List
1. LLM selector hanging on load
2. Generate API button incorrectly disabled
3. Quality score display inconsistency
4. Missing backend endpoints
5. No data persistence

### B. Environment Variables
```bash
# Frontend (.env)
VITE_BACKEND_URL=http://localhost:8000
VITE_TEMPLATES_BASE_PATH=/Users/mifo/Desktop/Galaxy
VITE_RUST_ACTIX_TEMPLATE_PATH=spark

# Backend (.env)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
TEMPORAL_HOST=localhost:7233
```

### C. Development Commands
```bash
# Frontend
cd apps/sdlc-agent
npm run dev

# Backend
cd galaxy-governance/sdlc-agent
source venv/bin/activate
python -m uvicorn src.api.main:app --reload

# Temporal
temporal server start-dev
python -m src.temporal.worker
```

### D. Key Dependencies
```json
// Frontend
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0"
}

// Backend
{
  "fastapi": "^0.104.0",
  "temporalio": "^1.3.0",
  "langchain": "^0.0.340",
  "openai": "^1.3.0"
}
```

---

*Document Version: 1.0*
*Last Updated: 2024*
*Status: Living Document*