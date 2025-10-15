# GitHub Copilot CLI - Quick Start Guide

**Status:** ✅ Installed and Ready  
**Version:** 1.1.1 (2025-06-17)  
**Date:** October 12, 2025

---

## 🚀 Installation Complete

GitHub Copilot CLI has been successfully installed via the GitHub CLI extension system.

```bash
✓ Installed extension github/gh-copilot
```

---

## 📋 Available Commands

### 1. **Suggest Commands** - Get shell command suggestions
```bash
gh copilot suggest "your natural language request"
```

**Examples:**
```bash
# Get a command to find large files
gh copilot suggest "find all files larger than 100MB"

# Get git commands
gh copilot suggest -t git "undo the last commit"

# Get GitHub CLI commands
gh copilot suggest -t gh "create a pull request"

# Get shell commands (default)
gh copilot suggest "compress all images in this directory"
```

### 2. **Explain Commands** - Understand what a command does
```bash
gh copilot explain "command to explain"
```

**Examples:**
```bash
# Explain a complex command
gh copilot explain "find . -type f -name '*.log' -mtime +30 -delete"

# Explain git commands
gh copilot explain "git log --oneline --graph --decorate --all"

# Explain docker commands
gh copilot explain "docker run -d -p 8080:80 nginx"
```

### 3. **Configure** - Set up preferences
```bash
gh copilot config
```

---

## 🎯 Shell Aliases (Optional)

For easier access, you can add these aliases to your shell profile:

### For Bash (~/.bashrc or ~/.bash_profile):
```bash
# Add GitHub Copilot CLI aliases
eval "$(gh copilot alias -- bash)"
```

### For Zsh (~/.zshrc):
```bash
# Add GitHub Copilot CLI aliases
eval "$(gh copilot alias -- zsh)"
```

### After setting up aliases, you can use:
- `ghcs` instead of `gh copilot suggest`
- `ghce` instead of `gh copilot explain`

**Example:**
```bash
ghcs "find all node_modules folders and delete them"
ghce "npm run build"
```

---

## 💡 Common Use Cases for This Project

### 1. **Project Management**
```bash
# Find all TypeScript errors
gh copilot suggest "find all TypeScript compilation errors in the project"

# Check bundle size
gh copilot suggest "analyze the size of files in the dist folder"

# Find unused dependencies
gh copilot suggest "find unused npm packages in package.json"
```

### 2. **Git Operations**
```bash
# Create descriptive commit
gh copilot suggest -t git "commit all security fixes with a descriptive message"

# Clean up branches
gh copilot suggest -t git "delete all merged branches except main and production"

# View file history
gh copilot suggest -t git "show commit history for SECURITY_AUDIT_REPORT.md"
```

### 3. **Database Operations**
```bash
# Connect to Supabase
gh copilot suggest "connect to PostgreSQL database with connection string"

# Backup database
gh copilot suggest "create a backup of PostgreSQL database"
```

### 4. **Deployment**
```bash
# Build for production
gh copilot suggest "build React app for production with optimizations"

# Deploy to Netlify
gh copilot suggest "deploy to Netlify from command line"

# Deploy Supabase functions
gh copilot suggest "deploy all Supabase edge functions"
```

### 5. **Security & Testing**
```bash
# Check for vulnerabilities
gh copilot suggest "scan npm dependencies for security vulnerabilities"

# Run tests
gh copilot suggest "run all tests and generate coverage report"

# Check environment variables
gh copilot suggest "check if all required environment variables are set"
```

### 6. **Code Analysis**
```bash
# Find large files
gh copilot suggest "find the 10 largest files in the project"

# Count lines of code
gh copilot suggest "count total lines of TypeScript code"

# Find TODO comments
gh copilot suggest "find all TODO and FIXME comments in the codebase"
```

---

## 🎨 Interactive Mode

Run without arguments for an interactive experience:

```bash
gh copilot suggest
```

This will prompt you for:
1. The target (shell, git, or gh)
2. Your natural language request
3. Whether to execute the suggested command

---

## 🔧 Configuration Options

View and modify settings:

```bash
# Open configuration menu
gh copilot config

# Available settings:
# - GitHub host
# - Default editor
# - Output format preferences
```

---

## 📖 Command Reference

### Suggest Command Targets

| Target | Description | Example |
|--------|-------------|---------|
| `shell` | General shell commands (default) | `gh copilot suggest "find large files"` |
| `git` | Git-specific commands | `gh copilot suggest -t git "revert last commit"` |
| `gh` | GitHub CLI commands | `gh copilot suggest -t gh "list my PRs"` |

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--help` | `-h` | Show help message |
| `--version` | `-v` | Show version |
| `--target` | `-t` | Specify target (shell/git/gh) |
| `--debug` | `-d` | Enable debug mode |
| `--hostname` | | Specify GitHub hostname |

---

## 🚨 Important Notes

1. **Authentication Required:** You must be authenticated with GitHub CLI
   ```bash
   gh auth login
   ```

2. **Copilot License:** Requires an active GitHub Copilot subscription

3. **Review Before Executing:** Always review suggested commands before running them, especially:
   - Commands that delete files
   - Commands with `sudo`
   - Commands that modify system settings
   - Database operations

4. **Internet Connection:** Requires active internet connection to communicate with GitHub Copilot API

---

## 🎓 Quick Tips

1. **Be Specific:** The more specific your request, the better the suggestion
   ```bash
   # Less specific
   gh copilot suggest "deploy"
   
   # More specific
   gh copilot suggest "deploy React app to Netlify with environment variables"
   ```

2. **Use Context:** Mention your current environment
   ```bash
   gh copilot suggest "start PostgreSQL on Ubuntu 20.04"
   ```

3. **Iterate:** If the first suggestion isn't perfect, refine your request

4. **Explain First:** If you're unsure about a command, explain it first
   ```bash
   ghce "rm -rf /"  # Will warn you about dangerous commands!
   ```

---

## 📊 Project-Specific Examples

### For Talk to My Lawyer Project

```bash
# Start development server
gh copilot suggest "start Vite development server on port 5174"

# Deploy Supabase functions
gh copilot suggest "deploy all Supabase edge functions with authentication"

# Check TypeScript errors
gh copilot suggest "check TypeScript errors in all .ts and .tsx files"

# Build and analyze
gh copilot suggest "build project and show bundle size breakdown"

# Git workflow
gh copilot suggest -t git "create new feature branch from production"

# Environment setup
gh copilot suggest "copy .env.example to .env and open in editor"
```

---

## 🔗 Additional Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Copilot Subscription](https://github.com/features/copilot)

---

## ✅ Verification

Test your installation:

```bash
# Check version
gh copilot --version

# Try a simple suggestion
gh copilot suggest "list all files in current directory"

# Try explain
gh copilot explain "ls -lah"
```

**Status: GitHub Copilot CLI is ready to use! 🎉**

---

**Setup Completed:** October 12, 2025  
**Next Steps:** Try running `gh copilot suggest` with your own queries!
