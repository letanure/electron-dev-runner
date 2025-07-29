# Electron Dev Runner

An Electron desktop app that helps developers manage and run their Node.js projects. Navigate through your development folders, run dev scripts in separate Electron windows with automatic port detection, and manage all your development processes from one clean interface.

![Dev Runner Screenshot](https://via.placeholder.com/800x500/0d1117/58a6ff?text=Dev+Runner+Screenshot)

## Features

- 🗂️ **Project Explorer**: Navigate through your development projects with a familiar folder tree interface
- 🚀 **Smart Script Detection**: Automatically identifies and highlights development scripts (dev, start, serve, etc.)
- 🔌 **Auto Port Detection**: Detects development server ports and opens them in new Electron windows
- 🖥️ **Terminal Integration**: Run non-dev scripts directly in your system terminal
- 📦 **Dependency Management**: Automatically detects missing dependencies and provides installation options
- 🎨 **GitHub Theme**: Beautiful light/dark theme system matching GitHub's design
- 📁 **File Viewer**: View text files, images, and PDFs directly in the app
- 🛠️ **Process Management**: Track and manage running development servers

## Installation

### Download Pre-built App

Download the latest release for your platform:

- **macOS**: [Electron Dev Runner-1.0.0-arm64.dmg](./release/Dev%20Runner-1.0.0-arm64.dmg) (Apple Silicon)
- **Windows**: Coming soon
- **Linux**: Coming soon

### Install via npm (Global CLI)

```bash
npm install -g electron-dev-runner

# Then run anywhere:
electron-dev-runner
```

**Note**: The npm package includes the full Electron runtime (~100MB download). For smaller downloads, use the platform-specific installers above.

## Usage

1. **Launch the app** and navigate to your development projects
2. **Select a folder** containing a `package.json` file
3. **Run development scripts** by clicking the play button (opens in new Electron window)
4. **Run other scripts** by clicking the terminal button (opens in system terminal)
5. **Install dependencies** when prompted if `node_modules` is missing

### Supported Script Types

**Development Scripts** (auto-detected):
- `dev`, `start`, `serve`, `preview`, `develop`
- These open in new Electron windows with automatic port detection

**Other Scripts**:
- `test`, `lint`, `build`, `deploy`, etc.
- These run in your system terminal

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/letanure/electron-dev-runner.git
cd electron-dev-runner

# Install dependencies
pnpm install

# Start development server
pnpm dev

# In another terminal, start Electron
pnpm start
```

### Build

```bash
# Build for production
pnpm build

# Package for local testing
pnpm pack

# Create distributable
pnpm dist
```

## Technology Stack

- **Electron** - Cross-platform desktop app framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **CSS Variables** - Theme system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**letanure**

- GitHub: [@letanure](https://github.com/letanure)

## Changelog

### v1.0.0

- Initial release
- Project explorer with folder tree navigation
- Smart development script detection
- Automatic port detection and Electron window management
- Terminal integration for non-dev scripts
- Dependency management with auto-installation
- GitHub-styled theme system (light/dark)
- File viewer for text, images, and PDFs
- Process management and monitoring