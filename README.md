# 🚀 CloudShift Radar

> **Know what will break before you migrate**

CloudShift Radar is an advanced AI-powered cloud migration assessment tool that combines static code analysis with IBM Bob AI to provide detailed, actionable recommendations for migrating legacy applications to cloud-native architectures.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.8.5-000000.svg)](https://www.fastify.io/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-orange.svg)](https://pnpm.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [What's New](#-whats-new)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Security Model](#-security-model)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Bob AI Integration](#-bob-ai-integration)
- [IBM Bob Hackathon Compliance](#-ibm-bob-hackathon-compliance)
- [Export Formats](#-export-formats)
- [MVP Limitations](#-mvp-limitations)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**CloudShift Radar** is designed for CTOs, technical leads, DevOps engineers, and development teams who need to assess the viability of migrating legacy applications to the cloud. By scanning repository code (via ZIP uploads or demo scenarios), CloudShift Radar detects infrastructure patterns, identifies potential migration blockers, and leverages IBM Bob AI to generate intelligent migration verdicts.

### Value Proposition

Traditional cloud migration assessments are time-consuming, error-prone, and often miss critical issues until deployment. CloudShift Radar provides:

- **Proactive Risk Detection**: Identify what will break before you migrate
- **AI-Powered Analysis**: IBM Bob AI analyzes technical findings and provides actionable verdicts
- **Comprehensive Scanning**: Detects 20+ cloud service patterns across AWS, GCP, and Azure
- **Migration Readiness Scoring**: Get a clear 0-100 score on migration viability
- **Feature Survival Prediction**: Understand which features will survive the migration intact
- **Progressive Validation**: Real-time validation feedback before starting analysis
- **Multiple Export Formats**: Export results in JSON, CSV, or Markdown

---

## ✨ Key Features

### 🔍 Repository Scanning
- Secure ZIP upload processing (never executes uploaded code)
- **Progressive validation** with real-time feedback
- Demo mode with pre-loaded context for quick evaluation
- Detection of 20+ cloud service patterns (AWS, GCP, Azure)
- Infrastructure pattern recognition (databases, queues, storage, etc.)
- Automatic language and framework detection

### 🤖 IBM Bob AI Integration
- Intelligent analysis of technical findings
- Context-aware migration recommendations
- Five-tier decision framework:
  - ✅ **Proceed**: Safe to migrate
  - ⚠️ **Proceed with Caution**: Manageable risks identified
  - 🛠️ **Prepare First**: Requires preparation work
  - 🚫 **Block Migration**: Critical blockers detected
  - 👤 **Requires Human Review**: Complex scenarios needing expert evaluation
- **Graceful fallback**: System continues working even if Bob is unavailable

### 📊 Interactive Dashboard
- Migration readiness scoring (0-100)
- **Unified findings view** with migration impact focus
- Feature survival predictions with detailed rationale
- Bob AI reasoning traces and confidence metrics
- Human review queue for critical items
- Actionable migration recommendations
- Technical complexity indicators

### 📤 Export Capabilities
- **JSON**: Complete structured data export
- **CSV**: Spreadsheet-compatible findings export
- **Markdown**: Human-readable report format
- Downloadable reports with project name and timestamp

### 🔒 Security-First Design
- ❌ Never executes uploaded code
- ❌ Never installs dependencies
- ❌ Never runs npm/pip/docker/shell commands
- ✅ Only reads text files
- ✅ Prevents path traversal attacks
- ✅ Strict file size limits
- ✅ Automatic secret redaction in AI prompts
- ✅ Comprehensive ZIP validation

---

## 🆕 What's New

### Recent Updates (v0.1.0)

#### ✅ Progressive Validation System
- **Separate validation endpoint** (`POST /api/scans/validate`)
- Real-time validation feedback with progress indicators
- Detailed validation errors and warnings
- Repository metadata detection (languages, frameworks, config files)
- Network error handling with retry mechanism

#### ✅ Enhanced Demo Mode
- **Cached demo results** for consistent demonstrations
- No Bobcoin consumption on repeated demo runs
- Deterministic scan IDs for reproducible results
- Fallback to saved results when Bob is unavailable

#### ✅ Improved Error Handling
- Graceful degradation when Bob AI is unavailable
- Detailed error messages with actionable guidance
- Network error detection and recovery
- Validation state management

#### ✅ Export Functionality
- Multiple export formats (JSON, CSV, Markdown)
- Comprehensive report generation
- Sanitized filenames with timestamps
- All findings and analysis included

#### ✅ Schema Enhancements
- Added `validationState`, `validationErrors`, and `canProceed` fields
- Added `technicalComplexity` to findings
- Standardized terminology across codebase
- Improved type safety with TypeScript

#### ✅ UI/UX Improvements
- Progressive CTA states with visual feedback
- Validation progress indicators
- Retry mechanism for failed validations
- Consolidated findings view with feature survival map
- Technical complexity display in findings

---

## 🏗️ Architecture

CloudShift Radar is built as a **monorepo** using pnpm workspaces, consisting of three main packages:

```
┌─────────────────────────────────────────────────────────┐
│                   CloudShift Radar                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Shared    │  │
│  │              │  │              │  │             │  │
│  │  React +     │◄─┤  Fastify API │  │  TypeScript │  │
│  │  Vite        │  │  + Scanner   │  │  Types      │  │
│  │              │  │              │  │             │  │
│  │  Port: 5173  │  │  Port: 4000  │  │             │  │
│  └──────────────┘  └──────┬───────┘  └─────────────┘  │
│                           │                            │
│                           ▼                            │
│                    ┌──────────────┐                    │
│                    │   IBM Bob    │                    │
│                    │   AI Shell   │                    │
│                    └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Components

- **Frontend**: React 18.3.1 + Vite 5.4.14 (TypeScript)
  - Interactive UI for repository upload and results visualization
  - Real-time validation and scan progress tracking
  - Comprehensive dashboard with multiple analysis views
  - Export functionality with multiple formats

- **Backend**: Fastify 5.8.5 (TypeScript)
  - RESTful API for scan and validation operations
  - Static code analysis engine
  - IBM Bob AI integration layer with fallback support
  - Secure file processing and storage
  - Export format generation

- **Shared**: Common TypeScript types and schemas
  - Ensures type safety across frontend and backend
  - Shared data models and interfaces
  - Validation schemas

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Fastify 5.8.5
- **Language**: TypeScript 5.6.3
- **ZIP Processing**: yauzl (secure extraction)
- **File Upload**: @fastify/multipart
- **AI Integration**: IBM Bob Shell CLI
- **CORS**: @fastify/cors

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.14
- **Language**: TypeScript 5.6.3
- **Styling**: Custom CSS with design tokens
- **HTTP Client**: Fetch API

### Development
- **Package Manager**: pnpm 9.15.4 (workspaces)
- **Monorepo**: pnpm workspaces
- **Type Checking**: TypeScript strict mode
- **Runtime**: tsx (development)

---

## 🔒 Security Model

CloudShift Radar follows a **zero-execution security model** to ensure uploaded code is never run:

### What We DON'T Do
- ❌ Execute uploaded code
- ❌ Install dependencies (npm, pip, etc.)
- ❌ Run shell commands from uploaded files
- ❌ Execute Docker containers
- ❌ Evaluate dynamic code

### What We DO
- ✅ Read text files only (static analysis)
- ✅ Validate ZIP structure before extraction
- ✅ Prevent path traversal attacks
- ✅ Enforce strict file size limits (1000 files max)
- ✅ Redact secrets and credentials in AI prompts
- ✅ Store results in isolated JSON files
- ✅ Validate repository structure and metadata

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (compatible with pnpm 9.15.4+)
- **pnpm** 9.15.4 or higher
- **IBM Bob Shell** (required for full AI reasoning - graceful fallback available for demos)
- **IBM Bob API Key** with Inference scope (required for Bob Shell integration)

### Installation

1. **Enable Corepack** (if not already enabled):
   ```bash
   corepack enable
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd CloudShift_Radar
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Setup IBM Bob Shell** (optional - if you have the package):
   ```bash
   pnpm setup:bob
   ```

### Configuration

1. **Copy the environment template**:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env
   
   # Linux/macOS
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials**:
   ```env
   # Bob AI Configuration (Optional - system works without it)
   BOB_PROVIDER=shell
   BOBSHELL_API_KEY=your_real_api_key_here
   
   # Bob Shell Command (choose based on your OS):
   # - Windows: Use full path or ./node_modules/.bin/bob
   # - Linux/macOS: Use 'bob' (if global) or ./node_modules/.bin/bob
   BOB_SHELL_COMMAND=./node_modules/.bin/bob
   
   BOB_TIMEOUT_MS=600000

   # Server Configuration
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Accept Bob license** (one-time setup, if using Bob):
   ```bash
   bob --accept-license -p "Test prompt"
   ```

4. **Verify Bob installation** (optional):
   ```bash
   pnpm check:bob
   ```

### Running the Application

#### Development Mode (Recommended)

Start both frontend and backend concurrently:
```bash
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

#### Individual Services

Start frontend only:
```bash
pnpm dev:frontend
```

Start backend only:
```bash
pnpm dev:backend
```

#### Production Build

Build all workspaces:
```bash
pnpm build
```

---

## 🌐 API Endpoints

### Scan Operations

#### `POST /api/scans`
Upload and scan a real repository from a ZIP file.

**Request**:
- Content-Type: `multipart/form-data`
- Body: 
  - `file` (ZIP archive)
  - `projectName` (string)
  - `currentProvider` (string)
  - `targetProvider` (string)
  - `applicationType` (string)

**Response**:
```json
{
  "scanId": "uuid-v4",
  "projectName": "My Project",
  "bobVerdict": "Proceed with Caution",
  "bobConfidence": "High",
  "readinessScore": 75,
  "findings": [...],
  "featureSurvivalMap": [...],
  "actionPlan": {...},
  "createdAt": "2026-05-16T20:00:00.000Z"
}
```

#### `POST /api/scans/validate`
Validate repository structure before starting analysis.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (ZIP archive)

**Response**:
```json
{
  "validationState": "valid",
  "valid": true,
  "canProceed": true,
  "errors": [],
  "warnings": [],
  "metadata": {
    "totalFiles": 150,
    "detectedLanguages": ["TypeScript", "JavaScript"],
    "hasPackageJson": true,
    "hasDockerfile": true
  },
  "validatedAt": "2026-05-16T20:00:00.000Z"
}
```

#### `POST /api/scans/demo`
Run a demo analysis with pre-loaded context (no file upload required).

**Request Body** (optional):
```json
{
  "projectName": "Legacy Cloud API Demo",
  "currentProvider": "AWS",
  "targetProvider": "GCP",
  "applicationType": "Backend API"
}
```

**Response**: Same as `/api/scans`

**Note**: Demo mode uses cached results for consistency and doesn't consume Bobcoins.

#### `GET /api/scans/:scanId`
Retrieve a previous scan result by ID.

**Response**: Same as `/api/scans`

#### `GET /api/scans/:scanId/export?format={json|csv|markdown}`
Export scan results in specified format.

**Query Parameters**:
- `format`: `json`, `csv`, `markdown`, or `md`

**Response**: File download with appropriate content type

### System Health

#### `GET /api/health`
Check system status and Bob configuration.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-16T20:00:00.000Z",
  "bobConfigured": true,
  "bobProvider": "shell",
  "bobAvailable": true
}
```

---

## 📁 Project Structure

```
CloudShift_Radar/
├── bob_sessions/               # IBM Bob IDE task session reports (Hackathon evidence)
│   ├── Dev-dan/               # Exported IBM Bob IDE task session evidence
│   └── README.md              # Instructions and evidence inventory
│
├── backend/                    # Fastify API + Scanner
│   ├── src/
│   │   ├── server.ts          # Main server entry point
│   │   ├── bob/               # IBM Bob AI integration
│   │   │   ├── bobClient.ts
│   │   │   ├── bobShellClient.ts
│   │   │   ├── buildBobAnalysisPrompt.ts
│   │   │   ├── normalizeBobResponse.ts
│   │   │   └── checkBobShell.ts
│   │   ├── config/            # Environment configuration
│   │   ├── demo/              # Demo repository loader
│   │   │   ├── loadDemoRepository.ts
│   │   │   └── demoFallbackResult.ts
│   │   ├── export/            # Export format generators
│   │   │   └── exportFormats.ts
│   │   ├── routes/            # API route handlers
│   │   │   ├── scan.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── scanner/           # Code analysis engine
│   │   │   ├── scanRepository.ts
│   │   │   ├── validateRepository.ts
│   │   │   ├── detectCloudSignals.ts
│   │   │   ├── detectHardcodedInfra.ts
│   │   │   └── extractZip.ts
│   │   ├── security/          # Security utilities
│   │   │   ├── sanitizePaths.ts
│   │   │   ├── safeFileReader.ts
│   │   │   └── validateZip.ts
│   │   └── storage/           # Scan result persistence
│   │       └── scanResultStore.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React UI + Dashboard
│   ├── src/
│   │   ├── main.tsx           # Application entry point
│   │   ├── App.tsx            # Root component
│   │   ├── api/               # API client
│   │   │   └── client.ts
│   │   ├── components/        # React components
│   │   │   ├── assessment/    # Scan input components
│   │   │   │   ├── RepositoryInput.tsx
│   │   │   │   ├── MigrationSetup.tsx
│   │   │   │   └── ScanProgress.tsx
│   │   │   ├── bob/           # Bob AI visualization
│   │   │   │   ├── BobBadge.tsx
│   │   │   │   ├── BobConfidenceMeter.tsx
│   │   │   │   ├── BobReasoningCard.tsx
│   │   │   │   └── BobTraceTimeline.tsx
│   │   │   ├── dashboard/     # Results dashboard
│   │   │   │   ├── BobOverviewTab.tsx
│   │   │   │   ├── MigrationImpactFindingsTab.tsx
│   │   │   │   ├── ActionPlanTab.tsx
│   │   │   │   ├── HumanReviewTab.tsx
│   │   │   │   ├── BobReasoningTraceTab.tsx
│   │   │   │   ├── ExportMenu.tsx
│   │   │   │   └── DashboardTabs.tsx
│   │   │   ├── layout/        # App layout
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   └── ui/            # Reusable UI components
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── StatusPill.tsx
│   │   ├── routes/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Assessment.tsx
│   │   │   ├── AnalysisRunning.tsx
│   │   │   └── Results.tsx
│   │   ├── styles/            # CSS stylesheets
│   │   │   ├── tokens.css
│   │   │   ├── layout.css
│   │   │   ├── components.css
│   │   │   ├── responsive.css
│   │   │   └── export.css
│   │   └── utils/             # Utility functions
│   │       └── navigation.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── shared/                     # Shared TypeScript types
│   ├── src/
│   │   ├── index.ts
│   │   └── scan.ts            # Scan result types
│   ├── package.json
│   └── tsconfig.json
│
├── demo-repos/                 # Demo repositories
├── scan-results/               # Persisted scan results (JSON)
├── .env.example                # Environment template
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # Workspace configuration
└── README.md                   # This file
```

---

## 📜 Available Scripts

### Root Level

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm dev:frontend` | Start frontend only (port 5173) |
| `pnpm dev:backend` | Start backend only (port 4000) |
| `pnpm build` | Build all workspaces for production |
| `pnpm build:frontend` | Build frontend only |
| `pnpm build:backend` | Build backend only |
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm setup:bob` | Install IBM Bob Shell package |
| `pnpm check:bob` | Verify Bob Shell installation and configuration |
| `pnpm clean` | Clean all dist directories |

### Workspace-Specific

Navigate to `backend/` or `frontend/` and run:
- `pnpm dev` - Start the specific workspace in development mode
- `pnpm build` - Build the specific workspace
- `pnpm typecheck` - Type check the specific workspace
- `pnpm clean` - Clean the specific workspace

---

## 🤖 Bob AI Integration

IBM Bob is the **AI reasoning engine** at the heart of CloudShift Radar, not just a decorative feature. Bob analyzes technical findings and generates intelligent migration verdicts.

### How Bob Works

1. **Context Building**: CloudShift Radar collects findings from static analysis
2. **Prompt Generation**: Findings are formatted into a structured prompt with security redaction
3. **AI Analysis**: Bob Shell processes the prompt and generates reasoning
4. **Decision Making**: Bob provides one of five possible decisions:
   - ✅ **Proceed**: No significant blockers detected
   - ⚠️ **Proceed with Caution**: Minor risks that can be managed
   - 🛠️ **Prepare First**: Requires preparation work before migration
   - 🚫 **Block Migration**: Critical blockers that must be resolved
   - 👤 **Requires Human Review**: Complex scenarios needing expert evaluation

### Graceful Degradation

CloudShift Radar is designed to work even when Bob is unavailable:

- **Demo Mode**: Uses cached results for consistent demonstrations
- **Fallback Results**: Generates reasonable fallback analysis if Bob fails
- **No Bobcoin Waste**: Demo mode doesn't consume Bobcoins on repeated runs
- **Error Handling**: Clear error messages guide users when Bob is unavailable

### Bob Configuration

Bob requires proper setup in your `.env` file (optional):

```env
BOB_PROVIDER=shell
BOBSHELL_API_KEY=your_api_key_with_inference_scope
BOB_SHELL_COMMAND=./node_modules/.bin/bob
BOB_TIMEOUT_MS=600000
```

### Verifying Bob Installation

```bash
# Check if Bob is properly configured
pnpm check:bob

# Test Bob with a simple prompt
bob -p "Analyze this migration scenario"
```

---

## 🏆 IBM Bob Hackathon Compliance

CloudShift Radar was built specifically for the **IBM Bob Hackathon** and leverages IBM Bob as a core component throughout the development and runtime lifecycle.

### Hackathon Requirements

This project fulfills the IBM Bob Hackathon requirements by:

1. **IBM Bob IDE Usage**: IBM Bob IDE was used as a required development tool throughout the project lifecycle for:
   - Code generation and refactoring
   - Architecture design decisions
   - Problem-solving and debugging
   - Documentation creation
   - Task session reports exported to `/bob_sessions/Dev-dan/`

2. **IBM Bob Shell Integration**: IBM Bob Shell serves as the **AI reasoning engine** at runtime, providing:
   - **Migration Verdict**: Five-tier decision framework (Proceed, Proceed with Caution, Prepare First, Block Migration, Requires Human Review)
   - **Confidence Level**: High, Medium, or Low confidence in the assessment
   - **Reasoning Trace**: Step-by-step explanation of Bob's analysis process
   - **Feature Impact Analysis**: Prediction of which features will survive migration
   - **Human Review Flags**: Identification of complex scenarios requiring expert evaluation
   - **Recommended Action Plan**: Prioritized steps for successful migration

3. **Static Analysis + AI Reasoning**: CloudShift Radar performs local static analysis to detect migration signals (cloud patterns, hardcoded infrastructure, environment gaps), then sends these findings to IBM Bob Shell for intelligent reasoning and verdict generation.

4. **Demo Fallback Mode**: The cached demo results exist **only** for reliability during repeated demonstrations and Bobcoin preservation. They are not a replacement for Bob's AI reasoning—they are pre-generated Bob responses saved for demo consistency.

### Bob IDE vs Bob Shell

| Tool | Role in CloudShift Radar | Usage Context |
|------|--------------------------|---------------|
| **IBM Bob IDE** | Required hackathon development tool and judging evidence source | Development time: code generation, refactoring, architecture decisions, documentation |
| **IBM Bob Shell** | Runtime AI reasoning integration used by the backend API | Runtime: analyzes static analysis findings and generates migration verdicts |
| **Cached Demo Fallback** | Reliability layer for repeated demos (pre-generated Bob responses) | Demo mode only: prevents Bobcoin waste during repeated demonstrations |

### Judging Evidence

All IBM Bob IDE task session reports and consumption summaries are stored in the `/bob_sessions/Dev-dan/` folder as required for hackathon judging. IBM Bob IDE task session evidence is available in `/bob_sessions/Dev-dan/`. These exports demonstrate how IBM Bob IDE was used throughout the development process.

---

## 📤 Export Formats

CloudShift Radar supports multiple export formats for scan results:

### JSON Export
- Complete structured data
- All findings, analysis, and metadata
- Machine-readable format
- Ideal for integration with other tools

### CSV Export
- Spreadsheet-compatible format
- Key findings and metrics
- Easy to import into Excel/Google Sheets
- Suitable for reporting and analysis

### Markdown Export
- Human-readable report format
- Comprehensive documentation
- Includes all sections: findings, action plan, Bob's reasoning
- Perfect for sharing with stakeholders

### Usage

```bash
# Via API
GET /api/scans/:scanId/export?format=json
GET /api/scans/:scanId/export?format=csv
GET /api/scans/:scanId/export?format=markdown

# Via UI
Click "Export" button in Results dashboard
Select desired format
Download automatically starts
```

---

## ⚠️ MVP Limitations

This is an **MVP (Minimum Viable Product)** version with the following limitations:

### Analysis Scope
- **Pattern-based analysis**: Uses regex and string matching (not full AST parsing)
- **Demo context**: Representative but not a complete application
- **Limited language support**: Best results with JavaScript/TypeScript
- **File limit**: Maximum 1000 files per repository

### Infrastructure
- **Local Bob Shell**: Must be installed on the backend server (optional)
- **JSON storage**: Results stored in files (no database yet)
- **No GitHub integration**: Manual ZIP uploads only (GitHub OAuth planned)
- **Single-user**: No authentication or multi-user support

### UI Features
- **No persistent history**: Scan history not saved across sessions
- **Limited filtering**: Basic severity and review filters only
- **No real-time updates**: Polling-based progress tracking

### Known Issues
- Large repositories (>100MB) may timeout
- Binary files are skipped (only text files analyzed)
- Some cloud patterns may not be detected (ongoing improvements)
- Deep directory structures (>10 levels) generate warnings

---

## 🗺️ Future Roadmap

### Phase 1: Enhanced Analysis
- [ ] Full AST parsing for JavaScript/TypeScript/Python/Java
- [ ] Dependency graph analysis
- [ ] Deep CI/CD pipeline analysis
- [ ] Infrastructure-as-Code specific analysis (Terraform, CloudFormation, Kubernetes)
- [ ] Support for more programming languages

### Phase 2: Integration & Automation
- [ ] GitHub OAuth integration
- [ ] GitLab support
- [ ] Bitbucket support
- [ ] Automated scheduled scans
- [ ] Webhook notifications
- [ ] Real-time scan progress (WebSocket)

### Phase 3: Advanced Features
- [ ] Provider-specific migration rules (AWS/GCP/Azure)
- [ ] Multi-cloud migration scenarios
- [ ] Cost estimation for cloud resources
- [ ] Migration timeline prediction
- [ ] Team collaboration features
- [ ] Custom rule engine

### Phase 4: Enterprise Features
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Organization/team management
- [ ] Audit logs and compliance reporting
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting and quotas

---

## 🤝 Contributing

Contributions are welcome! This is an MVP, and we're actively improving the codebase.

### Development Guidelines

1. **Code Style**: Follow existing TypeScript conventions
2. **Type Safety**: Maintain strict TypeScript typing
3. **Security**: Never introduce code execution vulnerabilities
4. **Testing**: Add tests for new features (when test suite is established)
5. **Documentation**: Update README and inline comments
6. **Commits**: Use clear, descriptive commit messages

### Reporting Issues

Please report issues with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots (if applicable)

---

## 📄 License

[Add appropriate license information here]

---

## 🙏 Acknowledgments

- **IBM Bob AI**: For providing the intelligent reasoning engine
- **Fastify**: For the high-performance backend framework
- **React & Vite**: For the modern frontend development experience
- **pnpm**: For efficient monorepo management
- **TypeScript**: For type safety and developer experience

---

## 📞 Support

For questions, issues, or feature requests, please [open an issue](https://github.com/your-org/CloudShift_Radar/issues) on GitHub.

---

## 📊 Project Status

**Current Version**: 0.1.0  
**Status**: MVP - Production Ready  
**Last Updated**: May 16, 2026

### Recent Improvements
- ✅ Progressive validation system implemented
- ✅ Enhanced demo mode with caching
- ✅ Export functionality (JSON, CSV, Markdown)
- ✅ Graceful Bob AI fallback
- ✅ Improved error handling
- ✅ Schema enhancements
- ✅ UI/UX improvements

---

<div align="center">

**Built with ❤️ for better cloud migrations**

[Documentation](#-table-of-contents) • [API Reference](#-api-endpoints) • [Roadmap](#-future-roadmap)

</div>
