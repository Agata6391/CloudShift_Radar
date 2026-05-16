param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Write-Ok($message) {
  Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-Warn($message) {
  Write-Host "[WARN] $message" -ForegroundColor Yellow
}

function Write-Fail($message) {
  Write-Host "[FAIL] $message" -ForegroundColor Red
}

function Get-NodeVersion {
  $nodeVersionRaw = node -v 2>$null

  if (-not $nodeVersionRaw) {
    throw "Node.js is not installed or is not available in PATH."
  }

  return $nodeVersionRaw.TrimStart("v")
}

function Assert-NodeVersion {
  Write-Step "Checking Node.js version"

  $version = Get-NodeVersion
  $required = [Version]"22.15.0"
  $current = [Version]$version

  if ($current -lt $required) {
    throw "Bob Shell requires Node.js 22.15.0 or later. Current version: $version"
  }

  Write-Ok "Node.js $version detected"
}

function Install-BobShell {
  if ($SkipInstall) {
    Write-Warn "Skipping Bob Shell installation"
    return
  }

  Write-Step "Installing IBM Bob Shell using official installer"

  try {
    powershell -ep Bypass 'irm -Uri "https://bob.ibm.com/download/bobshell.ps1" | iex'
    Write-Ok "Bob Shell installer finished"
  } catch {
    Write-Fail "Bob Shell installation failed: $($_.Exception.Message)"
    throw
  }
}

function Resolve-BobCommand {
  Write-Step "Resolving Bob Shell executable path"

  $bobCmd = Join-Path $env:APPDATA "npm\bob.cmd"

  # Check if bob is in PATH
  $command = Get-Command bob -ErrorAction SilentlyContinue
  if ($command) {
    Write-Ok "bob command found in PATH: $($command.Source)"
  } else {
    Write-Warn "bob command not in PATH yet. You may need to restart your terminal."
  }

  # Check if bob.cmd exists
  if (Test-Path $bobCmd) {
    Write-Ok "Found bob.cmd at: $bobCmd"
    return $bobCmd
  }

  # If not found, provide helpful error
  throw @"
Bob Shell was not found at: $bobCmd

Possible solutions:
1. Close and reopen PowerShell/Terminal
2. Run: pnpm setup:bob again
3. Verify Bob Shell installed correctly: npm list -g @ibm/bob-shell
"@
}

function Update-EnvFile($bobCmdPath) {
  Write-Step "Updating .env with Bob Shell configuration"

  $rootDir = (Get-Location).Path
  $envPath = Join-Path $rootDir ".env"
  $envExamplePath = Join-Path $rootDir ".env.example"

  # Create .env if it doesn't exist
  if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
      Copy-Item $envExamplePath $envPath
      Write-Ok "Created .env from .env.example"
    } else {
      New-Item -Path $envPath -ItemType File | Out-Null
      Write-Ok "Created empty .env"
    }
  }

  $content = Get-Content $envPath -Raw

  # Update only these 3 variables
  $updates = @{
    "BOB_PROVIDER" = "shell"
    "BOB_SHELL_COMMAND" = $bobCmdPath
    "BOB_TIMEOUT_MS" = "600000"
  }

  foreach ($key in $updates.Keys) {
    $value = $updates[$key]
    $escapedKey = [regex]::Escape($key)

    if ($content -match "(?m)^$escapedKey=") {
      # Update existing line
      $content = $content -replace "(?m)^$escapedKey=.*$", "$key=$value"
    } else {
      # Add new line
      if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
        $content += "`n"
      }
      $content += "$key=$value`n"
    }
  }

  Set-Content -Path $envPath -Value $content -Encoding UTF8

  Write-Ok ".env updated successfully"
  Write-Host ""
  Write-Host "Configuration:" -ForegroundColor Cyan
  Write-Host "  BOB_PROVIDER=shell"
  Write-Host "  BOB_SHELL_COMMAND=$bobCmdPath"
  Write-Host "  BOB_TIMEOUT_MS=600000"
}

function Test-BobShell($bobCmdPath) {
  Write-Step "Testing Bob Shell executable"

  try {
    & $bobCmdPath --version 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
      Write-Ok "Bob Shell executable works correctly"
    } else {
      Write-Warn "Bob Shell returned exit code: $LASTEXITCODE"
    }
  } catch {
    Write-Fail "Bob Shell test failed: $($_.Exception.Message)"
    throw
  }
}

# Main execution
try {
  Write-Host ""
  Write-Host "============================================" -ForegroundColor Cyan
  Write-Host "  Bob Shell Setup for Cloud_Radar" -ForegroundColor Cyan
  Write-Host "============================================" -ForegroundColor Cyan

  Assert-NodeVersion
  Install-BobShell
  $bobCmdPath = Resolve-BobCommand
  Update-EnvFile $bobCmdPath
  Test-BobShell $bobCmdPath

  Write-Host ""
  Write-Host "============================================" -ForegroundColor Green
  Write-Ok "Bob Shell setup completed successfully!"
  Write-Host "============================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "Next steps:" -ForegroundColor Yellow
  Write-Host "1. Add your BOBSHELL_API_KEY to .env manually"
  Write-Host "   Get your API key from: https://bob.ibm.com"
  Write-Host ""
  Write-Host "2. Verify Bob Shell configuration:"
  Write-Host "   pnpm check:bob"
  Write-Host ""
  Write-Host "3. Start the application:"
  Write-Host "   pnpm dev"
  Write-Host ""

} catch {
  Write-Host ""
  Write-Fail "Setup failed: $($_.Exception.Message)"
  Write-Host ""
  exit 1
}

# Made with Bob
