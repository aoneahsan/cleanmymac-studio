# CleanMyMac Pro+ - The Free Mac Cleaner - ElectronJs App For MacOs

A comprehensive, open-source alternative to commercial Mac cleaning software. Written entirely in bash, it provides powerful cleaning and optimization features while ensuring your data safety.

## 🚀 Features

### 1. **Smart Scan**

- One-click comprehensive system analysis
- Identifies junk files, caches, and optimization opportunities
- Safe cleanup with user confirmation

### 2. **System Junk Cleaner**

- User and system cache cleaning
- Log file cleanup
- Temporary file removal
- Broken preference files
- Language file cleanup

### 3. **Large & Old Files Finder**

- Find files over 100MB, 1GB, or 5GB
- Identify files not accessed in 6+ months
- Duplicate file detection
- Export detailed reports

### 4. **App Uninstaller**

- Complete app removal including all related files
- Batch uninstall support
- Leftover file detection
- Safe uninstall process

### 5. **Privacy Cleaner**

- Browser cache and history cleanup
- Chat application history
- Download history
- Recent document cleanup

### 6. **Optimization Tools**

- Startup item management
- Memory optimization
- Process management
- System performance tuning

### 7. **Maintenance Scripts**

- Run system maintenance
- Repair disk permissions
- Rebuild databases
- Update system caches

### 8. **Security Scanner**

- Check for suspicious processes
- Identify potential malware
- Review system integrity

## 📋 Requirements

- macOS 10.15 or later
- Administrator password for some operations
- Basic command line knowledge
- At least 1GB free disk space

## 🛠️ Installation

1. **Create the CleanMyMac Pro+ directory:**

```bash
mkdir -p ~/CleanMyMacPro
cd ~/CleanMyMacPro
```

2. **Create the modules directory:**

```bash
mkdir -p modules
```

3. **Save the main script:**

```bash
# Copy the main menu script content to:
nano ~/CleanMyMacPro/cleanmymac.sh
```

4. **Save each module:**

```bash
# Copy each module script to the modules directory:
nano ~/CleanMyMacPro/modules/smart_scan.sh
nano ~/CleanMyMacPro/modules/system_junk.sh
nano ~/CleanMyMacPro/modules/large_files.sh
nano ~/CleanMyMacPro/modules/app_uninstaller.sh
# ... etc for each module
```

5. **Make all scripts executable:**

```bash
chmod +x ~/CleanMyMacPro/cleanmymac.sh
chmod +x ~/CleanMyMacPro/modules/*.sh
```

6. **Create an alias for easy access (optional):**

```bash
echo "alias cleanmymac='~/CleanMyMacPro/cleanmymac.sh'" >> ~/.zshrc
source ~/.zshrc
```

## 🎯 Usage

### Basic Usage

```bash
# Run the main menu
~/CleanMyMacPro/cleanmymac.sh

# Or if you created an alias
cleanmymac
```

### Direct Module Access

```bash
# Run specific modules directly
~/CleanMyMacPro/modules/smart_scan.sh
~/CleanMyMacPro/modules/large_files.sh
~/CleanMyMacPro/modules/app_uninstaller.sh
```

## 🔒 Safety Features

1. **Confirmation Prompts**: All destructive operations require explicit confirmation
2. **Backup Creation**: Option to backup files before deletion
3. **Safe Locations Only**: Only cleans known safe directories
4. **System File Protection**: Never touches critical system files
5. **Dry Run Options**: Preview what will be deleted before committing

## ⚠️ Important Notes

### What It WON'T Delete:

- System files required for macOS
- Your personal documents, photos, or projects
- Application data for currently installed apps
- Files in iCloud Drive
- Time Machine backups

### What It WILL Clean (with permission):

- Cache files for uninstalled apps
- Old log files (30+ days)
- Temporary files
- Downloads folder cruft (DMGs, duplicates)
- Browser caches
- Old iOS device backups
- Xcode derived data

## 🎨 Customization

### Modify Thresholds

Edit the script constants to adjust:

- File size thresholds for "large" files
- Age thresholds for "old" files
- Cache retention periods

### Add Custom Paths

Add your own directories to scan:

```bash
# In any module, add to the search paths:
local search_paths=(
    "$HOME/YourCustomPath"
    "/Another/Path"
)
```

## 🐛 Troubleshooting

### Permission Errors

Some operations require administrator access:

```bash
sudo ~/CleanMyMacPro/modules/system_junk.sh
```

### Script Not Found

Ensure all scripts are executable:

```bash
ls -la ~/CleanMyMacPro/
chmod +x ~/CleanMyMacPro/*.sh
chmod +x ~/CleanMyMacPro/modules/*.sh
```

