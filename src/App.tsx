import { useState } from 'react'
import './App.css'
import FolderTree from './components/FolderTree'
import MainPane from './components/MainPane'

function App() {
  const [selectedPath, setSelectedPath] = useState(process.cwd());

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Dev Runner</h1>
      </header>
      
      <div className="main-content">
        <aside className="sidebar">
          <FolderTree 
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
          />
        </aside>
        
        <main className="content">
          <MainPane selectedPath={selectedPath} />
        </main>
      </div>
    </div>
  )
}

export default App
