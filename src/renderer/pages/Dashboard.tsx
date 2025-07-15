import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@renderer/stores/authStore';
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { SoundButton } from '@renderer/components/ui/SoundButton';
import { UpgradePrompt } from '@renderer/components/upgrade/UpgradePrompt';
import { LimitIndicator } from '@renderer/components/features/LimitIndicator';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { HardDrive, Zap, Shield, Activity, TrendingUp, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSkeleton } from '@renderer/components/ui/LoadingSkeleton';
import { OnboardingTour } from '@renderer/components/onboarding/OnboardingTour';
import { SystemMonitor } from '@renderer/components/widgets/SystemMonitor';
import { QuickTips } from '@renderer/components/widgets/QuickTips';
import { NetworkSpeed } from '@renderer/components/widgets/NetworkSpeed';
import { DragDropAnalyzer } from '@renderer/components/features/DragDropAnalyzer';
import { ScheduledScans } from '@renderer/components/features/ScheduledScans';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { user, isProUser } = useAuthStore();
  const navigate = useNavigate();
  const { checkScanLimit, checkCleanupLimit } = usePlanLimits();
  const [usage, setUsage] = useState<{ scan: any; cleanup: any } | null>(null);
  const [showMonitor, setShowMonitor] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showNetworkSpeed, setShowNetworkSpeed] = useState(false);

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
      <OnboardingTour />
      {showMonitor && <SystemMonitor onClose={() => setShowMonitor(false)} />}
      {showTips && <QuickTips onClose={() => setShowTips(false)} />}
      {showNetworkSpeed && <NetworkSpeed onClose={() => setShowNetworkSpeed(false)} />}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto p-6 space-y-6"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="onboarding-welcome">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t('dashboard.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                {t('dashboard.welcomeBack', { email: user?.email })}
              </p>
            </div>
            <Tag 
              severity={isProUser() ? 'success' : 'info'} 
              className="px-6 py-3 text-lg"
              icon="pi pi-star-fill"
            >
              {isProUser() ? t('dashboard.proMember') : t('dashboard.freePlan')}
            </Tag>
          </motion.div>

          {/* Widget Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 justify-end"
          >
            <Button
              label={t('dashboard.widgets.systemMonitor')}
              icon={showMonitor ? "pi pi-eye-slash" : "pi pi-eye"}
              size="small"
              severity="secondary"
              text
              onClick={() => setShowMonitor(!showMonitor)}
            />
            <Button
              label={t('dashboard.widgets.quickTips')}
              icon={showTips ? "pi pi-eye-slash" : "pi pi-eye"}
              size="small"
              severity="secondary"
              text
              onClick={() => setShowTips(!showTips)}
            />
            <Button
              label={t('dashboard.widgets.networkSpeed')}
              icon={showNetworkSpeed ? "pi pi-eye-slash" : "pi pi-eye"}
              size="small"
              severity="secondary"
              text
              onClick={() => setShowNetworkSpeed(!showNetworkSpeed)}
            />
          </motion.div>

          {/* Free User Upgrade Prompt */}
          {!isProUser() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <UpgradePrompt />
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            data-tour="stats"
          >
            <motion.div variants={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="hover-lift glass overflow-hidden group">
                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <Tag severity="success" value="All time" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      0 GB
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.totalSpaceFreed')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="hover-lift glass overflow-hidden group">
                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {t('dashboard.never')}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.lastScan')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{t('dashboard.runFirstScan')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="hover-lift glass overflow-hidden group">
                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {t('dashboard.good')}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.systemHealth')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{t('dashboard.noIssuesFound')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="hover-lift glass overflow-hidden group">
                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        <Activity className="w-6 h-6" />
                      </div>
                      <Tag severity={isProUser() ? 'success' : 'warning'} value={isProUser() ? 'Pro' : 'Free'} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {isProUser() ? t('dashboard.unlimited') : `${usage.scan.used}/${usage.scan.limit}`}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.planUsage')}
                    </p>
                    {!isProUser() && (
                      <ProgressBar 
                        value={(usage.scan.used / usage.scan.limit) * 100} 
                        className="mt-3"
                        showValue={false}
                        style={{ height: '0.5rem' }}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-2xl glass overflow-hidden" data-tour="quick-actions">
              <div className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-6">
                  {t('dashboard.quickActions')}
                </h2>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <motion.div variants={item} data-tour="smart-scan">
                    <SoundButton 
                      className="w-full h-32 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300"
                      onClick={() => navigate({ to: '/smart-scan' })}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Zap className="w-10 h-10" />
                      </motion.div>
                      <span className="text-lg font-medium">{t('dashboard.smartScan')}</span>
                    </SoundButton>
                  </motion.div>

                  <motion.div variants={item}>
                    <FeatureLock isLocked={!isProUser()} featureName={t('cleaners.appUninstaller')}>
                      <SoundButton 
                        className="w-full h-32 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-500 to-pink-500 border-0 text-white hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-300"
                        disabled={!isProUser()}
                        onClick={() => navigate({ to: '/app-uninstaller' })}
                      >
                        <Package className="w-10 h-10" />
                        <span className="text-lg font-medium">{t('cleaners.appUninstaller')}</span>
                      </SoundButton>
                    </FeatureLock>
                  </motion.div>

                  <motion.div variants={item}>
                    <FeatureLock isLocked={!isProUser()} featureName={t('dashboard.privacyScan')}>
                      <Button 
                        className="w-full h-32 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all duration-300"
                        disabled={!isProUser()}
                      >
                        <Shield className="w-10 h-10" />
                        <span className="text-lg font-medium">{t('dashboard.privacyScan')}</span>
                      </Button>
                    </FeatureLock>
                  </motion.div>

                  <motion.div variants={item}>
                    <FeatureLock isLocked={!isProUser()} featureName={t('dashboard.optimization')}>
                      <Button 
                        className="w-full h-32 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105 transition-all duration-300"
                        disabled={!isProUser()}
                      >
                        <Activity className="w-10 h-10" />
                        <span className="text-lg font-medium">{t('dashboard.optimization')}</span>
                      </Button>
                    </FeatureLock>
                  </motion.div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Drag & Drop File Analyzer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <DragDropAnalyzer />
          </motion.div>

          {/* Scheduled Scans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FeatureLock 
              isLocked={!isProUser()} 
              featureName={t('schedules.title')}
            >
              <ScheduledScans />
            </FeatureLock>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}