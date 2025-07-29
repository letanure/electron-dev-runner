import { useState, useEffect } from 'react';
import './MainPane.css';

const fs = require('fs');
const path = require('path');

interface MainPaneProps {
  selectedPath: string;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
}

function MainPane({ selectedPath }: MainPaneProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [packageJson, setPackageJson] = useState<PackageJson | null>(null);

  useEffect(() => {
    loadFolderContents();
    loadPackageJson();
  }, [selectedPath]);

  const loadFolderContents = () => {
    try {
      const files = fs.readdirSync(selectedPath, { withFileTypes: true });
      const fileItems = files.map((dirent: any) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: path.join(selectedPath, dirent.name)
      }));
      
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

  const runScript = (scriptName: string) => {
    console.log(`Running: npm run ${scriptName} in ${selectedPath}`);
    // TODO: Implement actual script execution
  };

  return (
    <div className="main-pane">
      <div className="path-header">
        <span className="current-path">{selectedPath}</span>
      </div>

      {packageJson && (
        <div className="package-section">
          <h3>📦 {packageJson.name || 'Node.js Project'}</h3>
          {packageJson.version && <p className="version">v{packageJson.version}</p>}
          
          {packageJson.scripts && (
            <div className="scripts">
              <h4>Available Scripts:</h4>
              <div className="script-buttons">
                {Object.entries(packageJson.scripts).map(([name, command]) => (
                  <div key={name} className="script-item">
                    <button 
                      className="script-button"
                      onClick={() => runScript(name)}
                    >
                      ▶️ {name}
                    </button>
                    <span className="script-command">{command}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="file-list">
        <h4>📁 Folder Contents</h4>
        {items.map((item) => (
          <div
            key={item.path}
            className={`file-item ${item.isDirectory ? 'directory' : 'file'}`}
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
      </div>
    </div>
  );
}

export default MainPane;