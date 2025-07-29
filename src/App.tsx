import { useState, useEffect } from 'react'
import './App.css'

const fs = require('fs');
const path = require('path');

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

function App() {
  const [currentPath, setCurrentPath] = useState(process.cwd());
  const [items, setItems] = useState<FileItem[]>([]);

  useEffect(() => {
    try {
      const files = fs.readdirSync(currentPath, { withFileTypes: true });
      const fileItems = files.map((dirent: any) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: path.join(currentPath, dirent.name)
      }));
      
      // Sort: directories first, then files
      fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setItems(fileItems);
    } catch (error) {
      console.error('Error reading directory:', error);
      setItems([]);
    }
  }, [currentPath]);

  const navigateUp = () => {
    const parentPath = path.dirname(currentPath);
    if (parentPath !== currentPath) {
      setCurrentPath(parentPath);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📁 File Explorer</h1>
        <div className="path-bar">
          <button onClick={navigateUp} className="up-button">
            ⬆️ Up
          </button>
          <span className="current-path">{currentPath}</span>
        </div>
      </header>
      
      <main className="file-list">
        {items.map((item) => (
          <div
            key={item.path}
            className={`file-item ${item.isDirectory ? 'directory' : 'file'}`}
            onClick={() => handleItemClick(item)}
          >
            <span className="icon">
              {item.isDirectory ? '📁' : '📄'}
            </span>
            <span className="name">{item.name}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty">No items found</div>
        )}
      </main>
    </div>
  )
}

export default App
