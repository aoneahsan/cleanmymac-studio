const { execSync } = require('child_process');
const path = require('path');

// Register TypeScript paths
require('tsconfig-paths/register');

// Build electron files
try {
  console.log('Building Electron files...');
  execSync('tsc -p tsconfig.electron.json', { stdio: 'inherit' });
  console.log('Electron build complete!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}