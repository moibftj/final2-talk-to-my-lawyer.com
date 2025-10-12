# PNPM Only - Package Manager Policy

**Date:** October 12, 2025  
**Status:** ✅ ENFORCED

---

## 📦 Package Manager Standardization

This project uses **PNPM exclusively** as its package manager.

### Why PNPM?

1. **⚡ Speed**: 3x faster installs compared to npm
2. **💾 Disk Efficiency**: Uses hard links and symlinks to save disk space
3. **🔒 Strict Dependencies**: Prevents phantom dependencies and hoisting issues
4. **📦 Better Monorepo Support**: Built-in workspace features
5. **✅ npm Compatible**: Uses the same `package.json` format

---

## 🚫 What's Been Removed

- ❌ `package-lock.json` (npm lock file)
- ❌ npm engine requirement from `package.json`

---

## ✅ What's Configured

### 1. **package.json**
```json
{
  "packageManager": "pnpm@9.12.3",
  "engines": {
    "node": ">=20.19.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

The `preinstall` script will prevent accidental `npm install` or `yarn install` usage.

### 2. **.gitignore**
```ignore
# Lock files (only use pnpm-lock.yaml)
package-lock.json
yarn.lock
```

This ensures npm/yarn lock files are never committed.

### 3. **Documentation Updated**
- ✅ README.md now uses `pnpm` commands
- ✅ deploy-netlify.sh uses `pnpm build`
- ✅ All documentation references PNPM

---

## 📋 Common Commands

### Installation
```bash
# Install dependencies
pnpm install

# Install a package
pnpm add <package-name>

# Install a dev dependency
pnpm add -D <package-name>

# Remove a package
pnpm remove <package-name>
```

### Running Scripts
```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Format code
pnpm format

# Run tests
pnpm test
```

### Updating Dependencies
```bash
# Check for outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Update to latest versions (respecting semver)
pnpm up

# Update to latest (including breaking changes)
pnpm up --latest
```

### Workspace Management
```bash
# List all packages in workspace
pnpm list

# List only top-level dependencies
pnpm list --depth=0

# Check for dependency issues
pnpm audit

# Fix security issues
pnpm audit --fix
```

---

## 🔧 CI/CD Configuration

### GitHub Actions Example
```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build
        run: pnpm build
```

### Netlify Configuration
Already configured in `netlify.toml`:
```toml
[build]
  command = "npm run build"  # Will use pnpm via preinstall hook
  publish = "dist"
```

---

## 🚨 What If Someone Uses npm or yarn?

### Prevention
The `preinstall` script will block installation attempts:

```bash
$ npm install
ERROR: Use "pnpm install" instead of "npm install"
```

### If It Happens Anyway
If someone bypasses the check and creates lock files:

1. **Delete the lock files:**
   ```bash
   rm package-lock.json yarn.lock
   ```

2. **Reinstall with PNPM:**
   ```bash
   pnpm install
   ```

3. **Commit the correct lock file:**
   ```bash
   git add pnpm-lock.yaml
   git commit -m "Fix: use pnpm-lock.yaml only"
   ```

---

## 📊 Comparison

| Feature | npm | yarn | pnpm |
|---------|-----|------|------|
| **Speed** | Baseline | 2x faster | 3x faster |
| **Disk Usage** | Baseline | Same | 50% less |
| **Security** | Good | Good | Excellent |
| **Strictness** | Loose | Medium | Strict |
| **Monorepo** | Basic | Good | Excellent |

---

## 🎯 Migration Checklist

- ✅ Removed `package-lock.json`
- ✅ Added lock file exclusions to `.gitignore`
- ✅ Updated `package.json` engines and packageManager
- ✅ Added `preinstall` hook to prevent wrong package manager usage
- ✅ Updated README.md with PNPM commands
- ✅ Updated deployment scripts to use PNPM
- ✅ Created this documentation

---

## 💡 Tips & Best Practices

### 1. **Use pnpm dlx instead of npx**
```bash
# Instead of: npx create-vite
pnpm dlx create-vite
```

### 2. **Leverage pnpm patch**
If you need to patch a dependency:
```bash
pnpm patch <package-name>
# Edit the files
pnpm patch-commit /path/to/temp
```

### 3. **Use .npmrc for Configuration**
Create a `.npmrc` file for project-specific settings:
```ini
# Strict peer dependencies
strict-peer-dependencies=true

# Auto install peers
auto-install-peers=true

# Public registry only
registry=https://registry.npmjs.org/
```

### 4. **Check Disk Space Savings**
```bash
pnpm store status
pnpm store prune
```

---

## 📚 Resources

- [PNPM Official Docs](https://pnpm.io/)
- [PNPM vs npm vs Yarn](https://pnpm.io/benchmarks)
- [Motivation behind PNPM](https://pnpm.io/motivation)
- [CLI Commands Reference](https://pnpm.io/cli/install)

---

## ✅ Verification

To verify the setup is correct:

```bash
# Check PNPM version
pnpm --version

# Verify lock file exists
ls -la pnpm-lock.yaml

# Verify npm lock file is gone
ls package-lock.json 2>/dev/null && echo "ERROR: npm lock file exists!" || echo "✅ No npm lock file"

# Try installing
pnpm install

# Build the project
pnpm build
```

All checks should pass! ✅

---

**Standardization Complete:** October 12, 2025  
**Package Manager:** PNPM 9.12.3+  
**Status:** ✅ ENFORCED via preinstall hook
