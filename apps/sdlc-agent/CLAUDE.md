# Galaxy SDLC Agent - Claude Documentation

## Project Overview
SDLC (Software Development Life Cycle) automation tool with 6-step workflow for generating backend applications.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5175)
- **Backend**: FastAPI Python (port 8000) 
- **Workflow Engine**: Temporal (port 7233)
- **Main Component**: `/src/components/GalaxySDLC.tsx`

## Key Features
1. **6-Step SDLC Process**: Setup → APIs → Model → Schema → Logic → Tests
2. **Requirements Management**: Assess, improve, and validate requirements
3. **Quality Scoring**: Automated assessment of requirements quality
4. **LLM Integration**: Model selector for backend processing

## Workflow Details

### Step 1: Setup (Bootstrap & Requirements)
- Load boilerplate templates
- Input requirements document
- Actions: YOLO, Recommend, Improve, Generate Plan, Next

### Step 2: APIs (OpenAPI Specification)
- Generate OpenAPI specs from requirements
- **Issue**: Generate API button incorrectly disabled when artifacts exist

### Step 3: Model (Logical Data Model)
- Create logical data models based on APIs

### Step 4: Schema (Database Schema)
- Generate database schemas from models

### Step 5: Logic (Business Logic)
- Implement business logic layer

### Step 6: Tests (Testing & Release)
- Generate tests and prepare for release

### Temporal Workflows
- **SDLCWorkflow**: Main orchestrator for 6-step process
- **RequirementsAssessmentWorkflow**: Evaluates requirements quality
- **RequirementsImprovementWorkflow**: Iteratively improves requirements
- **InteractiveDialogWorkflow**: Q&A based requirements refinement (backend exists, frontend not integrated)

## Known Issues

### 1. LLM Selector Stuck on "Loading models..."
- **Problem**: `/models` endpoint returns 200 but hangs/never sends data
- **Location**: Backend endpoint implementation missing or broken
- **Frontend**: Lines 74-93 in GalaxySDLC.tsx try to load models on mount
- **Status**: NOT FIXED - Backend endpoint needs implementation

### 2. Generate API Button Incorrectly Disabled
- **Problem**: Button disabled when artifacts already exist
- **Expected**: Should be enabled to allow regeneration
- **Location**: Step 2 (APIs) in GalaxySDLC.tsx
- **Status**: NOT INVESTIGATED

### 3. Quality Score Display Inconsistency  
- **Problem**: Sometimes shows 0%, sometimes doesn't show at all
- **Expected**: Should always show 0% when not assessed
- **Location**: Requirements display component
- **Status**: NOT INVESTIGATED

## How to Run

### Backend (from `/Users/mifo/Desktop/galaxy-governance/sdlc-agent/`)
```bash
source venv/bin/activate
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Temporal Worker
```bash
source venv/bin/activate
temporal server start-dev  # In one terminal
python -m src.temporal.worker  # In another terminal
```

### Frontend (from `/Users/mifo/Desktop/galaxy-admin-landing-page/apps/sdlc-agent/`)
```bash
npm run dev  # Runs on port 5175
```

## Important Files
- **Main UI Component**: `/src/components/GalaxySDLC.tsx`
- **Backend Main**: `/Users/mifo/Desktop/galaxy-governance/sdlc-agent/src/api/main.py`
- **Interactive Dialog API**: `/Users/mifo/Desktop/galaxy-governance/sdlc-agent/src/api/interactive_dialog_endpoints.py`
- **Test Requirements**: `/tmp/test_requirements.txt`

## Testing Commands
```bash
# Test with Playwright
mcp__playwright__browser_navigate http://localhost:5175

# Check backend health
curl http://localhost:8000/health

# List API endpoints  
curl http://localhost:8000/docs
```

## User's Priority Issues (NOT COMPLETED)
1. Fix Generate API button being disabled when it shouldn't be
2. Make quality scores consistently show 0% when not assessed  
3. Add Markdown support for Requirements display
4. Test full 6-step SDLC workflow with Playwright

## DO NOT
- Add features not requested (like Interactive Assistant button)
- Change working functionality without explicit request
- Create unnecessary files or documentation
- Make changes without creating backup first

## Git Status
- Repo is initialized
- Can restore with: `git checkout HEAD -- filename`
- Check changes with: `git status`

## Notes for Next Session
- The LLM selector issue is a backend problem, not frontend
- The system was working before unnecessary changes were made
- User is frustrated with time/money wasted on fixing self-created problems
- Focus ONLY on the specific issues reported, nothing else