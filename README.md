# 🚀 Cloud_Radar

> **Know what will break before you migrate**

Cloud_Radar is an advanced AI-powered cloud migration assessment tool that combines static code analysis with IBM Bob AI to provide detailed, actionable recommendations for migrating legacy applications to cloud-native architectures.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.28.1-000000.svg)](https://www.fastify.io/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-orange.svg)](https://pnpm.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
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
- [MVP Limitations](#-mvp-limitations)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Cloud_Radar** (CloudShift Radar MVP) is designed for CTOs, technical leads, DevOps engineers, and development teams who need to assess the viability of migrating legacy applications to the cloud. By scanning repository code (via ZIP uploads or demo scenarios), Cloud_Radar detects infrastructure patterns, identifies potential migration blockers, and leverages IBM Bob AI to generate intelligent migration verdicts.

### Value Proposition

Traditional cloud migration assessments are time-consuming, error-prone, and often miss critical issues until deployment. Cloud_Radar provides:

- **Proactive Risk Detection**: Identify what will break before you migrate
- **AI-Powered Analysis**: IBM Bob AI analyzes technical findings and provides actionable verdicts
- **Comprehensive Scanning**: Detects 20+ cloud service patterns across AWS, GCP, and Azure
- **Migration Readiness Scoring**: Get a clear 0-100 score on migration viability
- **Feature Survival Prediction**: Understand which features will survive the migration intact

---

## ✨ Key Features

### 🔍 Repository Scanning
- Secure ZIP upload processing (never executes uploaded code)
- Demo mode with pre-loaded context for quick evaluation
- Detection of 20+ cloud service patterns (AWS, GCP, Azure)
- Infrastructure pattern recognition (databases, queues, storage, etc.)

### 🤖 IBM Bob AI Integration
- Intelligent analysis of technical findings
- Context-aware migration recommendations
- Five-tier decision framework:
  - ✅ **Proceed**: Safe to migrate
  - ⚠️ **Proceed with Caution**: Manageable risks identified
  - 🛠️ **Prepare First**: Requires preparation work
  - 🚫 **Block Migration**: Critical blockers detected
  - 👤 **Requires Human Review**: Complex scenarios needing expert evaluation

### 📊 Interactive Dashboard
- Migration readiness scoring (0-100)
- Detailed technical findings with severity levels
- Feature survival predictions
- Bob AI reasoning traces and confidence metrics
- Human review queue for critical items
- Actionable migration recommendations

### 🔒 Security-First Design
- ❌ Never executes uploaded code
- ❌ Never installs dependencies
- ❌ Never runs npm/pip/docker/shell commands
- ✅ Only reads text files
- ✅ Prevents path traversal attacks
- ✅ Strict file size limits
- ✅ Automatic secret redaction in AI prompts

---

## 🏗️ Architecture

Cloud_Radar is built as a **monorepo** using pnpm workspaces, consisting of three main packages:

```
┌─────────────────────────────────────────────────────────┐
│                     Cloud_Radar                         │
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
  - Real-time scan progress tracking
  - Comprehensive dashboard with multiple analysis views

- **Backend**: Fastify 4.28.1 (TypeScript)
  - RESTful API for scan operations
  - Static code analysis engine
  - IBM Bob AI integration layer
  - Secure file processing and storage

- **Shared**: Common TypeScript types and schemas
  - Ensures type safety across frontend and backend
  - Shared data models and interfaces

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Fastify 4.28.1
- **Language**: TypeScript 5.6.3
- **ZIP Processing**: yauzl (secure extraction)
- **File Upload**: @fastify/multipart
- **AI Integration**: IBM Bob Shell CLI

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.14
- **Language**: TypeScript 5.6.3
- **Styling**: Custom CSS with design tokens

### Development
- **Package Manager**: pnpm 9.15.4 (workspaces)
- **Monorepo**: pnpm workspaces
- **Type Checking**: TypeScript strict mode

---

## 🔒 Security Model

Cloud_Radar follows a **zero-execution security model** to ensure uploaded code is never run:

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
- ✅ Enforce strict file size limits
- ✅ Redact secrets and credentials in AI prompts
- ✅ Store results in isolated JSON files

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (compatible with pnpm 9.15.4+)
- **pnpm** 9.15.4 or higher
- **IBM Bob Shell** (licensed and configured)
- **IBM Bob API Key** with Inference scope

### Installation

1. **Enable Corepack** (if not already enabled):
   ```bash
   corepack enable
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Cloud_Radar
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Setup IBM Bob Shell** (if you have the package):
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
   # Bob AI Configuration
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

3. **Accept Bob license** (one-time setup):
   ```bash
   bob --accept-license -p "Test prompt"
   ```

4. **Verify Bob installation**:
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
- Body: `file` (ZIP archive)

**Response**:
```json
{
  "scanId": "uuid-v4",
  "status": "completed",
  "timestamp": "2026-05-16T03:14:26.709Z",
  "bobAnalysis": {
    "decision": "Proceed with Caution",
    "confidence": 0.85,
    "reasoning": "...",
    "recommendations": ["..."]
  },
  "findings": { ... },
  "metrics": { ... }
}
```

#### `POST /api/scans/demo`
Run a demo analysis with pre-loaded context (no file upload required).

**Response**: Same as `/api/scans`

#### `GET /api/scans/:scanId`
Retrieve a previous scan result by ID.

**Response**: Same as `/api/scans`

### System Health

#### `GET /api/health`
Check system status and Bob configuration.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-16T03:14:26.709Z",
  "bob": {
    "configured": true,
    "provider": "shell",
    "available": true
  }
}
```

---

## 📁 Project Structure

```
Cloud_Radar/
├── backend/                    # Fastify API + Scanner
│   ├── src/
│   │   ├── server.ts          # Main server entry point
│   │   ├── bob/               # IBM Bob AI integration
│   │   │   ├── bobClient.ts
│   │   │   ├── bobShellClient.ts
│   │   │   ├── buildBobAnalysisPrompt.ts
│   │   │   └── normalizeBobResponse.ts
│   │   ├── config/            # Environment configuration
│   │   ├── demo/              # Demo repository loader
│   │   ├── routes/            # API route handlers
│   │   ├── scanner/           # Code analysis engine
│   │   │   ├── scanRepository.ts
│   │   │   ├── detectCloudSignals.ts
│   │   │   ├── detectHardcodedInfra.ts
│   │   │   └── extractZip.ts
│   │   ├── security/          # Security utilities
│   │   └── storage/           # Scan result persistence
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React UI + Dashboard
│   ├── src/
│   │   ├── main.tsx           # Application entry point
│   │   ├── App.tsx            # Root component
│   │   ├── api/               # API client
│   │   ├── components/        # React components
│   │   │   ├── assessment/    # Scan input components
│   │   │   ├── bob/           # Bob AI visualization
│   │   │   ├── dashboard/     # Results dashboard
│   │   │   ├── layout/        # App layout
│   │   │   └── ui/            # Reusable UI components
│   │   ├── routes/            # Page components
│   │   ├── styles/            # CSS stylesheets
│   │   └── utils/             # Utility functions
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
├── uploads/                    # Temporary ZIP uploads
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
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm setup:bob` | Install IBM Bob Shell package |
| `pnpm check:bob` | Verify Bob Shell installation and configuration |
| `pnpm clean` | Clean all dist directories |

### Workspace-Specific

Navigate to `backend/` or `frontend/` and run:
- `pnpm dev` - Start the specific workspace in development mode
- `pnpm build` - Build the specific workspace
- `pnpm typecheck` - Type check the specific workspace

---

## 🤖 Bob AI Integration

IBM Bob is the **AI reasoning engine** at the heart of Cloud_Radar, not just a decorative feature. Bob analyzes technical findings and generates intelligent migration verdicts.

### How Bob Works

1. **Context Building**: Cloud_Radar collects technical findings from static analysis
2. **Prompt Generation**: Findings are formatted into a structured prompt with security redaction
3. **AI Analysis**: Bob Shell processes the prompt and generates reasoning
4. **Decision Making**: Bob provides one of five possible decisions:
   - ✅ **Proceed**: No significant blockers detected
   - ⚠️ **Proceed with Caution**: Minor risks that can be managed
   - 🛠️ **Prepare First**: Requires preparation work before migration
   - 🚫 **Block Migration**: Critical blockers that must be resolved
   - 👤 **Requires Human Review**: Complex scenarios needing expert evaluation

### Bob Configuration

Bob requires proper setup in your `.env` file:

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

## ⚠️ MVP Limitations

This is an **MVP (Minimum Viable Product)** version with the following limitations:

### Analysis Scope
- **Pattern-based analysis**: Uses regex and string matching (not full AST parsing)
- **Demo context**: Representative but not a complete application
- **Limited language support**: Best results with JavaScript/TypeScript

### Infrastructure
- **Local Bob Shell**: Must be installed on the backend server
- **JSON storage**: Results stored in files (no database yet)
- **No GitHub integration**: Manual ZIP uploads only (GitHub OAuth planned)

### UI Features
- **Preview mode**: Some UI features are for development/preview only
- **Limited history**: No persistent scan history across sessions

### Known Issues
- Large repositories (>100MB) may timeout
- Binary files are skipped (only text files analyzed)
- Some cloud patterns may not be detected (ongoing improvements)

---

## 🗺️ Future Roadmap

### Phase 1: Enhanced Analysis
- [ ] Full AST parsing for JavaScript/TypeScript/Python/Java
- [ ] Dependency graph analysis
- [ ] Deep CI/CD pipeline analysis
- [ ] Infrastructure-as-Code specific analysis (Terraform, CloudFormation, Kubernetes)

### Phase 2: Integration & Automation
- [ ] GitHub OAuth integration
- [ ] GitLab support
- [ ] Bitbucket support
- [ ] Automated scheduled scans
- [ ] Webhook notifications

### Phase 3: Advanced Features
- [ ] Provider-specific migration rules (AWS/GCP/Azure)
- [ ] Multi-cloud migration scenarios
- [ ] Cost estimation for cloud resources
- [ ] Migration timeline prediction
- [ ] Team collaboration features

### Phase 4: Enterprise Features
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Organization/team management
- [ ] Audit logs and compliance reporting
- [ ] Custom rule engine

---

## 🤝 Contributing

Contributions are welcome! This is an MVP, and we're actively improving the codebase.

### Development Guidelines

1. **Code Style**: Follow existing TypeScript conventions
2. **Type Safety**: Maintain strict TypeScript typing
3. **Security**: Never introduce code execution vulnerabilities
4. **Testing**: Add tests for new features (when test suite is established)
5. **Documentation**: Update README and inline comments

### Reporting Issues

Please report issues with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

---

## 📄 License

[Add appropriate license information here]

---

## 🙏 Acknowledgments

- **IBM Bob AI**: For providing the intelligent reasoning engine
- **Fastify**: For the high-performance backend framework
- **React & Vite**: For the modern frontend development experience
- **pnpm**: For efficient monorepo management

---

## 📞 Support

For questions, issues, or feature requests, please [open an issue](https://github.com/your-org/Cloud_Radar/issues) on GitHub.

---

<div align="center">

**Built with ❤️ for better cloud migrations**

[Documentation](#) • [API Reference](#-api-endpoints) • [Roadmap](#-future-roadmap)

</div>
