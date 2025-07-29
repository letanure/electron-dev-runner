const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

require('@electron/remote/main').initialize();

// Store references to all windows
const windows = new Map();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  require('@electron/remote/main').enable(mainWindow.webContents);

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window management
ipcMain.handle('open-dev-window', (event, { url, title, processKey }) => {
  console.log(`Opening dev window for ${processKey}: ${url}`);
  
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
  windows.set(processKey, devWindow);

  // Clean up when window is closed
  devWindow.on('closed', () => {
    console.log(`Dev window closed for ${processKey}`);
    windows.delete(processKey);
    
    // Notify renderer process
    event.sender.send('dev-window-closed', processKey);
  });

  devWindow.loadURL(url);
  
  // Only open dev tools in development mode
  if (process.env.NODE_ENV === 'development') {
    devWindow.webContents.openDevTools();
  }

  return true;
});

ipcMain.handle('close-dev-window', (event, processKey) => {
  console.log(`Closing dev window for ${processKey}`);
  
  const window = windows.get(processKey);
  if (window && !window.isDestroyed()) {
    window.close();
    windows.delete(processKey);
    return true;
  }
  
  return false;
});