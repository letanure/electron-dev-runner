const path = require('path');

interface BreadcrumbProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
  viewingFile?: string | null;
  onCloseFile?: () => void;
}

function Breadcrumb({ selectedPath, onSelectPath, viewingFile, onCloseFile }: BreadcrumbProps) {
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
      {viewingFile && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span 
            className="breadcrumb-item breadcrumb-file"
            onClick={onCloseFile}
            onKeyDown={(e) => e.key === 'Enter' && onCloseFile?.()}
            role="button"
            tabIndex={0}
          >
            {path.basename(viewingFile)}
          </span>
        </>
      )}
    </div>
  );
}

export default Breadcrumb;