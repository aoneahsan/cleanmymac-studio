import { useAuthStore } from '@renderer/stores/authStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@renderer/lib/firebase';
import { PLAN_LIMITS } from '@shared/constants/limits';

interface UsageCheck {
  allowed: boolean;
  limit: number;
  used: number;
  remaining?: number;
  message?: string;
}

export function usePlanLimits() {
  const { user, isProUser } = useAuthStore();

  const checkScanLimit = async (): Promise<UsageCheck> => {
    if (isProUser()) {
      return { allowed: true, limit: -1, used: 0 };
    }

    try {
      const trackUsage = httpsCallable(functions, 'trackUsage');
      const result = await trackUsage({ action: 'scan' });
      return result.data as UsageCheck;
    } catch (error) {
      console.error('Failed to check scan limit:', error);
      return { 
        allowed: false, 
        limit: 1, 
        used: 1,
        message: 'Failed to verify scan limit' 
      };
    }
  };

  const checkCleanupLimit = async (sizeBytes: number): Promise<UsageCheck> => {
    if (isProUser()) {
      return { allowed: true, limit: -1, used: 0 };
    }

    const limitBytes = PLAN_LIMITS.free.cleanupSizeMB * 1024 * 1024;

    try {
      const trackUsage = httpsCallable(functions, 'trackUsage');
      const result = await trackUsage({ 
        action: 'cleanup', 
        amount: sizeBytes 
      });
      return result.data as UsageCheck;
    } catch (error) {
      console.error('Failed to check cleanup limit:', error);
      return { 
        allowed: false, 
        limit: limitBytes, 
        used: 0,
        remaining: limitBytes,
        message: 'Failed to verify cleanup limit' 
      };
    }
  };

  const canUseFeature = (feature: string): boolean => {
    if (!user) return false;
    return useAuthStore.getState().canUseFeature(feature);
  };

  const getFeatureLimits = () => {
    const planType = user?.plan.type || 'free';
    return PLAN_LIMITS[planType];
  };

  const formatLimitMessage = (usage: UsageCheck, type: 'scan' | 'cleanup'): string => {
    if (usage.allowed) return '';

    if (type === 'scan') {
      return `You've reached your daily scan limit (${usage.used}/${usage.limit}). Upgrade to Pro for unlimited scans.`;
    }

    if (type === 'cleanup') {
      const remainingMB = Math.round((usage.remaining || 0) / 1024 / 1024);
      return `You've reached your monthly cleanup limit. ${remainingMB}MB remaining. Upgrade to Pro for unlimited cleanup.`;
    }

    return usage.message || 'Limit reached. Upgrade to Pro for unlimited access.';
  };

  return {
    checkScanLimit,
    checkCleanupLimit,
    canUseFeature,
    getFeatureLimits,
    formatLimitMessage,
    isProUser: isProUser(),
  };
}