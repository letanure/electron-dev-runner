import { useState } from 'react'
import './App.css'
import FolderTree from './components/FolderTree'
import MainPane from './components/MainPane'
import Breadcrumb from './components/Breadcrumb'
import ThemeToggle from './components/ThemeToggle'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [selectedPath, setSelectedPath] = useState(process.cwd());

  return (
    <ThemeProvider>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <h1>Dev Runner</h1>
            <ThemeToggle />
          </div>
          <Breadcrumb 
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
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
            <MainPane selectedPath={selectedPath} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
