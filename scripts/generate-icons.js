const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sizes = [16, 32, 64, 128, 256, 512, 1024];
const iconsetPath = path.join(__dirname, '../build/icon.iconset');
const svgPath = path.join(__dirname, '../build/icon.svg');
const icnsPath = path.join(__dirname, '../build/icon.icns');

// Create iconset directory
if (!fs.existsSync(iconsetPath)) {
  fs.mkdirSync(iconsetPath, { recursive: true });
}

console.log('Generating icon sizes from SVG...');

// Generate PNG files for each size
sizes.forEach(size => {
  const standardName = `icon_${size}x${size}.png`;
  const retinaSize = size * 2;
  
  // Standard resolution
  if (size <= 512) {
    console.log(`Creating ${standardName}...`);
    try {
      execSync(`sips -s format png -z ${size} ${size} "${svgPath}" --out "${path.join(iconsetPath, standardName)}"`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error(`Failed to create ${standardName}:`, error.message);
    }
  }
  
  // Retina resolution (@2x)
  if (size >= 16 && size <= 512) {
    const retinaName = `icon_${size}x${size}@2x.png`;
    console.log(`Creating ${retinaName}...`);
    try {
      execSync(`sips -s format png -z ${retinaSize} ${retinaSize} "${svgPath}" --out "${path.join(iconsetPath, retinaName)}"`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error(`Failed to create ${retinaName}:`, error.message);
    }
  }
});

// Create the .icns file
console.log('\nCreating .icns file...');
try {
  execSync(`iconutil -c icns "${iconsetPath}" -o "${icnsPath}"`, {
    stdio: 'inherit'
  });
  console.log(`✓ Icon created successfully at: ${icnsPath}`);
  
  // Clean up iconset directory
  execSync(`rm -rf "${iconsetPath}"`);
  console.log('✓ Cleaned up temporary files');
} catch (error) {
  console.error('Failed to create .icns file:', error.message);
  console.log('\nMake sure you have iconutil installed (comes with Xcode Command Line Tools)');
  console.log('You can install it with: xcode-select --install');
}