import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// Plugin to use custom HTML template for production builds
const electronBuildPlugin = () => {
  return {
    name: 'electron-build',
    closeBundle() {
      // Copy our custom HTML template over the generated one
      const customHtml = resolve(__dirname, 'index-electron.html')
      const distHtml = resolve(__dirname, 'dist', 'index.html')
      copyFileSync(customHtml, distHtml)
      console.log('✓ Copied electron HTML template')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), electronBuildPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'iife'
      }
    }
  }
})
