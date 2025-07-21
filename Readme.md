# CleanMyMac Pro+

A professional macOS system cleaning and optimization application built with Electron, React, and TypeScript.

## Overview

CleanMyMac Pro+ is a desktop application designed to help macOS users clean and optimize their systems. Built as a modern Electron application with a React frontend and Firebase backend, it provides a comprehensive set of tools for system maintenance.

## Features

### Implemented Features
- **Smart Scan**: Quick system analysis for junk files
- **Authentication System**: Firebase-based login/signup
- **Free/Pro Plans**: Freemium model with usage limits
  - Free: 500MB cleanup limit per month
  - Pro: Unlimited cleanup and advanced features
- **App Uninstaller**: Remove applications and their associated files
- **Privacy Cleaner**: Scan browser data and system privacy items
- **Disk Health Analyzer**: Check disk information and statistics
- **Auto-Update System**: Built-in update mechanism

### Features in Development
- **System Junk Cleaner**: Deep cleaning of system files
- **Large & Old Files Finder**: Locate space-hogging files
- **Optimization Tools**: Memory optimizer, startup manager
- **Maintenance Scripts**: System maintenance routines
- **Security Scanner**: Malware and virus detection
- **Real-time Monitoring**: System performance tracking

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Desktop Framework**: Electron 37.x
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **UI Components**: Tailwind CSS + shadcn/ui + PrimeReact
- **State Management**: Zustand
- **API Layer**: Tanstack Query + Axios
- **Routing**: Tanstack Router

## Prerequisites

- Node.js 24.2.0 or higher (use .nvmrc)
- Yarn package manager
- macOS 10.15 or later
- Firebase project setup

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cleanmymac-pro.git
cd cleanmymac-pro
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Development

Run the application in development mode:

```bash
yarn electron:dev
```

This will start both the Vite dev server and the Electron application with hot reload.

### Other development commands:

```bash
# Run only the web version
yarn dev

# Build the application
yarn build

# Type checking
yarn typecheck

# Linting
yarn lint
```

## Building for Production

### Build for macOS:
```bash
yarn dist:mac
```

### Build Universal binary (Intel + Apple Silicon):
```bash
yarn dist:universal
```

### Build for Mac App Store:
```bash
yarn dist:mas
```

The built application will be in the `release/` directory.

## Project Structure

```
cleanmymac-pro/
├── electron/           # Electron main process entry
├── src/
│   ├── main/          # Electron main process modules
│   │   ├── handlers/  # IPC handlers
│   │   └── utils/     # Main process utilities
│   ├── renderer/      # React application
│   │   ├── components/
│   │   ├── lib/       # Utilities and helpers
│   │   ├── pages/     # Route pages
│   │   └── stores/    # Zustand stores
│   └── shared/        # Shared types and constants
├── functions/         # Firebase Functions
├── build/            # Build assets (icons, entitlements)
├── docs-site/        # Documentation website (Docusaurus)
└── release/          # Built applications
```

## Firebase Functions

The project includes Firebase Functions for backend operations. To work with functions:

1. Navigate to functions directory:
```bash
cd functions
```

2. Install dependencies:
```bash
npm install
```

3. Deploy functions:
```bash
npm run deploy
```

## Security Considerations

- The application requests full disk access for system cleaning operations
- All file operations include safety checks and user confirmations
- Sensitive operations require explicit user approval
- Firebase security rules enforce user data isolation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@cleanmymacpro.com or open an issue in the GitHub repository.

## Acknowledgments

- Built with Electron, React, and Firebase
- UI components from PrimeReact and shadcn/ui
- Icons from Lucide React