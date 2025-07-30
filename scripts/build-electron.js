#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json
const packagePath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Backup original package.json
const backup = { ...packageJson };

try {
  console.log('📦 Moving electron to dependencies...');
  
  // Move electron from devDependencies to dependencies
  if (packageJson.devDependencies && packageJson.devDependencies.electron) {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies.electron = packageJson.devDependencies.electron;
    delete packageJson.devDependencies.electron;
    
    // Write modified package.json
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    console.log('🔨 Building Electron app...');
    
    // Run electron-builder
    execSync('npm run build && electron-builder --publish=never', { 
      stdio: 'inherit' 
    });
    
    console.log('✅ Build completed successfully!');
    
  } else {
    console.log('❌ Electron not found in devDependencies');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
  
} finally {
  console.log('🔄 Restoring package.json...');
  
  // Always restore original package.json
  fs.writeFileSync(packagePath, JSON.stringify(backup, null, 2));
  
  console.log('✅ Package.json restored');
}