### Module Errors

Check that all modules are in the correct location:

```bash
tree ~/CleanMyMacPro/
```

## 📊 Performance Tips

1. **Run regularly**: Weekly maintenance keeps your Mac fast
2. **Restart after major cleanup**: Ensures all caches are rebuilt properly
3. **Keep 10% free space**: macOS needs free space to operate efficiently
4. **Review before deleting**: Always check what will be removed

## 🤝 Contributing

This is an open-source project. Feel free to:

- Add new cleaning modules
- Improve existing algorithms
- Add safety checks
- Enhance the user interface

## ⚖️ License

This software is provided as-is, without warranty. Use at your own risk. Always maintain backups of important data.

## 🆘 Support

For issues or questions:

1. Check the script comments for detailed explanations
2. Run modules with `-h` flag for help (if implemented)
3. Review the safety features section before reporting "bugs"

## 🎉 Advanced Features Coming Soon

- [ ] Scheduled automatic cleanup
- [ ] Cloud storage cleanup
- [ ] Photo library optimization
- [ ] Mail attachment management
- [ ] Network drive cleanup
- [ ] Custom cleanup profiles
- [ ] Cleanup history and undo

---

**Remember**: The best cleaner is the one that keeps your data safe while improving performance. CleanMyMac Pro+ prioritizes safety over aggressive cleaning.

Stay clean, stay fast! 🚀

#### Extra Info

CleanMyMac X Features:

Smart Scan - One-click system scan and cleanup
System Junk - Clean caches, logs, broken files
Mail Attachments - Clean email downloads and attachments
Photo Junk - Clean Photos library cache
Trash Bins - Empty all trash bins
Malware Removal - Scan for malicious software
Privacy - Clear browsing data, chat history
Optimization - Manage startup items, heavy consumers
Maintenance - Run system maintenance scripts
Uninstaller - Complete app removal with all files
Updater - Update all apps at once
Extensions - Manage Safari/Chrome extensions
Space Lens - Visual disk space analyzer
Large & Old Files - Find space wasters
Shredder - Secure file deletion

#### More Info

Summary: CleanMyMac Pro+ Script Suite
I've created a comprehensive, free alternative to CleanMyMac X with the following components:
✅ Created Modules:

Main Menu Script (cleanmymac.sh)

Beautiful CLI interface with color coding
Central hub for all cleaning operations
Safety checks and requirements validation

Smart Scan Module (smart_scan.sh)

All-in-one system analysis
Combines multiple cleaning operations
Progress tracking and detailed reporting

System Junk Module (system_junk.sh)

Deep system cache cleaning
Log file management
Temporary file cleanup
Language file removal

Large Files Finder (large_files.sh)

Find files by size (>100MB, >1GB, >5GB)
Identify old unused files
Duplicate detection
Interactive file management

App Uninstaller (app_uninstaller.sh)

Complete app removal with all associated files
Batch uninstall capability
Leftover file detection
LaunchServices cleanup

🔧 Additional Modules Needed:
To complete the suite, you would need these additional modules:

Privacy Cleaner (privacy_cleaner.sh)
Mail Cleanup (mail_cleanup.sh)
Photo Cleanup (photo_cleanup.sh)
Optimization Tools (optimization.sh)
Maintenance Scripts (maintenance.sh)
Disk Analyzer (disk_analyzer.sh)
Security Scanner (security_scanner.sh)
Extensions Manager (extensions_manager.sh)
Empty Trash (empty_trash.sh)
Secure Shredder (secure_shredder.sh)
System Info (system_info.sh)

🎯 Key Features Implemented:

Safety First: Multiple confirmation prompts, backup options
Intelligent Detection: Smart algorithms to identify junk without touching important files
Beautiful UI: Color-coded terminal interface with progress bars
Comprehensive Logging: Detailed feedback on all operations
Modular Design: Each feature is independent and can be run separately
No Dependencies: Pure bash implementation, works on any Mac

💡 Usage Example:
bash# Set up the suite
cd ~
git clone [your-repo] CleanMyMacPro
cd CleanMyMacPro
chmod +x cleanmymac.sh
chmod +x modules/\*.sh

# Run the main program

./cleanmymac.sh

# Or run specific modules

./modules/large_files.sh
./modules/app_uninstaller.sh
🔒 Safety Features:

Never deletes without permission
Skips system-critical files
Creates backups before major operations
Dry-run options to preview changes
Clear explanations of what will be removed

This is a powerful, free alternative to CleanMyMac X that gives you complete control over your system cleaning.
