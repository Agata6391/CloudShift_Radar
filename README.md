# CloudShift Radar MVP

CloudShift Radar is a Bob-powered cloud migration readiness assessment tool for legacy applications.

The product promise is simple: **Know what will break before you migrate.**

CloudShift Radar owns the repository ZIP upload flow, safe scanner, backend API, and dashboard. Bob is the visible AI modernization analyst that interprets repository findings, classifies risk, explains confidence, escalates uncertainty, and produces the final migration readiness verdict.

## Bob-First Positioning

Bob is not a secondary tab or decorative assistant. In this MVP, Bob is the main reasoning layer:

- The scanner extracts raw technical signals.
- The backend sends summarized migration context and scan context to Bob Shell.
- Bob classifies findings by severity, confidence, and resolution level.
- Bob decides which items need human review.
- Bob generates the readiness score, recommended decision, and final verdict.
- The dashboard presents Bob's executive and technical analysis.

Real scan routes require Bob Shell configuration. If configuration is missing, the backend returns:

```json
{
  "error": "Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY."
}
```

If Bob Shell is not installed or cannot be executed, the backend returns:

```json
{
  "error": "Bob Shell executable was not found. Install Bob Shell or configure BOB_SHELL_COMMAND."
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
- IBM Bob Shell invoked server-side in non-interactive mode
- `yauzl` for safe ZIP inspection and extraction

## Bob Shell Integration

1. Install Bob Shell.
2. Create an IBM Bob API key with Inference scope.
3. Copy the API key value when it is created.
4. Add it to `.env` as `BOBSHELL_API_KEY`.
5. Set `BOB_PROVIDER=shell`.
6. Set `BOB_SHELL_COMMAND` for your install location.
7. Accept the license once before running scans:

```bash
bob --accept-license -p "Explain this project"
```

8. Run the app:

```bash
corepack enable
pnpm install
pnpm dev
```

The backend invokes Bob Shell server-side with:

```bash
bob --auth-method apikey --hide-intermediary-output -p "<prompt>"
```

The key is passed through the child process environment as `BOBSHELL_API_KEY`; it is never passed as a command argument and is never exposed to the frontend. Real scans require Bob Shell. Mock data is only available through explicit frontend UI preview mode.

Bob Shell may be installed from a downloaded IBM package using pnpm. The included setup script assumes a placeholder package path:

```bash
pnpm setup:bob
```

`./vendor/bobshell.tgz` is a placeholder path. Replace it with the actual Bob Shell package file downloaded from IBM if the file name differs.

Command path examples:

```bash
# Windows local package install
BOB_SHELL_COMMAND=.\node_modules\.bin\bob.cmd

# Linux/macOS local package install
BOB_SHELL_COMMAND=./node_modules/.bin/bob

# Global install fallback
BOB_SHELL_COMMAND=bob
```

You can verify Bob Shell with:

```bash
pnpm check:bob
```

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

Add Bob Shell configuration to `.env` before running a real scan:

```bash
BOB_PROVIDER=shell
BOBSHELL_API_KEY=your_key
BOB_SHELL_COMMAND=.\node_modules\.bin\bob.cmd
BOB_TIMEOUT_MS=60000
PORT=4000
FRONTEND_URL=http://localhost:5173
```

On Linux/macOS with a local package install, use `BOB_SHELL_COMMAND=./node_modules/.bin/bob`. For a global install, use `BOB_SHELL_COMMAND=bob`.

## pnpm Commands

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm build
pnpm build:frontend
pnpm build:backend
pnpm typecheck
pnpm setup:bob
pnpm check:bob
pnpm clean
```

The default frontend runs on `http://localhost:5173`. The backend runs on `http://localhost:4000`.

## Site Map

- `/` - Product home with Bob-first positioning
- `/assessment` - Three-step migration context and repository input flow
- `/results` - Bob verdict, metrics, Migration Impact Findings, human review, action plan, migration report, and Bob reasoning trace

## Backend API Routes

- `GET /api/health`
  - Returns Bob Shell provider/configuration status without secrets
  - Example: `{ "ok": true, "bobProvider": "shell", "bobConfigured": true, "bobCommandConfigured": true }`
- `POST /api/scans`
  - Accepts multipart form data with migration context and repository ZIP
  - Requires Bob Shell configuration
  - Validates, extracts, scans, sends summarized context to Bob Shell, stores result, returns `ScanResult`
- `POST /api/scans/demo`
  - Sends included demo scan context to Bob Shell
  - Requires Bob Shell configuration
  - Does not silently fall back to mock data
- `GET /api/scans/:scanId`
  - Returns stored scan result JSON

## Environment Variables

```bash
BOB_PROVIDER=shell
BOBSHELL_API_KEY=
BOB_SHELL_COMMAND=.\node_modules\.bin\bob.cmd
BOB_TIMEOUT_MS=60000
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Rules:

- Never put `BOBSHELL_API_KEY` in frontend code.
- Do not create `VITE_BOBSHELL_API_KEY`, `VITE_BOB_API_KEY`, or `VITE_BOB_API_URL`.
- `BOB_API_KEY`, `BOB_API_URL`, and `BOB_MODEL` are not used by this integration.
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

The scanner produces summarized signals only. The Bob prompt includes migration context, repository file tree, detected technical signals, environment gaps, hardcoded infrastructure, and preliminary findings. It does not send raw full repository files to Bob, and prompt construction redacts common key, secret, token, password, and credential patterns before invoking Bob Shell.

## Bob Output Normalization

Bob Shell must return valid JSON matching the expected `ScanResult` assessment shape. `normalizeBobResponse.ts` accepts raw stdout, extracts the first JSON object if Bob prints surrounding text, validates required fields, and normalizes optional arrays safely.

If Bob output cannot be parsed, the backend returns:

```json
{
  "error": "Bob returned output that could not be parsed as ScanResult JSON."
}
```

No mock data is used as a fallback for real scan routes.

## Results Dashboard

Technical Findings and Feature Survival are merged into **Migration Impact Findings**. Each Bob finding now carries both the technical issue and the affected feature area.

Each finding has a **See details** collapsible panel containing:

- Bob rationale
- Affected files
- Business impact
- Migration impact
- Feature survival state
- Recommended action
- Suggested reviewer when Bob escalates the item
- Human review reason when applicable

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
- Bob Shell must be installed and licensed on the backend machine before real scans can run.
- The frontend supports explicit mock preview mode for UI development only.
- Stored scan results are JSON files in `scan-results/`, not a production database.
