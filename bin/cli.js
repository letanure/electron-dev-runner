#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Electron Dev Runner...');

// Path to the main Electron file
const electronPath = require('electron');
const appPath = path.join(__dirname, '..', 'main.js');

// Spawn Electron with the app
const electronProcess = spawn(electronPath, [appPath], {
  stdio: 'inherit',
  detached: false
});

// Handle process exit
electronProcess.on('close', (code) => {
  process.exit(code);
});

// Handle errors
electronProcess.on('error', (err) => {
  console.error('Failed to start Electron Dev Runner:', err);
  process.exit(1);
});