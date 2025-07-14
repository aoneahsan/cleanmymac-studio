export const SCAN_CATEGORIES = {
  SYSTEM_CACHE: {
    id: 'system_cache',
    type: 'junk',
    name: 'System Cache',
    description: 'Temporary system files that can be safely removed',
    icon: 'HardDrive',
    freeAccess: false,
  },
  USER_CACHE: {
    id: 'user_cache',
    type: 'junk',
    name: 'User Cache',
    description: 'Application caches and temporary files',
    icon: 'FolderOpen',
    freeAccess: true,
  },
  LOGS: {
    id: 'logs',
    type: 'junk',
    name: 'Log Files',
    description: 'Old system and application logs',
    icon: 'FileText',
    freeAccess: true, // Limited to last 7 days for free users
  },
  DOWNLOADS: {
    id: 'downloads',
    type: 'files',
    name: 'Downloads Cleanup',
    description: 'Old downloads, DMG files, and installers',
    icon: 'Download',
    freeAccess: true, // Limited to 10 oldest files
  },
  TRASH: {
    id: 'trash',
    type: 'junk',
    name: 'Trash',
    description: 'Files in your Trash',
    icon: 'Trash2',
    freeAccess: true,
  },
  MAIL_ATTACHMENTS: {
    id: 'mail_attachments',
    type: 'files',
    name: 'Mail Attachments',
    description: 'Downloaded email attachments',
    icon: 'Mail',
    freeAccess: false,
  },
  IOS_BACKUPS: {
    id: 'ios_backups',
    type: 'backups',
    name: 'iOS Backups',
    description: 'Old iPhone and iPad backups',
    icon: 'Smartphone',
    freeAccess: false,
  },
  XCODE_DERIVED: {
    id: 'xcode_derived',
    type: 'junk',
    name: 'Xcode Derived Data',
    description: 'Xcode build artifacts and caches',
    icon: 'Code',
    freeAccess: false,
  },
  LANGUAGE_FILES: {
    id: 'language_files',
    type: 'system',
    name: 'Language Files',
    description: 'Unused language packs',
    icon: 'Globe',
    freeAccess: false,
  },
  BROKEN_PREFS: {
    id: 'broken_prefs',
    type: 'system',
    name: 'Broken Preferences',
    description: 'Corrupted application preferences',
    icon: 'AlertCircle',
    freeAccess: false,
  },
} as const;

export type CategoryId = keyof typeof SCAN_CATEGORIES;