# Release Instructions

This project uses **Semantic Release** for automated versioning, changelog generation, and cross-platform builds.

## How to Release

### Automatic Releases (Recommended)

1. **Write conventional commits** and push to `main`:
   ```bash
   git commit -m "feat: add new file viewer feature"
   git commit -m "fix: resolve port detection issue"
   git commit -m "docs: update installation instructions"
   ```

2. **Push to main**:
   ```bash
   git push origin main
   ```

3. **Semantic Release automatically**:
   - Analyzes commit messages
   - Determines version bump (patch/minor/major)
   - Generates CHANGELOG.md
   - Creates git tag and GitHub Release
   - Builds for macOS, Windows, Linux
   - Uploads installers as release assets

### Commit Message Format

Use [Conventional Commits](https://conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types that trigger releases:**
- `feat`: ✨ New feature → **minor** version (1.0.0 → 1.1.0)
- `fix`: 🐛 Bug fix → **patch** version (1.0.0 → 1.0.1)  
- `perf`: ⚡ Performance improvement → **patch** version
- `docs`: 📚 Documentation → **patch** version

**Types that don't trigger releases:**
- `chore`: 🔧 Maintenance tasks
- `ci`: ⚙️ CI/CD changes
- `test`: 🧪 Tests

**Breaking changes:**
```bash
git commit -m "feat!: redesign main interface

BREAKING CHANGE: removed legacy folder tree API"
# Results in major version bump (1.0.0 → 2.0.0)
```

## Release Assets Created

- **macOS**: `Electron-Dev-Runner-1.0.0-arm64.dmg`, `Electron-Dev-Runner-1.0.0-x64.dmg`
- **Windows**: `Electron-Dev-Runner-Setup-1.0.0.exe`
- **Linux**: `Electron-Dev-Runner-1.0.0.AppImage`

## Optional: Code Signing

To enable code signing (recommended for production):

### macOS
1. Get Apple Developer account
2. Add these secrets to GitHub repository:
   - `CSC_LINK`: Base64 encoded .p12 certificate
   - `CSC_KEY_PASSWORD`: Certificate password
   - `APPLE_ID`: Apple ID email
   - `APPLE_ID_PASSWORD`: App-specific password
   - `APPLE_TEAM_ID`: Team ID from Apple Developer

### Windows
1. Get code signing certificate
2. Add these secrets:
   - `WIN_CSC_LINK`: Base64 encoded .p12 certificate
   - `WIN_CSC_KEY_PASSWORD`: Certificate password

3. Uncomment the signing environment variables in `.github/workflows/release.yml`

## Manual Testing

Before releasing, test locally:
```bash
npm run pack    # Test packaging
npm run dist    # Test distribution build
```

## Debugging Releases

- Check GitHub Actions tab for build logs
- Failed builds will show detailed error messages
- Test builds run on every PR to main branch