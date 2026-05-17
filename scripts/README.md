# Scripts Directory

This directory contains automation scripts for Cloud_Radar project setup and maintenance.

## Available Scripts

### install-bob-shell.ps1 (Windows)

PowerShell script to automate IBM Bob Shell installation and configuration for Windows.

### install-bob-shell.sh (Linux/macOS)

Bash script to automate IBM Bob Shell installation and configuration for Linux and macOS.

**Purpose:**
- Validates Node.js version (requires 22.15.0+)
- Installs IBM Bob Shell from official source
- Detects Bob Shell executable path
- Configures `.env` file automatically
- Tests Bob Shell installation

**Usage:**

```bash
# Full installation (recommended for first-time setup)
# Works on Windows, Linux, and macOS
pnpm setup:bob

# Skip installation, only configure (if Bob Shell already installed)
pnpm setup:bob:local
```

**Platform Detection:**
The npm scripts automatically detect your operating system:
- **Windows**: Runs `install-bob-shell.ps1` (PowerShell)
- **Linux/macOS**: Runs `install-bob-shell.sh` (Bash)

**What it does:**

1. âœ… Checks Node.js version compatibility
2. ðŸ“¦ Downloads and installs Bob Shell from https://bob.ibm.com
3. ðŸ” Locates `bob.cmd` in `%APPDATA%\npm\`
4. âš™ï¸ Updates `.env` with:
   - `BOB_PROVIDER=shell`
   - `BOB_SHELL_COMMAND=<path-to-bob.cmd>`
   - `BOB_TIMEOUT_MS=600000`
5. âœ”ï¸ Tests Bob Shell executable

**After running:**

1. Manually add your API key to `.env`:
   ```bash
   BOBSHELL_API_KEY=<BOBSHELL_API_KEY_PLACEHOLDER>
   ```

2. Verify configuration:
   ```bash
   pnpm check:bob
   ```

3. Start the application:
   ```bash
   pnpm dev
   ```

**Troubleshooting:**

- **"Bob Shell was not found"**: Close and reopen your terminal, then run `pnpm setup:bob` again
- **"Node.js version too old"**: Update Node.js to version 22.15.0 or later
- **"bob command not in PATH"**: Restart your terminal after installation

**Security Notes:**

- âš ï¸ Never commit `.env` file with real API keys
- âš ï¸ Keep `BOBSHELL_API_KEY` secret
- âœ… Script does NOT write API keys (you add them manually)
- âœ… `.env` is already in `.gitignore`

## Parameters

### install-bob-shell.ps1 (Windows)

- `-SkipInstall`: Skip Bob Shell installation, only configure existing installation
  ```powershell
  .\scripts\install-bob-shell.ps1 -SkipInstall
  ```

### install-bob-shell.sh (Linux/macOS)

- `--skip-install`: Skip Bob Shell installation, only configure existing installation
  ```bash
  bash ./scripts/install-bob-shell.sh --skip-install
  ```

## Requirements

### Windows
- Windows 10/11
- PowerShell 5.1 or later
- Node.js 22.15.0 or later
- Internet connection (for Bob Shell download)

### Linux/macOS
- Linux (Ubuntu 20.04+, Debian 10+, etc.) or macOS 10.15+
- Bash shell
- Node.js 22.15.0 or later
- curl or wget
- Internet connection (for Bob Shell download)

## Related Files

- `package.json` - Contains `setup:bob` and `setup:bob:local` scripts
- `.env.example` - Template for environment variables
- `.env` - Generated/updated by this script (not in git)
- `backend/src/bob/checkBobShell.ts` - Validates Bob Shell configuration
