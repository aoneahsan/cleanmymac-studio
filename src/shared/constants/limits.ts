export const PLAN_LIMITS = {
  free: {
    dailyScans: 1,
    cleanupSizeMB: 500,
    featuresUnlocked: ['smart_scan_basic', 'system_junk_basic', 'large_files_view'],
    batchOperations: false,
    automation: false,
    prioritySupport: false,
  },
  pro: {
    dailyScans: -1, // Unlimited
    cleanupSizeMB: -1, // Unlimited
    featuresUnlocked: ['*'], // All features
    batchOperations: true,
    automation: true,
    prioritySupport: true,
  },
  trial: {
    dailyScans: -1,
    cleanupSizeMB: -1,
    featuresUnlocked: ['*'],
    batchOperations: true,
    automation: true,
    prioritySupport: false,
  },
} as const;

export const FREE_FEATURES = [
  'smart_scan_basic',
  'system_junk_basic',
  'large_files_view',
  'app_uninstaller_single',
] as const;

export const PRO_FEATURES = [
  'smart_scan_advanced',
  'system_junk_full',
  'large_files_delete',
  'app_uninstaller_batch',
  'privacy_cleaner',
  'optimization_tools',
  'malware_scanner',
  'space_lens',
  'automation',
  'scheduled_scans',
] as const;