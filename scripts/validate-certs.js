const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Apple Developer Certificates...\n');

try {
  // Check for valid certificates
  const certs = execSync('security find-identity -v -p codesigning').toString();
  
  // Parse certificates
  const certLines = certs.split('\n').filter(line => line.includes('Apple'));
  
  if (certLines.length === 0) {
    console.error('❌ No Apple certificates found');
    console.log('\nPlease install your certificates from the Apple Developer portal');
    process.exit(1);
  }
  
  console.log(`Found ${certLines.length} Apple certificate(s):\n`);
  
  // Check for duplicates
  const certMap = new Map();
  certLines.forEach(line => {
    const match = line.match(/([A-F0-9]{40})\s+"(.+)"/);
    if (match) {
      const [, hash, name] = match;
      if (!certMap.has(name)) {
        certMap.set(name, []);
      }
      certMap.get(name).push(hash);
      console.log(`  ${hash} - ${name}`);
    }
  });
  
  console.log('\n📋 Certificate Analysis:\n');
  
  // Check for ambiguous certificates
  let hasIssues = false;
  certMap.forEach((hashes, name) => {
    if (hashes.length > 1) {
      console.error(`⚠️  Ambiguous certificate: "${name}"`);
      console.log(`   Found ${hashes.length} certificates with the same name`);
      console.log(`   Hashes: ${hashes.join(', ')}`);
      console.log(`   Solution: Use hash instead of name in package.json\n`);
      hasIssues = true;
    }
  });
  
  // Check environment variables
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file found\n');
  } else {
    console.log('⚠️  .env.local file not found');
    console.log('   Create it with your Apple credentials\n');
  }
  
  // Check provisioning profiles
  const profiles = [
    { name: 'embedded.provisionprofile', type: 'Mac App Store' },
    { name: 'mas-dev.provisionprofile', type: 'Development' }
  ];
  
  console.log('📱 Provisioning Profiles:\n');
  profiles.forEach(profile => {
    const profilePath = path.join(__dirname, '../build', profile.name);
    if (fs.existsSync(profilePath)) {
      console.log(`✅ ${profile.type}: ${profile.name}`);
    } else {
      console.log(`❌ ${profile.type}: ${profile.name} (not found)`);
      hasIssues = true;
    }
  });
  
  // Final recommendation
  console.log('\n🎯 Recommendations:\n');
  
  if (hasIssues) {
    console.log('1. Remove duplicate certificates from Keychain Access');
    console.log('2. Download provisioning profiles from Apple Developer portal');
    console.log('3. Use certificate hash instead of name to avoid ambiguity');
    console.log('\nExample package.json configuration:');
    console.log('```');
    console.log('"mac": {');
    console.log('  "identity": "' + (certLines[0]?.match(/[A-F0-9]{40}/)?.[0] || 'YOUR_CERT_HASH') + '"');
    console.log('}');
    console.log('```');
    process.exit(1);
  } else {
    console.log('✅ All certificates and profiles are properly configured!');
    console.log('\nYou can now build for Mac App Store:');
    console.log('  yarn dist:mas');
  }
  
} catch (error) {
  console.error('❌ Certificate validation failed:', error.message);
  console.log('\nMake sure you have:');
  console.log('1. Xcode Command Line Tools installed');
  console.log('2. Valid certificates in your keychain');
  console.log('3. Proper permissions to access the keychain');
  process.exit(1);
}