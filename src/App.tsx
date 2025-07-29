import { useState } from 'react'
import './App.css'
import FolderTree from './components/FolderTree'
import MainPane from './components/MainPane'
// import ProcessPanel from './components/ProcessPanel'
import Breadcrumb from './components/Breadcrumb'
import ThemeToggle from './components/ThemeToggle'
import { ThemeProvider } from './contexts/ThemeContext'

interface ProcessInfo {
  process: any; // Child process from spawn()
  window?: any; // Electron BrowserWindow
  projectPath: string;
  scriptName: string;
  port?: number;
  status: 'starting' | 'running' | 'error';
}

function App() {
  const [selectedPath, setSelectedPath] = useState(process.cwd());
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [globalProcesses, setGlobalProcesses] = useState<Map<string, ProcessInfo>>(new Map());
  // const [showProcessPanel, setShowProcessPanel] = useState(false);

  // Handle process updates and panel visibility
  const handleProcessUpdate = (processes: Map<string, ProcessInfo>) => {
    setGlobalProcesses(processes);
    
    // Temporarily disabled auto-show for release
    // if (processes.size > 0 && !showProcessPanel) {
    //   setShowProcessPanel(true);
    // }
    
    // Auto-hide panel when all processes stop
    // if (processes.size === 0) {
    //   setShowProcessPanel(false);
    // }
  };

  // Toggle process panel visibility
  // const toggleProcessPanel = () => {
  //   setShowProcessPanel(!showProcessPanel);
  // };

  // Stop a process from the process panel
  // const handleStopProcess = (processKey: string) => {
  //   const processInfo = globalProcesses.get(processKey);
  //   if (!processInfo?.process) {
  //     console.log(`No process found for ${processKey}`);
  //     // If no process found, just remove from UI
  //     const newProcesses = new Map(globalProcesses);
  //     newProcesses.delete(processKey);
  //     handleProcessUpdate(newProcesses);
  //     return;
  //   }

  //   console.log(`Stopping process: ${processKey}`);
    
  //   // Close the associated window first
  //   if (processInfo.window && !processInfo.window.isDestroyed()) {
  //     try {
  //       processInfo.window.close();
  //     } catch (error) {
  //       console.error(`Error closing window for ${processKey}:`, error);
  //     }
  //   }

  //   // Send SIGTERM
  //   try {
  //     processInfo.process.kill('SIGTERM');
  //   } catch (error) {
  //     console.error(`Error sending SIGTERM to ${processKey}:`, error);
  //     // If we can't send SIGTERM, remove from UI immediately
  //     const newProcesses = new Map(globalProcesses);
  //     newProcesses.delete(processKey);
  //     handleProcessUpdate(newProcesses);
  //     return;
  //   }
    
  //   // Set up force kill after 5 seconds if process doesn't exit
  //   const forceKillTimeout = setTimeout(() => {
  //     const currentProcesses = new Map(globalProcesses);
  //     if (currentProcesses.has(processKey)) {
  //       console.log(`Force killing process: ${processKey}`);
  //       try {
  //         processInfo.process.kill('SIGKILL');
  //       } catch (error) {
  //         console.error(`Error force killing ${processKey}:`, error);
  //         // If SIGKILL also fails, force remove from UI
  //         const finalProcesses = new Map(globalProcesses);
  //         finalProcesses.delete(processKey);
  //         handleProcessUpdate(finalProcesses);
  //       }
  //     }
  //   }, 5000);

  //   // Clean up timeout if process exits gracefully 
  //   // The 'close' event (registered in MainPane) will handle UI cleanup
  //   processInfo.process.once('close', () => {
  //     clearTimeout(forceKillTimeout);
  //   });
  // };

  // Open window for a process from the process panel
  // const handleOpenWindow = (processKey: string) => {
  //   const processInfo = globalProcesses.get(processKey);
  //   if (processInfo?.port) {
  //     // This will be handled by MainPane's openElectronWindow function
  //     console.log(`Request to open window for ${processKey} at port ${processInfo.port}`);
  //   }
  // };

  return (
    <ThemeProvider>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <h1>Dev Runner</h1>
            <div className="header-actions">
              {/* Temporarily hidden for release */}
              {/* {globalProcesses.size > 0 && (
                <button 
                  className="process-indicator"
                  onClick={toggleProcessPanel}
                  title={`${globalProcesses.size} processes running - click to ${showProcessPanel ? 'hide' : 'show'}`}
                >
                  {globalProcesses.size}
                </button>
              )} */}
              <ThemeToggle />
            </div>
          </div>
          <Breadcrumb 
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            viewingFile={viewingFile}
            onCloseFile={() => setViewingFile(null)}
          />
        </header>
        
        <div className="main-content">
          <aside className="sidebar">
            <FolderTree 
              selectedPath={selectedPath}
              onSelectPath={setSelectedPath}
            />
          </aside>
          
          <main className="content">
            <MainPane 
              selectedPath={selectedPath} 
              onSelectPath={setSelectedPath}
              onViewFile={setViewingFile}
              globalProcesses={globalProcesses}
              onProcessUpdate={handleProcessUpdate}
            />
          </main>

          {/* Temporarily hidden for release */}
          {/* {showProcessPanel && (
            <aside className="process-panel-container">
              <ProcessPanel 
                runningProcesses={globalProcesses}
                onStopProcess={handleStopProcess}
                onOpenWindow={handleOpenWindow}
              />
            </aside>
          )} */}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
