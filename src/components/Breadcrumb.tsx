const path = require('path');

interface BreadcrumbProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
}

function Breadcrumb({ selectedPath, onSelectPath }: BreadcrumbProps) {
  const homeDir = require('os').homedir();
  const relativePath = selectedPath.replace(homeDir, '').split(path.sep).filter(Boolean);
  
  return (
    <div className="breadcrumb">
      <span className="breadcrumb-item" onClick={() => onSelectPath(homeDir)}>
        Home
      </span>
      {relativePath.map((part, index) => {
        const fullPath = path.join(homeDir, ...relativePath.slice(0, index + 1));
        return (
          <span key={fullPath}>
            <span className="breadcrumb-separator">/</span>
            <span 
              className="breadcrumb-item"
              onClick={() => onSelectPath(fullPath)}
            >
              {part}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumb;