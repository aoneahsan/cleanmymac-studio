# Apple Developer Setup Guide for CleanMyMac Pro+

This guide will walk you through setting up Apple Developer credentials for building and distributing CleanMyMac Pro+ on the Mac App Store.

## Prerequisites

- macOS 10.15 or later
- Xcode 12 or later (for Command Line Tools)
- Apple Developer Account ($99/year)
- Admin access to your Mac

## Step 1: Apple Developer Account

1. Visit [developer.apple.com](https://developer.apple.com)
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program if not already enrolled
4. Accept all agreements and terms

## Step 2: Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to create a new identifier
3. Select "App IDs" and click Continue
4. Select "App" as the type
5. Fill in the details:
   - Description: `CleanMyMac Pro Plus`
   - Bundle ID: `com.zaions.cleanmymac-pro-plus` (Explicit)
   - Capabilities: Enable required capabilities
6. Click Continue and then Register

## Step 3: Create Certificates

### Development Certificate

1. Go to [Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click "+" to create a new certificate
3. Select "Mac Development" and click Continue
4. Follow the instructions to create a Certificate Signing Request (CSR)
5. Upload the CSR and download the certificate
6. Double-click the certificate to install it in Keychain

### Distribution Certificates

#### Mac App Distribution
1. Create a new certificate
2. Select "Mac App Distribution" for Mac App Store
3. Follow the same CSR process
4. Install the certificate

#### Developer ID Application (for direct distribution)
1. Create a new certificate
2. Select "Developer ID Application"
3. Follow the CSR process
4. Install the certificate

## Step 4: Fix Certificate Ambiguity

If you encounter the error:
```
Apple Development: Ahsan Mahmood (RNXN64ZKRZ): ambiguous
```

### Solution 1: Remove Duplicates
1. Open Keychain Access
2. Search for "Apple Development: Ahsan Mahmood"
3. Delete duplicate certificates (keep only the most recent valid one)
4. Search for any expired certificates and remove them

### Solution 2: Use Certificate Hash
1. In Keychain Access, find your certificate
2. Right-click → Get Info
3. Copy the SHA-1 fingerprint
4. Update package.json to use the hash instead of the name:
   ```json
   "mac": {
     "identity": "7D2F1E74311899C3A306CDDF4E63745123FE06E6"
   }
   ```

### Solution 3: Clean Keychain
```bash
# List all certificates
security find-identity -v -p codesigning

# Delete specific certificate by hash
security delete-certificate -Z [HASH] ~/Library/Keychains/login.keychain-db
```

## Step 5: Create Provisioning Profiles

### Mac App Store Profile
1. Go to [Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click "+" to create a new profile
3. Select "Mac App Store" under Distribution
4. Select your App ID: `com.zaions.cleanmymac-pro-plus`
5. Select your Mac App Distribution certificate
6. Name it: `CleanMyMac Pro Plus MAS`
7. Download and save as `build/embedded.provisionprofile`

### Development Profile
1. Create another profile
2. Select "macOS App Development"
3. Select your App ID and development certificate
4. Name it: `CleanMyMac Pro Plus Dev`
5. Download and save as `build/mas-dev.provisionprofile`

## Step 6: Configure Build Environment

### Environment Variables
Create a `.env.local` file:
```bash
# Apple Developer Credentials
APPLE_ID=your.email@example.com
APPLE_ID_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=RNXN64ZKRZ

# Certificate Identity (use hash to avoid ambiguity)
CSC_IDENTITY_AUTO_DISCOVERY=false
CSC_NAME=7D2F1E74311899C3A306CDDF4E63745123FE06E6
```

### App-Specific Password
1. Visit [appleid.apple.com](https://appleid.apple.com)
2. Sign in and go to Security
3. Generate an app-specific password
4. Use this password for `APPLE_ID_PASSWORD`

## Step 7: Build Commands

### Development Build
```bash
yarn dist:mas-dev
```

### Mac App Store Build
```bash
yarn dist:mas
```

### Direct Distribution Build
```bash
yarn dist:mac
```

## Step 8: Validate Before Submission

### Using Xcode
1. Open the built .app in Xcode
2. Choose Product → Archive
3. Click "Validate App"
4. Fix any issues reported

### Using xcrun
```bash
xcrun altool --validate-app -f release/1.0.0/mas/CleanMyMac\ Pro+.app -t osx -u $APPLE_ID -p $APPLE_ID_PASSWORD
```

## Step 9: Upload to App Store Connect

### Using Transporter
1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) from Mac App Store
2. Sign in with your Apple ID
3. Drag the .pkg file to upload

### Using xcrun
```bash
xcrun altool --upload-app -f release/1.0.0/mas/CleanMyMac\ Pro+.pkg -t osx -u $APPLE_ID -p $APPLE_ID_PASSWORD
```

## Troubleshooting

### Certificate Not Found
- Ensure certificates are in the login keychain, not system keychain
- Check certificate trust settings
- Verify certificate hasn't expired

### Code Signing Failed
- Clean build folder: `rm -rf release/`
- Reset provisioning profiles: `rm -rf ~/Library/MobileDevice/Provisioning\ Profiles/`
- Restart Xcode/Terminal

### Entitlements Issues
- Verify all required entitlements are in the .plist files
- Check that capabilities match between App ID and entitlements
- Ensure provisioning profile includes all capabilities

### Notarization Failed
- Check that all binaries are signed
- Ensure hardened runtime is enabled
- Verify entitlements don't conflict

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Rotate certificates** before expiration
4. **Keep provisioning profiles** up to date
5. **Use separate certificates** for development and production

## Automation Script

Create `scripts/validate-certs.js`:
```javascript
const { execSync } = require('child_process');

try {
  // Check for valid certificates
  const certs = execSync('security find-identity -v -p codesigning').toString();
  console.log('Available certificates:', certs);
  
  // Verify specific certificate
  const certHash = process.env.CSC_NAME;
  if (certHash && certs.includes(certHash)) {
    console.log('✓ Certificate found:', certHash);
  } else {
    console.error('✗ Certificate not found');
    process.exit(1);
  }
} catch (error) {
  console.error('Certificate validation failed:', error.message);
  process.exit(1);
}
```

Run before each build:
```bash
node scripts/validate-certs.js && yarn dist:mas
```

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Electron Mac App Store Guide](https://www.electronjs.org/docs/latest/tutorial/mac-app-store-submission-guide)
- [Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Notarizing macOS Software](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)