import { useState, useEffect } from 'react';
import './ServerPanel.css';
import { PlayIcon } from './Icons';

const net = require('node:net');
const { spawn } = require('node:child_process');

interface DiscoveredServer {
  port: number;
  url: string;
  title?: string;
  window?: any; // Electron BrowserWindow
  processInfo?: {
    pid: number;
    command: string;
    cwd?: string;
  };
}

interface ServerPanelProps {
  selectedPath: string;
}

function ServerPanel({ selectedPath }: ServerPanelProps) {
  const [discoveredServers, setDiscoveredServers] = useState<DiscoveredServer[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Common dev server ports to scan
  const DEV_PORTS = [3000, 3001, 8080, 8081, 5173, 4200, 9000, 3333, 8000, 8888, 5000, 5001];

  useEffect(() => {
    scanForDevServers();
  }, [selectedPath]);

  // Check if a port is in use
  const checkPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 1000; // 1 second timeout

      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true); // Port is open
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false); // Port is closed
      });

      socket.on('error', () => {
        resolve(false); // Port is closed
      });

      socket.connect(port, 'localhost');
    });
  };

  // Try to get page title from a localhost URL
  const getPageTitle = async (url: string): Promise<string | undefined> => {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : undefined;
    } catch {
      return undefined;
    }
  };

  // Find process info for a given port
  const getProcessForPort = (port: number): Promise<{ pid: number; command: string; cwd?: string } | undefined> => {
    return new Promise((resolve) => {
      // Use lsof to find process listening on port
      const lsofProcess = spawn('lsof', ['-ti', `:${port}`], {
        stdio: 'pipe'
      });

      let pidOutput = '';
      lsofProcess.stdout.on('data', (data: any) => {
        pidOutput += data.toString();
      });

      lsofProcess.on('close', (code: any) => {
        if (code !== 0 || !pidOutput.trim()) {
          resolve(undefined);
          return;
        }

        const pid = parseInt(pidOutput.trim().split('\n')[0]);
        if (isNaN(pid)) {
          resolve(undefined);
          return;
        }

        // Get process details using ps
        const psProcess = spawn('ps', ['-p', pid.toString(), '-o', 'command='], {
          stdio: 'pipe'
        });

        let commandOutput = '';
        psProcess.stdout.on('data', (data: any) => {
          commandOutput += data.toString();
        });

        psProcess.on('close', (psCode: any) => {
          if (psCode !== 0 || !commandOutput.trim()) {
            resolve({ pid, command: 'Unknown' });
            return;
          }

          const command = commandOutput.trim();

          // Try to get working directory using lsof
          const cwdProcess = spawn('lsof', ['-p', pid.toString(), '-d', 'cwd', '-Fn'], {
            stdio: 'pipe'
          });

          let cwdOutput = '';
          cwdProcess.stdout.on('data', (data: any) => {
            cwdOutput += data.toString();
          });

          cwdProcess.on('close', () => {
            let cwd: string | undefined;
            const cwdMatch = cwdOutput.match(/n(.+)/);
            if (cwdMatch) {
              cwd = cwdMatch[1];
            }

            resolve({ pid, command, cwd });
          });
        });
      });

      lsofProcess.on('error', () => {
        resolve(undefined);
      });
    });
  };

  // Scan for running dev servers
  const scanForDevServers = async () => {
    setIsScanning(true);
    const servers: DiscoveredServer[] = [];

    // Check each common dev port
    for (const port of DEV_PORTS) {
      const isOpen = await checkPort(port);
      if (isOpen) {
        const url = `http://localhost:${port}`;
        const [title, processInfo] = await Promise.all([
          getPageTitle(url),
          getProcessForPort(port)
        ]);
        
        servers.push({
          port,
          url,
          title,
          processInfo
        });
      }
    }

    setDiscoveredServers(servers);
    setIsScanning(false);
  };

  // Launch a discovered server in an Electron window
  const launchDiscoveredServer = (server: DiscoveredServer) => {
    try {
      const { BrowserWindow } = require('@electron/remote') || require('electron').remote;
      if (!BrowserWindow) {
        console.error('Could not access BrowserWindow');
        return;
      }

      // Check if this server already has a window open
      if (server.window && !server.window.isDestroyed()) {
        server.window.focus();
        return;
      }

      const title = server.title || `Dev Server - Port ${server.port}`;
      const devWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      // Store window reference
      const updatedServers = discoveredServers.map(s => 
        s.port === server.port ? { ...s, window: devWindow } : s
      );
      setDiscoveredServers(updatedServers);

      // Listen for window close event
      devWindow.on('closed', () => {
        const cleanedServers = discoveredServers.map(s => 
          s.port === server.port ? { ...s, window: undefined } : s
        );
        setDiscoveredServers(cleanedServers);
      });

      devWindow.loadURL(server.url);
      // Only open dev tools in development mode
      if (process.env.NODE_ENV === 'development') {
        devWindow.webContents.openDevTools();
      }
    } catch (error) {
      console.error('Error creating Electron window for discovered server:', error);
    }
  };

  return (
    <div className="server-panel">
      <div className="server-panel-header">
        <div>
          <h3>Discovered Servers</h3>
          <p className="server-panel-desc">Launch on an app</p>
        </div>
        <button
          className="refresh-button gh-btn gh-btn-secondary"
          onClick={scanForDevServers}
          disabled={isScanning}
          type="button"
          title="Scan for running dev servers"
        >
          {isScanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>
      
      <div className="server-panel-content">
        {discoveredServers.length > 0 ? (
          <div className="server-list">
            {discoveredServers.map((server) => {
              const hasWindow = server.window && !server.window.isDestroyed();
              const displayTitle = server.title || `Port ${server.port}`;
              

              
              return (
                <div key={server.port} className="server-item">
                  <div className="server-header">
                    <div className="server-title">{displayTitle}</div>
                    <div className="server-port">:{server.port}</div>
                  </div>
                  
                  {/* {cleanPath && (
                    <div className="server-path">{cleanPath}</div>
                  )} */}
                  
                  
                  <button
                    className={`launch-btn ${hasWindow ? 'focused' : 'launch'}`}
                    onClick={() => launchDiscoveredServer(server)}
                    type="button"
                    title={hasWindow ? 'Focus window' : 'Launch in Electron'}
                  >
                    <PlayIcon size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-servers">
            <p>{isScanning ? 'Scanning...' : 'No servers found'}</p>
            <div className="ports-scanned">
              Ports: {DEV_PORTS.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServerPanel;