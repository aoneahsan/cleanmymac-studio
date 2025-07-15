import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@renderer/stores/authStore';
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { UpgradePrompt } from '@renderer/components/upgrade/UpgradePrompt';
import { LimitIndicator } from '@renderer/components/features/LimitIndicator';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { HardDrive, Zap, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSkeleton } from '@renderer/components/ui/LoadingSkeleton';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';

export function Dashboard() {
  const { user, isProUser } = useAuthStore();
  const navigate = useNavigate();
  const { checkScanLimit, checkCleanupLimit } = usePlanLimits();
  const [usage, setUsage] = useState<{ scan: any; cleanup: any } | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const [scanUsage, cleanupUsage] = await Promise.all([
      checkScanLimit(),
      checkCleanupLimit(0) // Check current usage without adding
    ]);
    setUsage({ scan: scanUsage, cleanup: cleanupUsage });
  };

  if (!usage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('dashboard.welcomeBack', { email: user?.email })}
            </p>
          </div>
          <Tag 
            severity={isProUser() ? 'success' : 'info'} 
            className="px-4 py-2"
            icon="pi pi-star"
          >
            {isProUser() ? t('dashboard.proMember') : t('dashboard.freePlan')}
          </Tag>
        </div>

        {/* Free User Upgrade Prompt */}
        {!isProUser() && (
          <UpgradePrompt />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.totalSpaceFreed')}
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0 GB</div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.allTime')}</p>
            </div>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.lastScan')}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.never')}</div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.runFirstScan')}</p>
            </div>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.systemHealth')}
              </div>
              <div className="text-3xl font-bold text-green-500">{t('dashboard.good')}</div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.noIssuesFound')}</p>
            </div>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.planUsage')}
              </div>
              {usage ? (
                <>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {isProUser() ? t('dashboard.unlimited') : `${usage.scan.used}/${usage.scan.limit}`}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {isProUser() ? t('dashboard.proPlan') : t('dashboard.dailyScans')}
                  </p>
                  {!isProUser() && (
                    <ProgressBar 
                      value={(usage.scan.used / usage.scan.limit) * 100} 
                      className="mt-3"
                      showValue={false}
                    />
                  )}
                </>
              ) : (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('dashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="p-button-lg flex flex-col items-center justify-center gap-3 h-32 hover:scale-105 transition-transform"
                severity="secondary"
                outlined
                onClick={() => navigate({ to: '/smart-scan' })}
              >
                <Zap className="w-8 h-8 text-purple-600" />
                <span className="font-medium">{t('dashboard.smartScan')}</span>
              </Button>
              <FeatureLock isLocked={!isProUser()} featureName={t('dashboard.systemJunk')}>
                <Button 
                  className="p-button-lg flex flex-col items-center justify-center gap-3 h-32 hover:scale-105 transition-transform w-full"
                  severity="secondary"
                  outlined
                  disabled={!isProUser()}
                >
                  <HardDrive className="w-8 h-8 text-purple-600" />
                  <span className="font-medium">{t('dashboard.systemJunk')}</span>
                </Button>
              </FeatureLock>
              <FeatureLock isLocked={!isProUser()} featureName={t('dashboard.privacyScan')}>
                <Button 
                  className="p-button-lg flex flex-col items-center justify-center gap-3 h-32 hover:scale-105 transition-transform w-full"
                  severity="secondary"
                  outlined
                  disabled={!isProUser()}
                >
                  <Shield className="w-8 h-8 text-purple-600" />
                  <span className="font-medium">{t('dashboard.privacyScan')}</span>
                </Button>
              </FeatureLock>
              <FeatureLock isLocked={!isProUser()} featureName={t('dashboard.optimization')}>
                <Button 
                  className="p-button-lg flex flex-col items-center justify-center gap-3 h-32 hover:scale-105 transition-transform w-full"
                  severity="secondary"
                  outlined
                  disabled={!isProUser()}
                >
                  <Activity className="w-8 h-8 text-purple-600" />
                  <span className="font-medium">{t('dashboard.optimization')}</span>
                </Button>
              </FeatureLock>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}