#!/bin/bash

# Bob Shell Installation Script for Linux/macOS
# Cloud_Radar Project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SKIP_INSTALL=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-install)
      SKIP_INSTALL=true
      shift
      ;;
    *)
      echo -e "${RED}[FAIL] Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

write_step() {
  echo ""
  echo -e "${CYAN}==> $1${NC}"
}

write_ok() {
  echo -e "${GREEN}[OK] $1${NC}"
}

write_warn() {
  echo -e "${YELLOW}[WARN] $1${NC}"
}

write_fail() {
  echo -e "${RED}[FAIL] $1${NC}"
}

get_node_version() {
  node -v 2>/dev/null | sed 's/v//' || echo ""
}

assert_node_version() {
  write_step "Checking Node.js version"

  local version=$(get_node_version)
  
  if [ -z "$version" ]; then
    write_fail "Node.js is not installed or is not available in PATH."
    exit 1
  fi

  local required="22.15.0"
  
  # Simple version comparison
  if [ "$(printf '%s\n' "$required" "$version" | sort -V | head -n1)" != "$required" ]; then
    write_fail "Bob Shell requires Node.js 22.15.0 or later. Current version: $version"
    exit 1
  fi

  write_ok "Node.js $version detected"
}

install_bob_shell() {
  if [ "$SKIP_INSTALL" = true ]; then
    write_warn "Skipping Bob Shell installation"
    return
  fi

  write_step "Installing IBM Bob Shell using official installer"

  if command -v curl &> /dev/null; then
    curl -fsSL https://bob.ibm.com/download/bobshell.sh | bash
  elif command -v wget &> /dev/null; then
    wget -qO- https://bob.ibm.com/download/bobshell.sh | bash
  else
    write_fail "Neither curl nor wget found. Please install one of them."
    exit 1
  fi

  write_ok "Bob Shell installer finished"
}

resolve_bob_command() {
  write_step "Resolving Bob Shell executable path"

  # Check if bob is in PATH
  if command -v bob &> /dev/null; then
    local bob_path=$(command -v bob)
    write_ok "bob command found in PATH: $bob_path"
    echo "$bob_path"
    return 0
  fi

  # Check common installation locations
  local npm_prefix=$(npm config get prefix 2>/dev/null || echo "$HOME/.npm-global")
  local bob_bin="$npm_prefix/bin/bob"

  if [ -f "$bob_bin" ]; then
    write_ok "Found bob at: $bob_bin"
    echo "$bob_bin"
    return 0
  fi

  # Check in node_modules
  if [ -f "./node_modules/.bin/bob" ]; then
    write_ok "Found bob in local node_modules"
    echo "./node_modules/.bin/bob"
    return 0
  fi

  write_fail "Bob Shell was not found. Possible solutions:"
  echo "1. Close and reopen your terminal"
  echo "2. Run: source ~/.bashrc (or ~/.zshrc)"
  echo "3. Run this script again: npm run setup:bob"
  echo "4. Verify Bob Shell installed: npm list -g @ibm/bob-shell"
  exit 1
}

update_env_file() {
  local bob_cmd_path=$1
  write_step "Updating .env with Bob Shell configuration"

  local root_dir=$(pwd)
  local env_path="$root_dir/.env"
  local env_example_path="$root_dir/.env.example"

  # Create .env if it doesn't exist
  if [ ! -f "$env_path" ]; then
    if [ -f "$env_example_path" ]; then
      cp "$env_example_path" "$env_path"
      write_ok "Created .env from .env.example"
    else
      touch "$env_path"
      write_ok "Created empty .env"
    fi
  fi

  # Update or add configuration
  local temp_file=$(mktemp)
  local updated=false

  # Read existing .env and update values
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ $line =~ ^BOB_PROVIDER= ]]; then
      echo "BOB_PROVIDER=shell" >> "$temp_file"
      updated=true
    elif [[ $line =~ ^BOB_SHELL_COMMAND= ]]; then
      echo "BOB_SHELL_COMMAND=$bob_cmd_path" >> "$temp_file"
      updated=true
    elif [[ $line =~ ^BOB_TIMEOUT_MS= ]]; then
      echo "BOB_TIMEOUT_MS=600000" >> "$temp_file"
      updated=true
    else
      echo "$line" >> "$temp_file"
    fi
  done < "$env_path"

  # Add missing variables
  if ! grep -q "^BOB_PROVIDER=" "$env_path"; then
    echo "BOB_PROVIDER=shell" >> "$temp_file"
  fi
  if ! grep -q "^BOB_SHELL_COMMAND=" "$env_path"; then
    echo "BOB_SHELL_COMMAND=$bob_cmd_path" >> "$temp_file"
  fi
  if ! grep -q "^BOB_TIMEOUT_MS=" "$env_path"; then
    echo "BOB_TIMEOUT_MS=600000" >> "$temp_file"
  fi

  mv "$temp_file" "$env_path"

  write_ok ".env updated successfully"
  echo ""
  echo -e "${CYAN}Configuration:${NC}"
  echo "  BOB_PROVIDER=shell"
  echo "  BOB_SHELL_COMMAND=$bob_cmd_path"
  echo "  BOB_TIMEOUT_MS=600000"
}

test_bob_shell() {
  local bob_cmd_path=$1
  write_step "Testing Bob Shell executable"

  if "$bob_cmd_path" --version &> /dev/null; then
    write_ok "Bob Shell executable works correctly"
  else
    write_warn "Bob Shell test returned non-zero exit code"
  fi
}

# Main execution
main() {
  echo ""
  echo -e "${CYAN}============================================${NC}"
  echo -e "${CYAN}  Bob Shell Setup for Cloud_Radar${NC}"
  echo -e "${CYAN}============================================${NC}"

  assert_node_version
  install_bob_shell
  bob_cmd_path=$(resolve_bob_command)
  update_env_file "$bob_cmd_path"
  test_bob_shell "$bob_cmd_path"

  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}[OK] Bob Shell setup completed successfully!${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Add your BOBSHELL_API_KEY to .env manually"
  echo "   Get your API key from: https://bob.ibm.com"
  echo ""
  echo "2. Verify Bob Shell configuration:"
  echo "   npm run check:bob"
  echo ""
  echo "3. Start the application:"
  echo "   npm run dev"
  echo ""
}

main

# Made with Bob
