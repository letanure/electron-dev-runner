import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Since the script is at the end of body, DOM should be ready
const rootElement = document.getElementById('root')
if (rootElement) {
  // Keep the loading screen visible for a minimum of 1 second
  const loadingScreen = rootElement.querySelector('.loading-screen')
  
  // Create a container for React app
  const appContainer = document.createElement('div')
  appContainer.style.opacity = '0'
  appContainer.style.transition = 'opacity 0.5s ease-in'
  rootElement.appendChild(appContainer)
  
  createRoot(appContainer).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  // After 1 second, start the transition
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out')
      appContainer.style.opacity = '1'
      
      // Remove loading screen after fade out completes
      setTimeout(() => {
        loadingScreen.remove()
      }, 500)
    }
  }, 1000)
}
