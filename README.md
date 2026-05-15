# CloudShift Radar MVP

CloudShift Radar is a Bob-powered cloud migration readiness assessment tool for legacy applications.

The product promise is simple: **Know what will break before you migrate.**

CloudShift Radar owns the repository ZIP upload flow, safe scanner, backend API, and dashboard. Bob is the visible AI modernization analyst that interprets repository findings, classifies risk, explains confidence, escalates uncertainty, and produces the final migration readiness verdict.

## Bob-First Positioning

Bob is not a secondary tab or decorative assistant. In this MVP, Bob is the main reasoning layer:

- The scanner extracts raw technical signals.
- The backend sends the migration context and scan context to Bob.
- Bob classifies findings by severity, confidence, and resolution level.
- Bob decides which items need human review.
- Bob generates the readiness score, recommended decision, and final verdict.
- The dashboard presents Bob's executive and technical analysis.

Real scan routes require Bob API configuration. If configuration is missing, the backend returns:

```json
{
  "error": "Bob API is required for this assessment. Configure BOB_API_KEY and BOB_API_URL."
}
```

The frontend never receives or exposes the Bob API key.

## Tech Stack

- pnpm workspaces
- TypeScript
- Vite + React frontend
- Node.js + Fastify backend
- Shared TypeScript types
- Plain CSS
- `undici` for server-side Bob API calls
- `yauzl` for safe ZIP inspection and extraction

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

Add Bob credentials to `.env` before running a real scan:

```bash
BOB_API_KEY=your_key
BOB_API_URL=https://your-bob-endpoint.example.com
BOB_MODEL=optional_model_name
```

## pnpm Commands

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm build
pnpm build:frontend
pnpm build:backend
pnpm typecheck
pnpm clean
```

The default frontend runs on `http://localhost:5173`. The backend runs on `http://localhost:4000`.

## Site Map

- `/` - Product home with Bob-first positioning
- `/assessment` - Three-step migration context and repository input flow
- `/results` - Bob verdict, metrics, findings, feature survival, human review, action plan, migration report, and Bob reasoning trace

## Backend API Routes

- `GET /api/health`
  - Returns `{ "ok": true, "bobConfigured": true | false }`
  - Does not expose secret values
- `POST /api/scans`
  - Accepts multipart form data with migration context and repository ZIP
  - Requires Bob configuration
  - Validates, extracts, scans, sends context to Bob, stores result, returns `ScanResult`
- `POST /api/scans/demo`
  - Sends included demo scan context to Bob
  - Requires Bob configuration
  - Does not silently fall back to mock data
- `GET /api/scans/:scanId`
  - Returns stored scan result JSON

## Environment Variables

```bash
BOB_API_KEY=
BOB_API_URL=
BOB_MODEL=
BOB_TIMEOUT_MS=60000
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Rules:

- Never put `BOB_API_KEY` in frontend code.
- Do not create `VITE_BOB_API_KEY`.
- Do not commit real keys.
- Backend reads Bob credentials from server-side environment variables only.
- Frontend calls only backend API routes.

## ZIP Upload Security Model

Uploaded repositories are untrusted. The backend:

- Never executes uploaded code.
- Never installs dependencies from uploaded repositories.
- Never runs npm, pnpm, yarn, pip, Gradle, Maven, Docker, or shell commands inside uploaded repositories.
- Reads text files only.
- Ignores binary files and nested ZIP/archive files.
- Prevents path traversal during extraction.
- Enforces maximum ZIP size, extracted file size, and total extracted size.
- Ignores folders such as `node_modules`, `vendor`, `dist`, `build`, `.git`, `.next`, `.cache`, `coverage`, `venv`, and `__pycache__`.
- Scans only approved file types such as `.env`, `.env.example`, `Dockerfile`, `docker-compose.yml`, `package.json`, `requirements.txt`, `pom.xml`, `build.gradle`, `application.yml`, README files, JS/TS/Python/Java/JSON/YAML/Terraform/Markdown files.

## Bob API Integration

The backend adapter in `backend/src/bob/bobClient.ts` sends the dynamically built assessment prompt to `BOB_API_URL` with:

- `Authorization: Bearer ${BOB_API_KEY}`
- Optional `BOB_MODEL`
- Timeout from `BOB_TIMEOUT_MS`

Because Bob API response shapes may vary, `normalizeBobResponse.ts` accepts common response styles, extracts JSON from plain text when needed, validates key fields, and normalizes the output into the shared `ScanResult` shape.

## Bob Analysis Trace

The results dashboard includes a Bob Reasoning Trace tab with:

- Session summary
- Repository architecture interpretation
- Cloud dependency reasoning
- Risk classification rationale
- Confidence rationale
- Human review rationale
- Recommended modernization notes
- Trace timeline

This is intended to make Bob's modernization reasoning inspectable for CTOs, PMs, tech leads, developers, and DevOps engineers.

## Future Scanner Expansion Plan

- Add language-specific AST parsing for JavaScript, TypeScript, Python, and Java.
- Detect dependency graph edges and service initialization paths.
- Parse CI/CD workflow files more deeply.
- Add IaC-specific analysis for Terraform, CloudFormation, and Kubernetes manifests.
- Track confidence at the scanner-evidence level before Bob classification.
- Add per-provider migration target rules for AWS, GCP, Azure, and hybrid targets.

## Future GitHub Integration Plan

The UI includes a disabled "Connect GitHub repository" card marked Coming Soon. A future version should:

- Add server-side GitHub app or OAuth flow.
- Fetch repositories server-side.
- Apply the same security scanner rules to checked-out content.
- Avoid running repository scripts or installing dependencies.
- Preserve Bob as the final modernization analyst.

## Known MVP Limitations

- The scanner uses pattern-based text analysis rather than full AST analysis.
- Demo scan context is representative, not a bundled full sample application.
- Bob endpoint shape is intentionally adapter-based because the final Bob API contract may vary.
- The frontend supports explicit mock preview mode for UI development only.
- Stored scan results are JSON files in `scan-results/`, not a production database.
