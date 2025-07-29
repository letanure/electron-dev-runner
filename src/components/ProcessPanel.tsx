import { FolderIcon, StopIcon, PlayIcon } from './Icons';
import './ProcessPanel.css';

const path = require('node:path');

interface ProcessInfo {
  process: any; // Child process from spawn()
  window?: any; // Electron BrowserWindow
  projectPath: string;
  scriptName: string;
  port?: number;
  status: 'starting' | 'running' | 'error';
}

interface ProcessPanelProps {
  runningProcesses: Map<string, ProcessInfo>;
  onStopProcess: (processKey: string) => void;
  onOpenWindow: (processKey: string) => void;
}

function ProcessPanel({ runningProcesses, onStopProcess, onOpenWindow }: ProcessPanelProps) {
  const processArray = Array.from(runningProcesses.entries());

  if (processArray.length === 0) {
    return null;
  }

  return (
    <div className="process-panel">
      <div className="process-panel-header">
        <h3 className="process-panel-title">Running Processes</h3>
        <span className="process-count">{processArray.length}</span>
      </div>
      
      <div className="process-list">
        {processArray.map(([processKey, processInfo]) => {
          const projectName = path.basename(processInfo.projectPath);
          const hasWindow = processInfo.window && !processInfo.window.isDestroyed();
          
          return (
            <div key={processKey} className="process-item">
              <div className="process-header">
                <div className="process-info">
                  <FolderIcon size={14} className="process-folder-icon" />
                  <span className="process-project">{projectName}</span>
                  <span className="process-script">{processInfo.scriptName}</span>
                </div>
                <div className="process-status">
                  <span className={`status-indicator ${processInfo.status}`}>
                    {processInfo.status === 'starting' && '⏳'}
                    {processInfo.status === 'running' && '✅'}
                    {processInfo.status === 'error' && '❌'}
                  </span>
                </div>
              </div>
              
              {processInfo.port && (
                <div className="process-url">
                  <span className="url-text">http://localhost:{processInfo.port}</span>
                </div>
              )}
              
              <div className="process-actions">
                {processInfo.port && !hasWindow && (
                  <button
                    className="process-action-btn open-btn"
                    onClick={() => onOpenWindow(processKey)}
                    title="Open in Electron window"
                  >
                    <PlayIcon size={12} />
                    <span>Open</span>
                  </button>
                )}
                
                <button
                  className="process-action-btn stop-btn"
                  onClick={() => onStopProcess(processKey)}
                  title="Stop process"
                >
                  <StopIcon size={12} />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessPanel;