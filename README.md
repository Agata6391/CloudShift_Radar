# CloudShift Radar

> **Know what will break before you migrate**

CloudShift Radar is an AI-powered cloud migration assessment tool that combines static code analysis with IBM Bob AI to provide detailed, actionable recommendations for migrating legacy applications to cloud-native architectures.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.8.5-000000.svg)](https://www.fastify.io/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-orange.svg)](https://pnpm.io/)
[![IBM Bob](https://img.shields.io/badge/IBM%20Bob-AI%20Reasoning-0f62fe.svg)](https://bob.ibm.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [What's New](#-whats-new)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Security Model](#-security-model)
- [Hosted Demo Behavior](#-hosted-demo-behavior)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Vercel Deployment](#-vercel-deployment)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Bob AI Integration](#-bob-ai-integration)
- [IBM Bob Hackathon Compliance](#-ibm-bob-hackathon-compliance)
- [Export Formats](#-export-formats)
- [MVP Limitations](#-mvp-limitations)
- [Future Roadmap](#-future-roadmap)
- [Repository Hygiene](#-repository-hygiene)
- [Submission Checklist](#-submission-checklist)
- [Contributing](#-contributing)
- [License](#-license)
- [Project Status](#-project-status)

---

## 🎯 Overview

**CloudShift Radar** is designed for CTOs, technical leads, DevOps engineers, platform engineers, and development teams who need to assess the viability of migrating legacy applications to the cloud.

Traditional cloud migration assessments are time-consuming, manual, error-prone, and often miss critical blockers until late in the migration process. CloudShift Radar helps teams detect migration risks earlier by scanning repository code, identifying provider-specific dependencies, and using IBM Bob AI reasoning to generate a clear migration readiness report.

CloudShift Radar answers questions such as:

- 🔍 What will break before migration?
- ✅ Which features are likely to survive?
- 🔧 Which dependencies need refactoring?
- ⚠️ Which risks require human review?
- 📋 What should the team fix before moving to the target cloud?

### Value Proposition

CloudShift Radar provides:

- **Proactive Risk Detection**: Identify what will break before you migrate.
- **AI-Powered Analysis**: IBM Bob AI analyzes technical findings and provides actionable verdicts.
- **Comprehensive Scanning**: Detects cloud service patterns across AWS, GCP, Azure, and external services.
- **Migration Readiness Scoring**: Provides a clear 0-100 migration readiness score.
- **Feature Survival Prediction**: Maps technical findings to product feature impact.
- **Human Review Queue**: Escalates uncertain or high-risk findings for senior review.
- **Progressive Validation**: Gives real-time validation feedback before starting analysis.
- **Multiple Export Formats**: Exports reports in JSON, CSV, or Markdown.

---

## 🌐 Live Demo

CloudShift Radar is deployed as a hosted hackathon demo on Vercel.

### Frontend Application

```
https://cloud-shift-radar.vercel.app
```

### Backend API

```
https://cloud-shift-radar-backend.vercel.app
```

### Backend Health Check

```
https://cloud-shift-radar-backend.vercel.app/api/health
```

### Hosted Demo Mode

The hosted Vercel demo uses cached IBM Bob analysis results and fallback behavior to provide a stable judging experience and avoid repeated Bobcoin consumption during public demonstrations.

Full IBM Bob Shell runtime analysis is supported in local setup when IBM Bob Shell and valid Bob credentials are configured.

| Environment | Behavior |
|------------|----------|
| Hosted Vercel demo | Interactive product demo with cached/fallback Bob analysis |
| Local full setup | IBM Bob Shell runtime analysis when credentials are configured |
| IBM Bob IDE evidence | Exported task sessions and screenshots in `/bob_sessions/Dev-dan/` |

---

## ✨ Key Features

### 🔍 Repository Scanning

- Secure ZIP upload processing.
- Static code analysis only.
- No execution of uploaded code.
- Detection of cloud-service patterns.
- Detection of hardcoded infrastructure references.
- Detection of dependency and configuration files.
- Detection of infrastructure-sensitive files.
- Automatic language and framework detection.
- Repository structure validation before analysis.

### 📊 Progressive Validation

- Validates project packages before scan execution.
- Shows validation errors and warnings inline.
- Prevents scans from starting when required structure is missing.
- Supports warning-based progression when the repository is usable but incomplete.
- Provides clear validation states before analysis begins.

### 🤖 IBM Bob AI Integration

IBM Bob is used as the migration reasoning engine.

Bob evaluates scanner findings and generates:

- Migration verdict.
- Confidence level.
- Feature impact analysis.
- Human review flags.
- Migration readiness score.
- Recommended action plan.
- Reasoning trace.
- Business and technical impact summary.

Bob uses a five-tier decision framework:

- ✅ **Proceed**: Safe to migrate.
- ⚠️ **Proceed with Caution**: Manageable risks identified.
- 🛠️ **Prepare First**: Requires preparation work.
- 🚫 **Block Migration**: Critical blockers detected.
- 👤 **Requires Human Review**: Complex scenarios needing expert evaluation.

### 📈 Interactive Dashboard

The report dashboard includes:

- Migration readiness score.
- Bob verdict.
- Summary metrics.
- Unified findings view.
- Feature survival map.
- Human review queue.
- AI summary.
- Bob reasoning trace.
- Export menu.

### 📤 Export Capabilities

Reports can be exported as:

- **JSON**: Complete structured data
- **CSV**: Spreadsheet-compatible format
- **Markdown**: Human-readable report

### 🔒 Security-First Design

CloudShift Radar follows a zero-execution security model:

- ❌ Uploaded code is never executed.
- ❌ Dependencies are never installed.
- ❌ Shell commands from uploaded repositories are never run.
- ❌ Docker containers are never executed.
- ✅ Only text files are read.
- ✅ ZIP files are validated before extraction.
- ✅ Path traversal is prevented.
- ✅ Secrets are redacted before AI analysis.

### 🎭 MVP Authentication

- **Simulated login**: Authentication is simulated for demonstration purposes.
- **No credential validation**: Any email/password combination works when terms are accepted.
- **Fixed demo user**: All sessions use "Demo User" as the authenticated user.
- **Session-based**: Login state persists during browser session only.

---

## 🆕 What's New

### Recent Updates

#### ✅ Progressive Validation System

- Added `POST /api/scans/validate`.
- Added real-time validation feedback.
- Added validation errors and warnings.
- Added repository metadata detection.
- Added network error handling and retry behavior.

#### ✅ Hosted Demo Mode

- Added cached demo results for consistent judging.
- Avoids repeated Bobcoin consumption.
- Provides deterministic demo results.
- Keeps the public Vercel app stable even without Bob Shell installed on the serverless runtime.

#### ✅ Vercel Deployment Fixes

- Added frontend SPA rewrite support through `frontend/vercel.json`.
- Added Vercel runtime storage support using `/tmp/cloudshift-radar`.
- Added separate frontend/backend deployment configuration.
- Added production frontend-to-backend API configuration using `VITE_API_URL`.

#### ✅ Export Functionality

- Added JSON export.
- Added CSV export.
- Added Markdown export.
- Added downloadable report filenames with project name and timestamp.

#### ✅ UI/UX Improvements

- Added progressive CTA states.
- Added validation progress indicators.
- Added retry mechanism.
- Added consolidated findings view.
- Added feature survival map.
- Added human review detail expansion.
- Added technical complexity display in findings.

---

## 🏗️ Architecture

CloudShift Radar is built as a monorepo using pnpm workspaces.

```
CloudShift_Radar/
├── frontend/       React + Vite application
├── backend/        Fastify API + scanner + Bob integration
├── shared/         Shared TypeScript types
├── demo-repos/     Demo scan context
├── bob_sessions/   IBM Bob IDE task session evidence
├── uploads/        Local generated scan workspace
└── scan-results/   Local generated scan results
```

High-level architecture:

```
Frontend React/Vite
        |
        v
Fastify Backend API
        |
        +--> ZIP validation
        +--> Static repository scanner
        +--> Migration finding generation
        +--> IBM Bob Shell runtime path
        +--> Cached/fallback demo result
        |
        v
Report Dashboard + Export
```

### Components

#### Frontend

React + Vite application that provides:

- Project input flow.
- ZIP upload UI.
- Progressive validation states.
- Analysis running screen.
- Report dashboard.
- Findings tab.
- Human review tab.
- AI summary tab.
- Export menu.

#### Backend

Fastify API that provides:

- Health route.
- ZIP validation route.
- Scan route.
- Demo scan route.
- Scan result retrieval.
- Export endpoints.
- Static scanner.
- Bob Shell integration path.
- Fallback result generation.
- Runtime scan storage.

#### Shared

Shared TypeScript package containing:

- Migration context types.
- Scan result types.
- Validation result types.
- Shared schemas and interfaces.

---

## 🛠️ Technology Stack

### Backend

- **Fastify** 5.8.5
- **TypeScript**
- **@fastify/cors**
- **@fastify/multipart**
- **yauzl** for ZIP processing
- **IBM Bob Shell** integration path
- File-based runtime result storage

### Frontend

- **React** 18
- **Vite**
- **TypeScript**
- Custom CSS with design tokens
- Fetch API

### Development

- **pnpm** workspaces
- TypeScript strict mode
- Monorepo structure
- **tsx** for development runtime

### Deployment

- **Frontend**: Vercel
- **Backend**: Vercel
- **Runtime temporary storage** on Vercel: `/tmp/cloudshift-radar`
- **Local generated storage**: `uploads/` and `scan-results/`

---

## 🔒 Security Model

CloudShift Radar follows a zero-execution security model.

### What CloudShift Radar Does Not Do

- ❌ Does not execute uploaded code.
- ❌ Does not install uploaded dependencies.
- ❌ Does not run npm, pip, Docker, shell scripts, or package managers from uploaded repositories.
- ❌ Does not evaluate dynamic code.
- ❌ Does not trust user-provided paths.
- ❌ Does not expose uploaded files publicly.

### What CloudShift Radar Does

- ✅ Reads text files only.
- ✅ Validates ZIP files before extraction.
- ✅ Prevents path traversal attacks.
- ✅ Enforces file size limits.
- ✅ Enforces file count limits.
- ✅ Redacts secrets and credentials before AI analysis.
- ✅ Stores temporary scan files in isolated runtime folders.
- ✅ Uses `/tmp/cloudshift-radar` for runtime writes on Vercel.
- ✅ Keeps generated local scan folders out of Git except `.gitkeep`.

---

## 🎭 Hosted Demo Behavior

The hosted demo is intentionally configured for reliability.

In the public Vercel deployment:

- ✅ The frontend is fully interactive.
- ✅ The backend API is live.
- ✅ Validation routes are available.
- ⚡ Demo analysis uses cached/fallback Bob output.
- ✅ The dashboard and exports remain usable.
- 💡 Bob Shell is not required to be installed on Vercel.

This avoids:

- 💰 Bobcoin waste from repeated public demo runs.
- 🔐 CLI authentication issues in serverless runtime.
- ⚠️ Instability caused by running a local CLI inside Vercel Functions.
- ❌ Public demo failure when Bob Shell credentials are not configured.

Full Bob Shell runtime analysis is supported when running locally with valid IBM Bob credentials.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+
- **pnpm** 9+
- **Git**
- **IBM Bob Shell** (optional for live runtime AI reasoning)
- **IBM Bob API Key** with Inference scope (optional for full Bob Shell integration)

The hosted Vercel demo works without local IBM Bob Shell installation by using cached/fallback Bob analysis results for judging reliability.

---

### Installation

Clone the repository:

```bash
git clone https://github.com/Agata639/CloudShift_Radar.git
cd CloudShift_Radar
```

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

---

### Configuration

#### Backend Environment

Create a `.env` file for local development.

```env
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# Runtime storage
# Leave empty locally to use ../uploads and ../scan-results
# Use /tmp/cloudshift-radar on Vercel
RUNTIME_STORAGE_DIR=

# Bob AI Configuration
# Optional locally; hosted demo works with cached/fallback Bob analysis.
BOB_PROVIDER=shell
BOBSHELL_API_KEY=your_real_api_key_here

# Bob Shell Command
# Windows: use full path or ./node_modules/.bin/bob
# Linux/macOS: use 'bob' if global or ./node_modules/.bin/bob
BOB_SHELL_COMMAND=./node_modules/.bin/bob

BOB_TIMEOUT_MS=600000
```

For Vercel backend deployment, configure:

```env
FRONTEND_URL=https://cloud-shift-radar.vercel.app
RUNTIME_STORAGE_DIR=/tmp/cloudshift-radar
BOB_PROVIDER=shell
BOB_TIMEOUT_MS=600000
```

⚠️ **Do not commit `.env` files or credentials.**

#### Frontend Environment

For local frontend development:

```env
VITE_API_URL=http://localhost:4000
```

For Vercel frontend deployment:

```env
VITE_API_URL=https://cloud-shift-radar-backend.vercel.app
```

---

### Running the Application

Start both frontend and backend:

```bash
pnpm dev
```

**Frontend**: http://localhost:5173  
**Backend**: http://localhost:4000  
**Backend health**: http://localhost:4000/api/health

Run frontend only:

```bash
pnpm dev:frontend
```

Run backend only:

```bash
pnpm dev:backend
```

---

## ☁️ Vercel Deployment

CloudShift Radar is deployed as two separate Vercel projects.

### Frontend Project

| Setting | Value |
|--------|-------|
| Project name | `cloud-shift-radar` |
| Root directory | `frontend` |
| Framework preset | `Vite` |
| Production URL | `https://cloud-shift-radar.vercel.app` |

Environment variable:

```env
VITE_API_URL=https://cloud-shift-radar-backend.vercel.app
```

The frontend uses a Vercel SPA rewrite to support direct navigation and page refreshes on client-side routes such as `/project-input`, `/analysis-running`, and `/report-dashboard`.

This configuration lives in:

```
frontend/vercel.json
```

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend Project

| Setting | Value |
|--------|-------|
| Project name | `cloud-shift-radar-backend` |
| Root directory | `backend` |
| Framework preset | `Fastify` |
| Production URL | `https://cloud-shift-radar-backend.vercel.app` |

Environment variables:

```env
FRONTEND_URL=https://cloud-shift-radar.vercel.app
RUNTIME_STORAGE_DIR=/tmp/cloudshift-radar
BOB_PROVIDER=shell
BOB_TIMEOUT_MS=600000
```

### Runtime Storage

Vercel serverless functions should not write runtime files into the deployment filesystem. CloudShift Radar uses runtime storage paths as follows:

| Environment | Upload workspace | Scan result storage |
|------------|------------------|---------------------|
| Local development | `../uploads` | `../scan-results` |
| Vercel runtime | `/tmp/cloudshift-radar/uploads` | `/tmp/cloudshift-radar/scan-results` |

Only `.gitkeep` files should be committed in `uploads/` and `scan-results/`.

---

## 🌐 API Endpoints

### Health

```
GET /api/health
```

Checks backend status and Bob configuration.

Example response:

```json
{
  "ok": true,
  "bobProvider": "shell",
  "bobConfigured": false,
  "bobCommandConfigured": true
}
```

---

### Validate Repository ZIP

```
POST /api/scans/validate
```

Validates repository ZIP structure before analysis.

**Request**:

```
multipart/form-data
repository: ZIP file
```

Example response:

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

---

### Run Repository Scan

```
POST /api/scans
```

Uploads and analyzes a repository ZIP file.

**Request**:

```
multipart/form-data
projectName
currentProvider
targetProvider
applicationType
repository
```

Example response:

```json
{
  "scanId": "uuid-v4",
  "projectName": "Legacy Cloud API",
  "bobVerdict": "Prepare First",
  "bobConfidence": "Medium-High",
  "readinessScore": 42,
  "findings": [],
  "featureSurvivalMap": [],
  "humanReviewQueue": [],
  "actionPlan": {},
  "createdAt": "2026-05-16T20:00:00.000Z"
}
```

---

### Run Demo Scan

```
POST /api/scans/demo
```

Runs the cached demo scan flow.

Request body:

```json
{
  "projectName": "Legacy Cloud API Demo",
  "currentProvider": "AWS",
  "targetProvider": "GCP",
  "applicationType": "Backend API"
}
```

---

### Get Scan Result

```
GET /api/scans/:scanId
```

Returns a stored scan result.

---

### Export Scan Result

```
GET /api/scans/:scanId/export?format=json
GET /api/scans/:scanId/export?format=csv
GET /api/scans/:scanId/export?format=markdown
```

Supported formats:

- `json`
- `csv`
- `markdown`
- `md`

---

## 📁 Project Structure

```
CloudShift_Radar/
├── bob_sessions/               # IBM Bob IDE task session reports
│   ├── README.md               # Instructions for task session exports
│   └── Dev-dan/                # Exported Bob IDE task histories and screenshots
│
├── backend/                    # Fastify API + Scanner
│   ├── src/
│   │   ├── server.ts           # Main server entry point
│   │   ├── bob/                # IBM Bob AI integration
│   │   │   ├── bobClient.ts
│   │   │   ├── bobShellClient.ts
│   │   │   ├── buildBobAnalysisPrompt.ts
│   │   │   ├── normalizeBobResponse.ts
│   │   │   └── checkBobShell.ts
│   │   ├── config/             # Environment configuration
│   │   ├── demo/               # Demo repository loader and fallback data
│   │   ├── export/             # Export format generators
│   │   ├── routes/             # API route handlers
│   │   ├── scanner/            # Static code analysis engine
│   │   ├── security/           # ZIP validation and safe file handling
│   │   └── storage/            # Scan result persistence
│   ├── package.json
│   ├── tsconfig.json
│   └── .vercelignore
│
├── frontend/                   # React UI + Dashboard
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── shared/                     # Shared TypeScript types
│   ├── src/
│   │   ├── index.ts
│   │   └── scan.ts
│   ├── package.json
│   └── tsconfig.json
│
├── demo-repos/                 # Demo repositories / demo context
├── uploads/                    # Local generated ZIP extraction workspace (.gitkeep only)
├── scan-results/               # Local generated scan results (.gitkeep only)
├── .env.example
├── .gitignore
├── .vercelignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 📜 Available Scripts

### Root Level

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm dev:frontend` | Start frontend only |
| `pnpm dev:backend` | Start backend only |
| `pnpm build` | Build all workspaces for production |
| `pnpm build:frontend` | Build frontend only |
| `pnpm build:backend` | Build backend only |
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm setup:bob` | Install IBM Bob Shell package when available |
| `pnpm check:bob` | Verify Bob Shell installation and configuration |
| `pnpm clean` | Clean all dist directories |

### Workspace-Specific

Inside `backend/` or `frontend/`:

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm clean
```

---

## 🤖 Bob AI Integration

IBM Bob is the AI reasoning engine at the heart of CloudShift Radar.

### How Bob Works

1. CloudShift Radar collects findings from static repository analysis.
2. Findings are formatted into a structured prompt with security redaction.
3. IBM Bob Shell processes the prompt in full local runtime mode.
4. Bob returns a structured migration assessment.
5. CloudShift Radar normalizes the result into the dashboard report.

Bob provides:

- Migration verdict.
- Confidence level.
- Reasoning trace.
- Feature impact analysis.
- Human review flags.
- Recommended action plan.

### Bob Configuration

IBM Bob Shell is optional for the hosted demo and required only for full local runtime AI reasoning.

The hosted Vercel demo uses cached/fallback Bob analysis results so judges can interact with the product reliably without consuming Bobcoins repeatedly or depending on CLI authentication inside serverless functions.

For full local Bob Shell analysis, configure:

```env
BOB_PROVIDER=shell
BOBSHELL_API_KEY=your_api_key_with_inference_scope
BOB_SHELL_COMMAND=./node_modules/.bin/bob
BOB_TIMEOUT_MS=600000
```

Verify Bob Shell:

```bash
pnpm check:bob
bob -p "Analyze this migration scenario"
```

### Graceful Degradation

CloudShift Radar is designed to remain usable even when IBM Bob Shell is unavailable.

- **Demo Mode** uses cached results for consistent demonstrations.
- **Fallback results** are generated when Bob Shell is unavailable.
- Demo mode avoids repeated Bobcoin consumption.
- Hosted Vercel demo remains stable without Bob Shell installed.

---

## 🏆 IBM Bob Hackathon Compliance

CloudShift Radar was built specifically for the IBM Bob Hackathon and uses IBM Bob as a core part of the development and analysis workflow.

### Hackathon Requirements

This project fulfills the IBM Bob Hackathon requirements by:

1. **IBM Bob IDE Usage**

   IBM Bob IDE was used throughout the project lifecycle for:

   - Code generation and refactoring.
   - Architecture decisions.
   - Problem-solving and debugging.
   - Documentation support.
   - Task planning and implementation support.

2. **IBM Bob IDE Evidence**

   IBM Bob IDE task session exports and consumption screenshots are included in:

   ```
   /bob_sessions/Dev-dan/
   ```

3. **IBM Bob Shell Integration**

   IBM Bob Shell is integrated as the runtime AI reasoning path for full local execution.

4. **Static Analysis + AI Reasoning**

   CloudShift Radar performs local static analysis first, then uses IBM Bob reasoning to interpret migration risk, feature impact, and human review needs.

5. **Hosted Demo Fallback**

   Cached demo results are used only for public demo reliability and Bobcoin preservation. They are not a replacement for IBM Bob IDE evidence.

### Bob IDE vs Bob Shell

| Tool | Role in CloudShift Radar | Usage Context |
|------|--------------------------|---------------|
| IBM Bob IDE | Required hackathon development tool and judging evidence source | Development time |
| IBM Bob Shell | Runtime AI reasoning path | Full local runtime setup |
| Cached Demo Fallback | Reliability layer for repeated demos | Hosted Vercel demo |

### Judging Evidence

IBM Bob IDE task session reports and consumption summary screenshots are stored in:

```
/bob_sessions/Dev-dan/
```

This folder contains exported IBM Bob IDE task histories and screenshots showing relevant CloudShift Radar development sessions.

These exports demonstrate how IBM Bob IDE was used throughout the project lifecycle for planning, implementation, debugging, refactoring, and documentation.

---

## 📤 Export Formats

CloudShift Radar supports multiple export formats for scan results.

### JSON Export

- Complete structured data.
- All findings, analysis, and metadata.
- Machine-readable format.
- Useful for integrations.

### CSV Export

- Spreadsheet-compatible findings export.
- Useful for reporting and prioritization.
- Can be opened in Excel or Google Sheets.

### Markdown Export

- Human-readable report.
- Useful for sharing with stakeholders.
- Includes findings, action plan, and Bob reasoning.

### Usage

Via API:

```
GET /api/scans/:scanId/export?format=json
GET /api/scans/:scanId/export?format=csv
GET /api/scans/:scanId/export?format=markdown
```

Via UI:

```
Open Report Dashboard → Export Report → Select format
```

---

## ⚠️ MVP Limitations

CloudShift Radar is an MVP proof of concept.

### Analysis Scope

- Pattern-based analysis rather than full AST parsing.
- Best results with JavaScript and TypeScript repositories.
- Limited language support in the MVP.
- Binary files are skipped.
- Large repositories may require optimization.

### Infrastructure

- Hosted Vercel demo uses cached/fallback Bob analysis instead of running Bob Shell directly in serverless functions.
- Full live Bob Shell reasoning is supported in local setup when Bob Shell and credentials are configured.
- Results are stored in local/runtime files for the MVP.
- No production database yet.
- Vercel runtime writes use `/tmp/cloudshift-radar`.

### Product Scope

- Manual ZIP upload only.
- No GitHub OAuth import yet.
- **Simulated authentication**: Login is simulated for MVP demonstration purposes (no real credential validation).
- Fixed demo user: "Demo User" for all sessions.
- No persistent multi-user scan history yet.
- No team workspace support yet.

### UI/UX Scope

- **Desktop-first experience**: The application is optimized for desktop browsers (1024px+ screens).
- **Basic mobile support**: Mobile responsive layout exists with limited functionality.
- **Mobile version planned**: Full mobile experience and native mobile apps are planned for future releases.
- Responsive breakpoints at 1040px and 720px for basic mobile compatibility.
- Mobile menu available but desktop experience is recommended for full functionality.

---

## 🗺️ Future Roadmap

### Phase 1: Enhanced Analysis

- Full AST parsing for JavaScript and TypeScript.
- Python and Java support.
- Dependency graph analysis.
- Infrastructure-as-code analysis.
- CI/CD pipeline analysis.

### Phase 2: Repository Integrations

- GitHub OAuth import.
- GitLab support.
- Bitbucket support.
- Scheduled scans.
- Webhook notifications.

### Phase 3: Advanced Migration Intelligence

- Provider-specific migration rules.
- Multi-cloud migration scenarios.
- Migration cost estimation.
- Migration timeline estimation.
- Custom rule engine.
- Deeper feature survival modeling.

### Phase 4: Enterprise Features

- Database persistence.
- User authentication.
- Organization and team management.
- Audit logs.
- Role-based access control.
- API rate limiting.
- Compliance export templates.

---

## 🧹 Repository Hygiene

Before public submission, verify:

- ✅ No `.env` files are committed.
- ✅ No IBM Bob credentials are committed.
- ✅ No IBM Cloud credentials are committed.
- ✅ No API keys or secrets appear in screenshots.
- ✅ `uploads/` contains only `.gitkeep`.
- ✅ `scan-results/` contains only `.gitkeep`.
- ✅ `bob_sessions/Dev-dan/` contains only relevant CloudShift Radar Bob evidence.
- ✅ `.vercel/` is not committed.
- ✅ Generated runtime files are not committed.

---

## 📋 Submission Checklist

Required for lablab.ai submission:

- ✅ Project title.
- ✅ Short description.
- ✅ Long description.
- ✅ Technology and category tags.
- ✅ Cover image, PNG or JPG, 16:9 recommended.
- ✅ Video presentation, MP4, maximum 5 minutes.
- ✅ Slide presentation PDF.
- ✅ Public GitHub repository.
- ✅ IBM Bob task session reports in repository.
- ✅ Application URL.

### Recommended Submission Text

**Project title:**

```
CloudShift Radar
```

**Short description:**

```
CloudShift Radar uses IBM Bob AI and static code analysis to detect cloud migration blockers before deployment, giving teams readiness scores, feature impact insights, and actionable migration plans.
```

**Technology tags:**

```
IBM Bob, AI, Developer Tools, Cloud Migration, DevOps, Static Code Analysis, TypeScript, React, Fastify, Vite, Cloud Infrastructure, Software Modernization, Enterprise AI
```

**Long description:**

```
CloudShift Radar is an AI-powered cloud migration assessment tool for CTOs, technical leads, DevOps engineers, and development teams preparing to move legacy applications to cloud-native infrastructure. Traditional migration assessments are slow, manual, and often miss hidden blockers until late in the process. CloudShift Radar solves this by scanning repository code through secure static analysis, detecting cloud provider dependencies, hardcoded infrastructure, environment gaps, storage patterns, queues, databases, and other migration-sensitive signals.

IBM Bob is used as the project's core AI reasoning engine. After local analysis identifies technical findings, Bob evaluates migration risk, explains likely impact, predicts which features may survive the migration, and generates a practical action plan. The product provides a migration readiness score, unified findings view, human review queue, Bob reasoning trace, and exportable reports.

The goal is to help teams know what will break before they migrate, reduce discovery time, and make cloud migration planning faster, safer, and clearer for both technical and business stakeholders.
```

---

## 🤝 Contributing

This project was created as a hackathon MVP. Contributions should preserve the zero-execution security model and avoid introducing behavior that executes uploaded user code.

### Development Guidelines

1. Maintain strict TypeScript typing.
2. Keep uploaded repository handling read-only.
3. Do not execute uploaded code.
4. Keep runtime-generated files out of Git.
5. Update README and comments when changing deployment or Bob integration behavior.
6. Use clear commit messages.

---

## 📄 License

This project was created as a proof of concept for the IBM Bob Hackathon.

License terms should be finalized before production or commercial use.

---

## 🙏 Acknowledgments

- **IBM Bob AI**
- **IBM Bob Hackathon**
- **Fastify**
- **React**
- **Vite**
- **TypeScript**
- **pnpm**

---

## 📊 Project Status

**Current Version**: 0.1.0  
**Status**: MVP - Hackathon Submission Ready  
**Last Updated**: May 16, 2026

### Recent Improvements

- ✅ Progressive validation system implemented.
- ✅ Hosted Vercel frontend deployed.
- ✅ Hosted Vercel backend deployed.
- ✅ Frontend-to-backend production API routing fixed.
- ✅ Vercel SPA route refresh fixed.
- ✅ Vercel runtime storage moved to `/tmp/cloudshift-radar`.
- ✅ Demo mode with cached/fallback Bob analysis.
- ✅ Export functionality added.
- ✅ Graceful Bob AI fallback added.
- ✅ IBM Bob IDE evidence included in `/bob_sessions/Dev-dan/`.

---

<div align="center">

**Built for the IBM Bob Hackathon**

[🌐 Live Demo](https://cloud-shift-radar.vercel.app) • [📚 Documentation](#-table-of-contents) • [🚀 API Reference](#-api-endpoints) • [🗺️ Roadmap](#-future-roadmap)

</div>
