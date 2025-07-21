# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CleanMyMac Pro+ is an Electron.js desktop application for macOS that provides system cleaning and optimization features. Built with React, TypeScript, and Firebase, it offers a modern UI for system maintenance tasks.

### Current State
- **Fully implemented** as an Electron + React + TypeScript application
- Firebase backend integration complete (Auth, Firestore, Functions, Storage)
- Free/Pro tier system implemented
- Core UI and authentication features working
- Many cleaning features need backend implementation

### Implemented Features
- Smart Scan - basic system analysis (read-only)
- Authentication System - Firebase auth with email/password
- App Uninstaller - lists apps and associated files
- Privacy Cleaner - scans browser and system privacy data
- Disk Health Analyzer - basic disk information
- Auto-Update System - Electron updater integration
- Pro Plan Request System - manual upgrade process

### Features Needing Implementation
- Actual file cleaning operations (currently read-only)
- System Junk Cleaner - deep cleaning functionality
- Large & Old Files Finder - comprehensive file search
- Optimization Tools - memory, startup management
- Maintenance Scripts - system maintenance routines
- Security Scanner - malware detection
- Real-time monitoring and notifications

## Technical Stack

### Frontend
- React 19 with TypeScript
- Vite as build tool
- Tailwind CSS + PrimeReact for UI
- Zustand for state management
- Tanstack Router for routing
- Tanstack Query for API calls

### Backend
- Electron 37.x for desktop integration
- Firebase for cloud services
- Node.js child_process for system operations
- IPC handlers for main/renderer communication

## Key Technical Considerations

### System Permissions
- Full Disk Access required for cleaning operations
- Proper entitlements configured in `build/entitlements.*.plist`
- Accessibility permissions for some features

### Safety Requirements
- All destructive operations require explicit user confirmation
- Implement dry-run mode before actual cleaning
- Create backups for critical operations
- Comprehensive error handling and logging
- Never touch system-critical files

### macOS Integration
- Targets macOS 10.15+ for modern API support
- Universal binary support (Intel + Apple Silicon)
- Mac App Store distribution ready
- Respects System Integrity Protection (SIP)
- Handles APFS and HFS+ filesystems

## Development Guidelines

### Code Organization
```
src/
├── main/          # Electron main process
│   ├── handlers/  # IPC handlers for features
│   └── modules/   # Core business logic
├── renderer/      # React application
│   ├── components/
│   ├── pages/
│   └── stores/
└── shared/        # Shared types and constants
```

### Adding New Features
1. Create IPC handler in `src/main/handlers/`
2. Implement business logic in `src/main/modules/`
3. Add React components in `src/renderer/components/features/`
4. Update types in `src/shared/types/`
5. Add proper error handling and user confirmations

### Security Best Practices
- Validate all IPC inputs
- Use contextBridge for secure renderer access
- Implement proper Firebase security rules
- Never expose sensitive operations directly
- Log all critical operations

## Current Development Priorities

1. **High Priority**
   - Implement actual file cleaning operations
   - Add comprehensive error handling
   - Complete safety checks for all operations

2. **Medium Priority**
   - Security scanner implementation
   - Optimization tools backend
   - Maintenance scripts
   - Complete documentation

3. **Low Priority**
   - Advanced monitoring features
   - Performance optimizations
   - Additional UI polish