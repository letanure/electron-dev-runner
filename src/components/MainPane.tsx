import { useState, useEffect } from 'react';
import './MainPane.css';
import { FolderIcon, FileIcon } from './Icons';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

interface MainPaneProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
  onViewFile?: (filePath: string | null) => void;
}

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

function MainPane({ selectedPath, onSelectPath, onViewFile }: MainPaneProps) {
  const [packageJson, setPackageJson] = useState<PackageJson | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmeFile, setReadmeFile] = useState<string | null>(null);
  const [folderContents, setFolderContents] = useState<FileItem[]>([]);
  const [runningProcesses, setRunningProcesses] = useState<Map<string, any>>(new Map());
  const [openWindows, setOpenWindows] = useState<Map<string, any>>(new Map());
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

    const installProcess = spawn(packageManager, ['install'], {
      cwd: selectedPath,
      stdio: 'pipe'
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

  const openElectronWindow = (url: string, projectName: string, scriptName: string) => {
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

      // Store the window reference
      setOpenWindows(prev => new Map(prev.set(scriptName, devWindow)));

      // Listen for window close event
      devWindow.on('closed', () => {
        console.log(`Dev window closed for ${scriptName}, stopping process...`);
        
        // Remove window from state
        setOpenWindows(prev => {
          const newMap = new Map(prev);
          newMap.delete(scriptName);
          return newMap;
        });

        // Stop the associated process
        stopScript(scriptName);
      });

      devWindow.loadURL(url);
      devWindow.webContents.openDevTools();
    } catch (error) {
      console.error('Error creating Electron window:', error);
    }
  };

  const stopScript = (scriptName: string) => {
    const process = runningProcesses.get(scriptName);
    const window = openWindows.get(scriptName);
    
    if (process) {
      console.log(`Stopping: ${scriptName}`);
      process.kill('SIGTERM');
      
      // If SIGTERM doesn't work, force kill after 5 seconds
      setTimeout(() => {
        if (runningProcesses.has(scriptName)) {
          console.log(`Force killing: ${scriptName}`);
          process.kill('SIGKILL');
        }
      }, 5000);
    }

    // Close the associated window if it exists
    if (window && !window.isDestroyed()) {
      window.close();
    }

    // Clean up window state
    setOpenWindows(prev => {
      const newMap = new Map(prev);
      newMap.delete(scriptName);
      return newMap;
    });
  };

  const runScript = async (scriptName: string) => {
    if (runningProcesses.has(scriptName)) {
      console.log(`${scriptName} is already running`);
      return;
    }

    const projectName = packageJson?.name || path.basename(selectedPath);
    console.log(`Starting: npm run ${scriptName} in ${projectName}`);

    const process = spawn('npm', ['run', scriptName], {
      cwd: selectedPath,
      stdio: 'pipe'
    });

    setRunningProcesses(prev => new Map(prev.set(scriptName, process)));

    let portDetected = false;

    process.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`[${scriptName}]:`, output);

      if (!portDetected) {
        const port = detectPortFromOutput(output);
        if (port) {
          portDetected = true;
          const url = `http://localhost:${port}`;
          console.log(`Dev server detected at ${url}`);
          
          // Wait a bit for server to be fully ready
          setTimeout(() => {
            openElectronWindow(url, projectName, scriptName);
          }, 2000);
        }
      }
    });

    process.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      console.error(`[${scriptName} ERROR]:`, output);
      
      if (!portDetected) {
        const port = detectPortFromOutput(output);
        if (port) {
          portDetected = true;
          const url = `http://localhost:${port}`;
          setTimeout(() => {
            openElectronWindow(url, projectName, scriptName);
          }, 2000);
        }
      }
    });

    process.on('close', (code: number) => {
      console.log(`${scriptName} process exited with code ${code}`);
      setRunningProcesses(prev => {
        const newMap = new Map(prev);
        newMap.delete(scriptName);
        return newMap;
      });
    });

    process.on('error', (error: Error) => {
      console.error(`Failed to start ${scriptName}:`, error);
      setRunningProcesses(prev => {
        const newMap = new Map(prev);
        newMap.delete(scriptName);
        return newMap;
      });
    });
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
              type="application/pdf"
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
          <h3><FolderIcon size={16} className="has-package" /> {packageJson.name || 'Node.js Project'}</h3>
          <div className="package-info">
            {packageJson.version && <span className="version">v{packageJson.version}</span>}
            {packageJson.description && <p className="description">{packageJson.description}</p>}
          </div>

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
                    const isRunning = runningProcesses.has(name);
                    return (
                      <div key={name} className="script-item">
                        <div className="script-controls">
                          <button 
                            className={`script-button ${isRunning ? 'running' : ''} ${needsInstall ? 'needs-install' : ''}`}
                            onClick={() => runScript(name)}
                            disabled={isRunning || needsInstall}
                            type="button"
                            title={needsInstall ? 'Install dependencies first' : ''}
                          >
                            {isRunning ? '🔄' : '▶️'} {name}
                          </button>
                          {isRunning && (
                            <button 
                              className="stop-button"
                              onClick={() => stopScript(name)}
                              type="button"
                              title="Stop process"
                            >
                              ⏹️
                            </button>
                          )}
                        </div>
                        <span className="script-command">{command}</span>
                        {isRunning && <span className="running-indicator">Running...</span>}
                      </div>
                    );
                  })}
              </div>
              {Object.entries(packageJson.scripts).filter(([name, command]) => isDevScript(name, command)).length === 0 && (
                <p className="no-dev-scripts">No development scripts found</p>
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