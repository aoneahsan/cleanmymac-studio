import OneSignal from 'react-onesignal';
import { toast } from 'react-toastify';
import { t } from './i18n-simple';

// OneSignal configuration
export const initializeOneSignal = async () => {
  try {
    // Skip OneSignal in Electron environment
    if (window.electron) {
      console.log('OneSignal skipped in Electron environment');
      return;
    }

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || '';
    if (!appId) {
      console.warn('OneSignal App ID not configured');
      return;
    }

    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false,
      },
    });

    // Request permission for notifications
    const permission = await OneSignal.Notifications.requestPermission();
    console.log('OneSignal permission:', permission);
  } catch (error) {
    console.error('Failed to initialize OneSignal:', error);
  }
};

// Set user external ID for targeted notifications
export const setOneSignalUserId = (userId: string) => {
  OneSignal.login(userId);
};

// Log out user from OneSignal
export const clearOneSignalUserId = () => {
  OneSignal.logout();
};

// Send tags for user segmentation
export const setOneSignalTags = (tags: Record<string, any>) => {
  OneSignal.User.addTags(tags);
};

// Local notification types
export enum NotificationType {
  SCAN_STARTED = 'scan_started',
  SCAN_PROGRESS = 'scan_progress',
  SCAN_COMPLETE = 'scan_complete',
  CLEAN_STARTED = 'clean_started',
  CLEAN_COMPLETE = 'clean_complete',
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

// Send local Electron notification
export const sendLocalNotification = (type: NotificationType, title: string, body: string) => {
  // Check if we're in Electron
  if (window.electron) {
    window.electron.showNotification({
      title,
      body,
      icon: '/icon.png', // You'll need to add an icon
    });
  }

  // Also show as toast for in-app visibility
  switch (type) {
    case NotificationType.ERROR:
      toast.error(body);
      break;
    case NotificationType.SUCCESS:
    case NotificationType.SCAN_COMPLETE:
    case NotificationType.CLEAN_COMPLETE:
      toast.success(body);
      break;
    case NotificationType.WARNING:
      toast.warning(body);
      break;
    default:
      toast.info(body);
  }
};

// Localized notification helpers
export const notifyScanStarted = () => {
  sendLocalNotification(
    NotificationType.SCAN_STARTED,
    t('app.name'),
    t('notifications.scanStarted')
  );
};

export const notifyScanProgress = (progress: number) => {
  sendLocalNotification(
    NotificationType.SCAN_PROGRESS,
    t('app.name'),
    t('notifications.scanProgress', { progress })
  );
};

export const notifyScanComplete = (junkSize: string) => {
  sendLocalNotification(
    NotificationType.SCAN_COMPLETE,
    t('app.name'),
    t('notifications.scanComplete', { size: junkSize })
  );
};

export const notifyCleanStarted = () => {
  sendLocalNotification(
    NotificationType.CLEAN_STARTED,
    t('app.name'),
    t('notifications.cleanStarted')
  );
};

export const notifyCleanComplete = (freedSpace: string) => {
  sendLocalNotification(
    NotificationType.CLEAN_COMPLETE,
    t('app.name'),
    t('notifications.cleanComplete', { size: freedSpace })
  );
};

export const notifyError = (error: string) => {
  sendLocalNotification(
    NotificationType.ERROR,
    t('app.name'),
    error
  );
};

// Create a notification store for managing notification preferences
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  scanNotifications: boolean;
  promotionalNotifications: boolean;
  setScanNotifications: (enabled: boolean) => void;
  setPromotionalNotifications: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      scanNotifications: true,
      promotionalNotifications: true,
      setScanNotifications: (enabled: boolean) => {
        set({ scanNotifications: enabled });
        // Update Electron notification preferences
        if (window.electron) {
          window.electron.setNotificationPreference('scan', enabled);
        }
      },
      setPromotionalNotifications: (enabled: boolean) => {
        set({ promotionalNotifications: enabled });
        // Update OneSignal subscription
        if (enabled) {
          OneSignal.User.pushSubscription.optIn();
        } else {
          OneSignal.User.pushSubscription.optOut();
        }
      },
    }),
    {
      name: 'notification-preferences',
    }
  )
);