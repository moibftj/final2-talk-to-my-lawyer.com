# Package Manager Guide

## 📦 This Project Uses PNPM

This project uses **pnpm** as the package manager for better performance and disk space efficiency.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Run preview
pnpm run preview

# Run tests
pnpm run test

# Format code
pnpm run format
```

## 🔄 Common Commands Comparison

| Task | npm | pnpm |
|------|-----|------|
| Install deps | `npm install` | `pnpm install` |
| Add package | `npm install <pkg>` | `pnpm add <pkg>` |
| Add dev package | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| Remove package | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| Run script | `npm run <script>` | `pnpm run <script>` or `pnpm <script>` |
| Update packages | `npm update` | `pnpm update` |
| List packages | `npm list` | `pnpm list` |

## ⚡ Why PNPM?

1. **Faster**: 2-3x faster than npm
2. **Disk efficient**: Saves 50-70% disk space using hard links
3. **Strict**: Prevents phantom dependencies
4. **Modern**: Used by Vue, Nuxt, and many modern projects

## 📚 Learn More

- [pnpm documentation](https://pnpm.io/)
- [pnpm vs npm](https://pnpm.io/benchmarks)
- [Migration guide](https://pnpm.io/motivation)

## ⚠️ Important Notes

- **Lock file**: Always commit `pnpm-lock.yaml`
- **CI/CD**: Make sure your CI uses pnpm (configured in `.github/workflows`)
- **Team**: Make sure all team members use pnpm to avoid lock file conflicts
