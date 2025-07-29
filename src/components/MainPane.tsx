import { useState, useEffect } from 'react';
import './MainPane.css';

const fs = require('fs');
const path = require('path');

interface MainPaneProps {
  selectedPath: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  scripts?: Record<string, string>;
}

function MainPane({ selectedPath }: MainPaneProps) {
  const [packageJson, setPackageJson] = useState<PackageJson | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmeFile, setReadmeFile] = useState<string | null>(null);

  useEffect(() => {
    loadPackageJson();
    loadReadme();
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

  const runScript = (scriptName: string) => {
    console.log(`Running: npm run ${scriptName} in ${selectedPath}`);
    // TODO: Implement actual script execution
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

  return (
    <div className="main-pane">
      <div className="path-header">
        <span className="current-path">{selectedPath}</span>
      </div>

      {packageJson && (
        <div className="package-section">
          <h3>📦 {packageJson.name || 'Node.js Project'}</h3>
          <div className="package-info">
            {packageJson.version && <span className="version">v{packageJson.version}</span>}
            {packageJson.description && <p className="description">{packageJson.description}</p>}
          </div>
          
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

      {readmeContent && (
        <div className="readme-section">
          <div className="readme-header">
            <h4>📄 {readmeFile}</h4>
          </div>
          <div 
            className="readme-content"
            dangerouslySetInnerHTML={{ __html: formatReadmeContent(readmeContent) }}
          />
        </div>
      )}

      {!packageJson && !readmeContent && (
        <div className="empty-state">
          <p>📁 Empty folder or no README/package.json found</p>
        </div>
      )}
    </div>
  );
}

export default MainPane;