import { useState, useEffect, useRef } from 'react';
import './MainPane.css';
import { FolderIcon, FileIcon, PlayIcon, TerminalIcon, StopIcon } from './Icons';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');


interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  scripts?: Record<string, string>;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface ProcessInfo {
  process: any; // Child process from spawn()
  window?: any; // Electron BrowserWindow
  projectPath: string;
  scriptName: string;
  port?: number;
  status: 'starting' | 'running' | 'error';
}

interface MainPaneProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
  onViewFile?: (filePath: string | null) => void;
  globalProcesses: Map<string, ProcessInfo>;
  onProcessUpdate: (processes: Map<string, ProcessInfo>) => void;
}

function MainPane({ selectedPath, onSelectPath, onViewFile, globalProcesses, onProcessUpdate }: MainPaneProps) {
  // Use a ref to always have the latest processes reference
  const processesRef = useRef(globalProcesses);
  processesRef.current = globalProcesses;
  const [packageJson, setPackageJson] = useState<PackageJson | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmeFile, setReadmeFile] = useState<string | null>(null);
  const [folderContents, setFolderContents] = useState<FileItem[]>([]);
  const [needsInstall, setNeedsInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    loadPackageJson();
    loadReadme();
    loadFolderContents();
    checkDependencies();
    setViewingFile(null);
    setFileContent(null);
    onViewFile?.(null);
  }, [selectedPath]);

  // Helper function to create unique process keys
  const createProcessKey = (scriptName: string, projectPath: string = selectedPath): string => {
    return `${projectPath}:${scriptName}`;
  };

  // Check if a script is running in the current folder
  const isScriptRunning = (scriptName: string): boolean => {
    const processKey = createProcessKey(scriptName);
    return globalProcesses.has(processKey);
  };

  const loadPackageJson = () => {
    try {
      const packagePath = path.join(selectedPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const content = fs.readFileSync(packagePath, 'utf8');
        setPackageJson(JSON.parse(content));
      } else {
        setPackageJson(null);
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
      setPackageJson(null);
    }
  };

  const loadReadme = () => {
    try {
      const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'readme.txt', 'README'];
      let foundReadme = null;
      let foundFile = null;

      for (const filename of readmeFiles) {
        const readmePath = path.join(selectedPath, filename);
        if (fs.existsSync(readmePath)) {
          foundReadme = fs.readFileSync(readmePath, 'utf8');
          foundFile = filename;
          break;
        }
      }

      setReadmeContent(foundReadme);
      setReadmeFile(foundFile);
    } catch (error) {
      console.error('Error reading README:', error);
      setReadmeContent(null);
      setReadmeFile(null);
    }
  };

  const loadFolderContents = () => {
    try {
      const files = fs.readdirSync(selectedPath, { withFileTypes: true });
      const fileItems = files.map((dirent: { name: string; isDirectory: () => boolean }) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: path.join(selectedPath, dirent.name)
      }));
      
      fileItems.sort((a: FileItem, b: FileItem) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setFolderContents(fileItems);
    } catch (error) {
      console.error('Error reading directory:', error);
      setFolderContents([]);
    }
  };

  const checkDependencies = () => {
    try {
      const packagePath = path.join(selectedPath, 'package.json');
      const nodeModulesPath = path.join(selectedPath, 'node_modules');
      const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
      
      const hasPackageJson = fs.existsSync(packagePath);
      const hasNodeModules = fs.existsSync(nodeModulesPath);
      const hasLockFile = lockFiles.some(file => fs.existsSync(path.join(selectedPath, file)));
      
      // Need to install if: has package.json AND (no node_modules OR has lockfile but no node_modules)
      const shouldInstall = hasPackageJson && (!hasNodeModules || (hasLockFile && !hasNodeModules));
      
      setNeedsInstall(shouldInstall);
    } catch (error) {
      console.error('Error checking dependencies:', error);
      setNeedsInstall(false);
    }
  };

  const detectPackageManager = () => {
    if (fs.existsSync(path.join(selectedPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(selectedPath, 'yarn.lock'))) return 'yarn';
    return 'npm';
  };

  const installDependencies = async () => {
    setIsInstalling(true);
    const packageManager = detectPackageManager();
    const projectName = packageJson?.name || path.basename(selectedPath);
    
    console.log(`Installing dependencies with ${packageManager} in ${projectName}...`);

    const pmCmd = process.platform === 'win32' && packageManager === 'npm' ? 'npm.cmd' : packageManager;
    
    const installProcess = spawn(pmCmd, ['install'], {
      cwd: selectedPath,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        PATH: (process.env.PATH || '') + (process.platform === 'win32' ? ';' : ':') + 
              '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'
      }
    });

    installProcess.stdout.on('data', (data: Buffer) => {
      console.log(`[${packageManager} install]:`, data.toString());
    });

    installProcess.stderr.on('data', (data: Buffer) => {
      console.error(`[${packageManager} install ERROR]:`, data.toString());
    });

    installProcess.on('close', (code: number) => {
      setIsInstalling(false);
      if (code === 0) {
        console.log(`Dependencies installed successfully with ${packageManager}`);
        setNeedsInstall(false);
      } else {
        console.error(`Dependency installation failed with code ${code}`);
      }
    });

    installProcess.on('error', (error: Error) => {
      console.error(`Failed to run ${packageManager} install:`, error);
      setIsInstalling(false);
    });
  };

  const isDevScript = (scriptName: string, command: string): boolean => {
    const devKeywords = ['dev', 'start', 'serve', 'preview', 'develop'];
    return devKeywords.some(keyword => 
      scriptName.toLowerCase().includes(keyword) || 
      command.toLowerCase().includes(keyword)
    );
  };

  const detectPortFromOutput = (output: string): number | null => {
    // Common patterns for dev server URLs
    const patterns = [
      /localhost:(\d+)/,
      /127\.0\.0\.1:(\d+)/,
      /Local:\s+http:\/\/[^:]+:(\d+)/,
      /running at.*:(\d+)/i,
      /server running on.*:(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return Number.parseInt(match[1], 10);
      }
    }
    return null;
  };

  const openElectronWindow = (url: string, projectName: string, processKey: string) => {
    try {
      const { BrowserWindow } = require('@electron/remote') || require('electron').remote;
      if (!BrowserWindow) {
        console.error('Could not access BrowserWindow');
        return;
      }

      const devWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: `${projectName} - Dev Runner`,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      // Store the window reference using the ref to get latest processes
      const processesMap = new Map(processesRef.current);
      const processInfo = processesMap.get(processKey);
      
      if (processInfo) {
        processInfo.window = devWindow;
        processesMap.set(processKey, processInfo);
        onProcessUpdate(processesMap);
      }

      // Listen for window close event
      devWindow.on('closed', () => {
        // Remove window reference from process info
        const updatedProcesses = new Map(globalProcesses);
        const currentInfo = updatedProcesses.get(processKey);
        if (currentInfo) {
          delete currentInfo.window;
          updatedProcesses.set(processKey, currentInfo);
          onProcessUpdate(updatedProcesses);
        }

        // Stop the associated process
        stopScript(processKey);
      });

      devWindow.loadURL(url);
      // Only open dev tools in development mode
      if (process.env.NODE_ENV === 'development') {
        devWindow.webContents.openDevTools();
      }
    } catch (error) {
      console.error('Error creating Electron window:', error);
    }
  };

  const stopScript = (processKeyOrScriptName: string) => {
    // Handle both old format (scriptName) and new format (processKey)
    const processKey = processKeyOrScriptName.includes(':') 
      ? processKeyOrScriptName 
      : createProcessKey(processKeyOrScriptName);
    
    const processInfo = globalProcesses.get(processKey);
    
    if (!processInfo?.process) {
      // If no process found, just remove from UI
      const currentProcesses = new Map(globalProcesses);
      currentProcesses.delete(processKey);
      onProcessUpdate(currentProcesses);
      return;
    }

    // Close the associated window first
    if (processInfo.window) {
      try {
        if (!processInfo.window.isDestroyed()) {
          processInfo.window.close();
        }
      } catch (error) {
        console.error(`Error closing window for ${processKey}:`, error);
      }
    }

    // Send SIGTERM
    try {
      processInfo.process.kill('SIGTERM');
    } catch (error) {
      console.error(`Error sending SIGTERM to ${processKey}:`, error);
      // If we can't send SIGTERM, remove from UI immediately
      const currentProcesses = new Map(globalProcesses);
      currentProcesses.delete(processKey);
      onProcessUpdate(currentProcesses);
      return;
    }
    
    // Set up force kill after 5 seconds if process doesn't exit
    const forceKillTimeout = setTimeout(() => {
      const currentProcesses = new Map(globalProcesses);
      if (currentProcesses.has(processKey)) {
        console.log(`Force killing: ${processKey}`);
        try {
          processInfo.process.kill('SIGKILL');
        } catch (error) {
          console.error(`Error force killing ${processKey}:`, error);
          // If SIGKILL also fails, force remove from UI
          const finalProcesses = new Map(globalProcesses);
          finalProcesses.delete(processKey);
          onProcessUpdate(finalProcesses);
        }
      }
    }, 5000);

    // Clean up timeout if process exits gracefully 
    // The 'close' event will handle UI cleanup
    processInfo.process.once('close', () => {
      clearTimeout(forceKillTimeout);
    });
  };

  const openInTerminal = (scriptName: string) => {
    const projectName = packageJson?.name || path.basename(selectedPath);
    const command = `npm run ${scriptName}`;
    
    // Detect the operating system and open appropriate terminal
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        // macOS - use osascript to open Terminal with command
        const escapedPath = selectedPath.replace(/'/g, "'\"'\"'");
        const terminalScript = `tell application "Terminal"
          activate
          do script "cd '${escapedPath}' && ${command}"
        end tell`;
        
        const child = spawn('osascript', ['-e', terminalScript], { 
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        child.stdout?.on('data', (data: any) => {
          console.log('osascript stdout:', data.toString());
        });
        
        child.stderr?.on('data', (data: any) => {
          console.error('osascript stderr:', data.toString());
        });
        
        child.on('close', (code: any) => {
          console.log(`osascript exited with code ${code}`);
        });
        
        child.unref();
        console.log('Executed osascript command for Terminal');
      } else if (platform === 'win32') {
        // Windows - open Command Prompt
        spawn('cmd', ['/c', 'start', 'cmd', '/k', `cd /d "${selectedPath}" && ${command}`], { 
          detached: true,
          shell: true,
          stdio: 'ignore'
        }).unref();
      } else {
        // Linux - try common terminal emulators
        const terminals = [
          { cmd: 'gnome-terminal', args: ['--working-directory', selectedPath, '--', 'bash', '-c', `${command}; exec bash`] },
          { cmd: 'konsole', args: ['--workdir', selectedPath, '-e', 'bash', '-c', `${command}; exec bash`] },
          { cmd: 'xfce4-terminal', args: ['--working-directory', selectedPath, '-e', `bash -c "${command}; exec bash"`] },
          { cmd: 'xterm', args: ['-e', `bash -c "cd '${selectedPath}' && ${command}; exec bash"`] },
          { cmd: 'x-terminal-emulator', args: ['-e', `bash -c "cd '${selectedPath}' && ${command}; exec bash"`] }
        ];
        
        let opened = false;
        
        for (const terminal of terminals) {
          try {
            spawn(terminal.cmd, terminal.args, { 
              detached: true,
              stdio: 'ignore'
            }).unref();
            opened = true;
            console.log(`Opened ${terminal.cmd} successfully`);
            break;
          } catch (e) {
            console.log(`Failed to open ${terminal.cmd}:`, (e as Error).message);
            continue;
          }
        }
        
        if (!opened) {
          console.error('No terminal emulator found');
        }
      }
      
      console.log(`Opening terminal for: ${command} in ${projectName}`);
    } catch (error) {
      console.error('Error opening terminal:', error);
    }
  };

  const runScript = async (scriptName: string) => {
    const processKey = createProcessKey(scriptName);
    
    if (globalProcesses.has(processKey)) {
      console.log(`${scriptName} is already running in ${selectedPath}`);
      return;
    }

    const projectName = packageJson?.name || path.basename(selectedPath);
    console.log(`Starting: npm run ${scriptName} in ${projectName}`);

    // Use which command to find npm path, or fallback to common locations
    const npmPath = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    const childProcess = spawn(npmPath, ['run', scriptName], {
      cwd: selectedPath,
      stdio: 'pipe',
      shell: true, // This ensures PATH is used
      env: {
        ...process.env,
        PATH: (process.env.PATH || '') + (process.platform === 'win32' ? ';' : ':') + 
              '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'
      }
    });

    // Create process info object
    const processInfo: ProcessInfo = {
      process: childProcess,
      projectPath: selectedPath,
      scriptName,
      status: 'starting'
    };

    // Add to global processes
    const newProcesses = new Map(globalProcesses);
    newProcesses.set(processKey, processInfo);
    onProcessUpdate(newProcesses);

    // Check if process started successfully
    childProcess.on('spawn', () => {
      console.log(`${scriptName}: Process spawned successfully`);
      // Update status to running
      const updatedProcesses = new Map(newProcesses);
      const currentInfo = updatedProcesses.get(processKey);
      if (currentInfo) {
        currentInfo.status = 'running';
        updatedProcesses.set(processKey, currentInfo);
        onProcessUpdate(updatedProcesses);
      }
    });

    let portDetected = false;

    childProcess.stdout.on('data', (data: any) => {
      const output = data.toString();
      console.log(`[${scriptName}]:`, output);

      if (!portDetected) {
        const port = detectPortFromOutput(output);
        if (port) {
          portDetected = true;
          const url = `http://localhost:${port}`;
          console.log(`Dev server detected at ${url}`);
          
          // Update process info with port
          const currentProcesses = new Map(globalProcesses);
          const currentInfo = currentProcesses.get(processKey);
          if (currentInfo) {
            currentInfo.port = port;
            currentProcesses.set(processKey, currentInfo);
            onProcessUpdate(currentProcesses);
          }
          
          // Wait a bit for server to be fully ready
          setTimeout(() => {
            openElectronWindow(url, projectName, processKey);
          }, 2000);
        }
      }
    });

    childProcess.stderr.on('data', (data: any) => {
      const output = data.toString();
      console.error(`[${scriptName} ERROR]:`, output);
      
      // Check if it's a fatal error that would cause immediate exit
      if (output.includes('ENOENT') || output.includes('command not found') || output.includes('not found')) {
        console.error(`${scriptName}: Fatal error detected, process will likely exit`);
      }
      
      if (!portDetected) {
        const port = detectPortFromOutput(output);
        if (port) {
          portDetected = true;
          const url = `http://localhost:${port}`;
          
          // Update process info with port
          const currentProcesses = new Map(globalProcesses);
          const currentInfo = currentProcesses.get(processKey);
          if (currentInfo) {
            currentInfo.port = port;
            currentProcesses.set(processKey, currentInfo);
            onProcessUpdate(currentProcesses);
          }
          
          setTimeout(() => {
            openElectronWindow(url, projectName, processKey);
          }, 2000);
        }
      }
    });

    childProcess.on('close', (code: any) => {
      console.log(`${scriptName} process exited with code ${code}`);
      if (code !== 0) {
        console.error(`${scriptName} failed with exit code ${code}`);
      }
      
      // Remove from global processes
      const currentProcesses = new Map(globalProcesses);
      currentProcesses.delete(processKey);
      onProcessUpdate(currentProcesses);
    });

    childProcess.on('error', (error: any) => {
      console.error(`Failed to start ${scriptName}:`, error);
      
      // Update process status to error
      const currentProcesses = new Map(globalProcesses);
      const currentInfo = currentProcesses.get(processKey);
      if (currentInfo) {
        currentInfo.status = 'error';
        currentProcesses.set(processKey, currentInfo);
        onProcessUpdate(currentProcesses);
      }
    });

    // Add timeout to prevent stuck processes
    setTimeout(() => {
      if (globalProcesses.has(processKey) && !portDetected) {
        console.log(`${scriptName}: No port detected after 30 seconds, but keeping process running`);
      }
    }, 30000);
  };

  const formatReadmeContent = (content: string) => {
    // Simple markdown-like formatting for display
    return content
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const isViewableFile = (fileName: string): boolean => {
    const textExtensions = ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.scss', '.html', '.xml', '.yaml', '.yml', '.toml', '.ini', '.env', '.gitignore', '.py', '.rs', '.go', '.java', '.c', '.cpp', '.h', '.hpp'];
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
    const pdfExtensions = ['.pdf'];
    const extension = path.extname(fileName).toLowerCase();
    return textExtensions.includes(extension) || imageExtensions.includes(extension) || pdfExtensions.includes(extension) || fileName.startsWith('.');
  };

  const getFileType = (fileName: string): 'text' | 'image' | 'pdf' => {
    const extension = path.extname(fileName).toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
    const pdfExtensions = ['.pdf'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (pdfExtensions.includes(extension)) return 'pdf';
    return 'text';
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon'
    };
    return mimeTypes[extension] || 'image/png';
  };

  const loadFileContent = async (filePath: string) => {
    try {
      const fileType = getFileType(path.basename(filePath));
      
      if (fileType === 'text') {
        const content = fs.readFileSync(filePath, 'utf8');
        setFileContent(content);
      } else if (fileType === 'image') {
        // For images, convert to base64 data URL
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        const extension = path.extname(filePath).toLowerCase();
        const mimeType = getMimeType(extension);
        const dataUrl = `data:${mimeType};base64,${base64}`;
        setFileContent(dataUrl);
      } else {
        // For PDFs, convert to base64 data URL as well
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        setFileContent(dataUrl);
      }
      
      setViewingFile(filePath);
      onViewFile?.(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      setFileContent('Error reading file');
      setViewingFile(filePath);
      onViewFile?.(filePath);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      onSelectPath(item.path);
    } else if (isViewableFile(item.name)) {
      loadFileContent(item.path);
    }
  };

  const getFileLanguage = (fileName: string): string => {
    const extension = path.extname(fileName).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.json': 'json',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.py': 'python',
      '.rs': 'rust',
      '.go': 'go',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp'
    };
    return languageMap[extension] || 'text';
  };

  const renderFileContent = () => {
    if (!viewingFile || !fileContent) return null;
    
    const fileType = getFileType(path.basename(viewingFile));
    
    switch (fileType) {
      case 'image':
        return (
          <div className="image-viewer">
            <img 
              src={fileContent} 
              alt={path.basename(viewingFile)}
              className="file-image"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="pdf-viewer">
            <iframe 
              src={fileContent}
              className="file-pdf"
              title={path.basename(viewingFile)}
            />
          </div>
        );
      
      case 'text':
      default:
        return (
          <pre className={`file-content language-${getFileLanguage(viewingFile)}`}>
            <code>{fileContent}</code>
          </pre>
        );
    }
  };


  return (
    <div className="main-pane">
      {packageJson && (
        <div className="package-section">
          <div className="package-header">
            <h3><FolderIcon size={16} className="has-package" /> {packageJson.name || 'Node.js Project'}</h3>
            {packageJson.version && <span className="version">v{packageJson.version}</span>}
          </div>
          {packageJson.description && (
            <div className="package-info">
              <p className="description">{packageJson.description}</p>
            </div>
          )}

          {needsInstall && (
            <div className="install-warning">
              <div className="warning-message">
                <span className="warning-icon">⚠️</span>
                <span>Dependencies not installed. Install them to run dev scripts.</span>
              </div>
              <button 
                className={`install-button ${isInstalling ? 'installing' : ''}`}
                onClick={installDependencies}
                disabled={isInstalling}
                type="button"
              >
                {isInstalling ? '🔄 Installing...' : `📦 Install with ${detectPackageManager()}`}
              </button>
            </div>
          )}
          
          {packageJson.scripts && (
            <div className="scripts">
              <h4>Development Scripts:</h4>
              <div className="script-buttons">
                {Object.entries(packageJson.scripts)
                  .filter(([name, command]) => isDevScript(name, command))
                  .map(([name, command]) => {
                    const isRunning = isScriptRunning(name);
                    return (
                      <div key={name} className="script-item">
                        <div className="script-single-line">
                          <span className="script-name">{name}</span>
                          <div className="script-controls">
                            <button 
                              className="terminal-button gh-btn gh-btn-secondary"
                              onClick={() => openInTerminal(name)}
                              disabled={needsInstall}
                              type="button"
                              title={needsInstall ? 'Install dependencies first' : `Run "npm run ${name}" in system terminal`}
                            >
                              <TerminalIcon size={12} />
                            </button>
                            {!isRunning ? (
                              <button 
                                className={`script-button electron-button ${needsInstall ? 'needs-install' : ''}`}
                                onClick={() => runScript(name)}
                                disabled={needsInstall}
                                type="button"
                                title={needsInstall ? 'Install dependencies first' : `Run "${name}" in new Electron window with auto port detection`}
                              >
                                <PlayIcon size={12} />
                              </button>
                            ) : (
                              <button 
                                className="stop-button"
                                onClick={() => stopScript(name)}
                                type="button"
                                title="Stop running process and close window"
                              >
                                <StopIcon size={12} />
                              </button>
                            )}
                          </div>
                          <span className="script-command">{command}</span>
                          {isRunning && <span className="running-indicator">Running...</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
              {Object.entries(packageJson.scripts).filter(([name, command]) => isDevScript(name, command)).length === 0 && (
                <p className="no-dev-scripts">No development scripts found</p>
              )}
            </div>
          )}

          {packageJson.scripts && (
            <div className="scripts">
              <h4>Other Scripts:</h4>
              <div className="script-buttons">
                {Object.entries(packageJson.scripts)
                  .filter(([name, command]) => !isDevScript(name, command))
                  .map(([name, command]) => (
                    <div key={name} className="script-item">
                      <div className="script-single-line">
                        <span className="script-name">{name}</span>
                        <div className="script-controls">
                          <button 
                            className="terminal-button gh-btn gh-btn-secondary"
                            onClick={() => openInTerminal(name)}
                            disabled={needsInstall}
                            type="button"
                            title={needsInstall ? 'Install dependencies first' : `Run "npm run ${name}" in system terminal`}
                          >
                            <TerminalIcon size={12} />
                          </button>
                        </div>
                        <span className="script-command">{command}</span>
                      </div>
                    </div>
                  ))}
              </div>
              {Object.entries(packageJson.scripts).filter(([name, command]) => !isDevScript(name, command)).length === 0 && (
                <p className="no-dev-scripts">No other scripts found</p>
              )}
            </div>
          )}
        </div>
      )}

      {readmeContent && (packageJson || !packageJson) && (
        <div className="readme-section">
          <div className="readme-header">
            <h4><FileIcon size={16} /> {readmeFile}</h4>
          </div>
          <div 
            className="readme-content"
            dangerouslySetInnerHTML={{ __html: formatReadmeContent(readmeContent) }}
          />
        </div>
      )}

      {!packageJson && !readmeContent && !viewingFile && folderContents.length > 0 && (
        <div className="folder-contents">
          <table className="gh-file-table">
            <thead>
              <tr className="gh-file-table-header">
                <th colSpan={2} className="gh-file-name-header">
                  <span className="gh-text-bold">Name</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {folderContents.map((item) => (
                <tr key={item.path} className="gh-file-row">
                  <td colSpan={2} className="gh-file-name-cell">
                    <div 
                      className="gh-file-name-content"
                      onClick={() => handleItemClick(item)}
                    >
                      <span className="gh-file-icon">
                        {item.isDirectory ? <FolderIcon size={16} /> : <FileIcon size={16} />}
                      </span>
                      <div className="gh-file-name-wrapper">
                        <div className="gh-file-name-truncate">
                          <span className="gh-file-name">{item.name}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!packageJson && !readmeContent && viewingFile && fileContent && (
        <div className="file-viewer">
          <div className="file-viewer-header">
            <div className="file-viewer-title">
              <FileIcon size={16} />
              <span>{path.basename(viewingFile)}</span>
            </div>
          </div>
          <div className="file-viewer-content">
            {renderFileContent()}
          </div>
        </div>
      )}

      {!packageJson && !readmeContent && !viewingFile && folderContents.length === 0 && (
        <div className="empty-state">
          <p><FolderIcon size={16} /> Empty folder</p>
        </div>
      )}
    </div>
  );
}

export default MainPane;