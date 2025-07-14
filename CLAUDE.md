# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CleanMyMac Pro+ is intended to be an Electron.js application for macOS that provides system cleaning and optimization features. Currently, the project is in the planning phase with only documentation describing bash script implementations.

### Current State
- **No implementation exists** - only README.md documentation
- Project describes two potential approaches:
  1. Electron.js desktop application (stated in title)
  2. Bash script modules (described in content)

### Intended Features
- Smart Scan - comprehensive system analysis
- System Junk Cleaner - cache, logs, temp files
- Large & Old Files Finder
- App Uninstaller with complete cleanup
- Privacy Cleaner - browser/chat history
- Optimization Tools - startup, memory, processes
- Maintenance Scripts - system maintenance
- Security Scanner - malware detection

## Development Approach

### If Building as Electron App
1. Initialize with: `yarn init -y && yarn add electron electron-builder --dev`
2. Create main process for system operations (requires Node.js child_process for bash commands)
3. Implement renderer process with modern UI framework (React/Vue/Angular)
4. Use IPC for secure communication between processes
5. Package with electron-builder for macOS distribution

### If Building as Bash Scripts
1. Create modular bash scripts in `modules/` directory
2. Implement main menu script at `cleanmymac.sh`
3. Each module should be self-contained and executable
4. Use consistent error handling and user confirmation patterns

## Key Technical Considerations

### System Permissions
- Many operations require sudo access
- Electron app would need proper entitlements for:
  - Full Disk Access
  - System Events
  - Accessibility (for some features)

### Safety Requirements
- Always require explicit user confirmation for destructive operations
- Never touch system-critical files
- Implement dry-run mode for all cleanup operations
- Create backups before major changes
- Clear logging of all operations

### macOS Integration
- Target macOS 10.15+ for modern API support
- Use native macOS paths and conventions
- Respect System Integrity Protection (SIP)
- Handle APFS and HFS+ filesystems appropriately

## Architecture Decision Needed

Before proceeding, clarify the implementation approach:
1. **Electron Desktop App**: Modern UI, better UX, requires Node.js/JavaScript expertise
2. **Bash Script Suite**: Simpler implementation, command-line interface, as documented in README

The project name suggests Electron, but the documentation describes bash scripts. This fundamental decision affects all subsequent development.