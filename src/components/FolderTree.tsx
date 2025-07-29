import { useState, useEffect } from 'react';
import './FolderTree.css';

const fs = require('fs');
const path = require('path');

interface FolderTreeProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isExpanded: boolean;
  hasPackageJson: boolean;
  children: TreeNode[];
}

function FolderTree({ selectedPath, onSelectPath }: FolderTreeProps) {
  const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);

  const checkPackageJson = (dirPath: string): boolean => {
    try {
      return fs.existsSync(path.join(dirPath, 'package.json'));
    } catch {
      return false;
    }
  };

  const hasSubfolders = (nodePath: string): boolean => {
    try {
      const items = fs.readdirSync(nodePath, { withFileTypes: true });
      return items.some((item: any) => item.isDirectory() && !item.name.startsWith('.'));
    } catch {
      return false;
    }
  };

  const loadChildren = (nodePath: string): TreeNode[] => {
    try {
      const items = fs.readdirSync(nodePath, { withFileTypes: true });
      return items
        .filter((item: any) => item.isDirectory() && !item.name.startsWith('.'))
        .map((item: any) => {
          const childPath = path.join(nodePath, item.name);
          return {
            name: item.name,
            path: childPath,
            isExpanded: false,
            hasPackageJson: checkPackageJson(childPath),
            children: []
          };
        })
        .sort((a, b) => {
          if (a.hasPackageJson && !b.hasPackageJson) return -1;
          if (!a.hasPackageJson && b.hasPackageJson) return 1;
          return a.name.localeCompare(b.name);
        });
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const homeDir = require('os').homedir();
    const initialNodes = [
      {
        name: '🏠 Home',
        path: homeDir,
        isExpanded: true,
        hasPackageJson: checkPackageJson(homeDir),
        children: loadChildren(homeDir)
      }
    ];
    setRootNodes(initialNodes);
  }, []);

  // Auto-expand path to show current selection
  useEffect(() => {
    if (selectedPath) {
      expandPathTo(selectedPath);
    }
  }, [selectedPath]);

  const expandPathTo = (targetPath: string) => {
    const pathParts = targetPath.split(path.sep);
    const homeDir = require('os').homedir();
    
    const updateNodesRecursively = (nodes: TreeNode[], currentPath: string): TreeNode[] => {
      return nodes.map(node => {
        if (targetPath.startsWith(node.path)) {
          return {
            ...node,
            isExpanded: true,
            hasPackageJson: checkPackageJson(node.path), // Refresh package.json status
            children: node.children.length > 0 ? 
              updateNodesRecursively(node.children, node.path) : 
              loadChildren(node.path)
          };
        }
        return node;
      });
    };

    setRootNodes(prev => updateNodesRecursively(prev, homeDir));
  };

  const toggleExpand = (targetPath: string) => {
    const updateNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.path === targetPath) {
          const newExpanded = !node.isExpanded;
          return {
            ...node,
            isExpanded: newExpanded,
            children: newExpanded ? loadChildren(node.path) : []
          };
        }
        if (node.children.length > 0) {
          return {
            ...node,
            children: updateNodes(node.children)
          };
        }
        return node;
      });
    };

    setRootNodes(updateNodes(rootNodes));
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isSelected = node.path === selectedPath;
    const nodeHasSubfolders = hasSubfolders(node.path);
    
    return (
      <div key={node.path}>
        <div
          className={`tree-node ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 10}px` }}
        >
          <span
            className={`expand-icon ${nodeHasSubfolders ? 'expandable' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (nodeHasSubfolders) {
                toggleExpand(node.path);
              }
            }}
          >
            {nodeHasSubfolders ? (node.isExpanded ? '▼' : '▶') : '  '}
          </span>
          <span 
            className="folder-content"
            onClick={() => onSelectPath(node.path)}
          >
            <span className="folder-icon">
              {node.hasPackageJson ? '📦' : '📁'}
            </span>
            <span className="folder-name">
              {node.name}
            </span>
          </span>
        </div>
        
        {node.isExpanded && node.children.map(child => 
          renderNode(child, depth + 1)
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      {rootNodes.map(node => renderNode(node))}
    </div>
  );
}

export default FolderTree;