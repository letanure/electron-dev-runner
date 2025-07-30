# Electron Dev Runner

A GitHub-styled Electron app for managing and running development projects with automatic port detection and window management.

![Electron Dev Runner Screenshot](https://via.placeholder.com/800x500/0d1117/58a6ff?text=Electron+Dev+Runner)

## Features

### Project Management
- **Project Explorer**: Navigate through your project files and folders with breadcrumb navigation
- **File Viewer**: View files directly in the app with syntax highlighting
- **Script Runner**: Execute npm/yarn/pnpm scripts directly from the interface
- **Process Management**: Start, stop, and monitor running development processes

### Server Discovery & Management
- **Automatic Port Scanning**: Discovers running dev servers every 10 seconds on common ports (3000, 3001, 8080, 5173, etc.)
- **Server Launch**: Launch discovered servers in dedicated Electron windows
- **Process Information**: Shows process details (PID, command, working directory)
- **Pause/Resume**: Control auto-scanning with a convenient pause button

### User Experience
- **GitHub-styled UI**: Clean, familiar interface following GitHub's design patterns
- **Theme Support**: Light and dark theme toggle with system preference detection
- **Smooth Transitions**: Professional loading screen with fade animations
- **Responsive Layout**: Adaptive three-panel layout (Project Explorer | Files | Running Servers)

## Installation

### From Releases (Recommended)
Download the latest release for your platform:
- **macOS**: `.dmg` installer
- **Windows**: `.exe` installer  
- **Linux**: `.AppImage` portable app

[Download Latest Release](https://github.com/letanure/electron-dev-runner/releases)

### From NPM
```bash
npm install -g @letanure/electron-dev-runner
```

### From Source
```bash
git clone https://github.com/letanure/electron-dev-runner.git
cd electron-dev-runner
pnpm install
pnpm run build
pnpm start
```

## Usage

### As a Desktop App
Simply download and run the app from the releases page. The app will automatically scan for running dev servers and allow you to manage your development projects.

### As a Global CLI Tool
```bash
# Run in current directory
electron-dev-runner
# or
dev-runner

# Run in specific directory
electron-dev-runner /path/to/your/project
```

### Key Features in Action

1. **Project Navigation**: Use the sidebar to browse folders and files
2. **Script Execution**: Click script buttons to run npm/yarn commands
3. **Server Discovery**: Running dev servers appear automatically in the right panel
4. **Window Management**: Click the play button to open servers in new windows
5. **Process Control**: Stop processes and view their status in real-time

## Development

```bash
# Install dependencies
pnpm install

# Start development server (web version)
pnpm dev

# Start Electron app in development
pnpm start

# Build for production
pnpm run build

# Package as Electron app (unpacked)
pnpm run pack

# Build distributable installers
pnpm run dist
```

### Building and Releasing

The project uses GitHub Actions for automated releases. When you push a version tag:

```bash
git tag v1.2.3
git push origin v1.2.3
```

GitHub Actions will automatically:
1. Build the app for macOS, Windows, and Linux
2. Create installers (.dmg, .exe, .AppImage)
3. Upload them as release assets

#### Electron Dependency Trick

**Why**: electron-builder requires `electron` to be in `dependencies`, not `devDependencies`, but we want to keep it in `devDependencies` for proper development workflow.

**Solution**: The GitHub Actions workflow temporarily moves `electron` from `devDependencies` to `dependencies` during the build process:

```javascript
// Move electron to dependencies
const pkg = require('./package.json');
pkg.dependencies.electron = pkg.devDependencies.electron;
delete pkg.devDependencies.electron;

// Build...

// Restore electron to devDependencies  
pkg.devDependencies.electron = pkg.dependencies.electron;
delete pkg.dependencies.electron;
```

This ensures electron-builder works while keeping the package.json clean.

## Project Structure

```
electron-dev-runner/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── contexts/          # React contexts (theme, etc.)
│   └── main.tsx           # App entry point
├── main.js                # Electron main process
├── bin/                   # CLI executable scripts
├── .github/workflows/     # GitHub Actions
├── index-electron.html    # Production HTML template
└── package.json           # Project configuration
```

## Supported Platforms

- macOS (Intel & Apple Silicon)
- Windows (x64)
- Linux (x64)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [letanure](https://github.com/letanure)