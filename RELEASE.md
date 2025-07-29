# Release Instructions

This project uses GitHub Actions for automated cross-platform builds and releases.

## How to Release

1. **Update version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.0.0 → 1.0.1)
   npm version minor  # for new features (1.0.0 → 1.1.0)  
   npm version major  # for breaking changes (1.0.0 → 2.0.0)
   ```

2. **Push the tag**:
   ```bash
   git push origin main --tags
   ```

3. **GitHub Actions will automatically**:
   - Build for macOS (Intel + Apple Silicon), Windows, and Linux
   - Create a GitHub Release
   - Upload installers as release assets

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