import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { LimitIndicator } from '@renderer/components/features/LimitIndicator';
import { CleanButton } from '@renderer/components/features/CleanButton';
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { useScanStore } from '@renderer/stores/scanStore';
import { useHistoryStore } from '@renderer/stores/historyStore';
import { useAuthStore } from '@renderer/stores/authStore';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';
import { Zap, Trash2, FileText, Download, Package, AlertCircle, Crown } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import { notifyScanStarted, notifyScanComplete, notifyCleanStarted, notifyCleanComplete } from '@renderer/lib/notifications';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import type { ScanCategory, ScanItem } from '@shared/types/scan';

interface CategoryCardProps {
  category: ScanCategory;
  isLocked: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}

const CategoryCard = React.memo(({ category, isLocked, isSelected, onToggle, onViewDetails }: CategoryCardProps) => {
  const Icon = ({
    cache: Trash2,
    logs: FileText,
    downloads: Download,
    trash: Trash2,
    applications: Package,
  } as Record<string, any>)[category.type] || Trash2;

  const categoryNames: Record<string, string> = {
    cache: t('scan.applicationJunk'),
    logs: t('scan.systemJunk'),
    downloads: t('scan.downloads'),
    trash: t('scan.trashBins'),
    applications: t('scan.applications'),
  };

  return (
    <FeatureLock 
      isLocked={isLocked} 
      featureName={categoryNames[category.type] || category.name}
      showBadge={false}
    >
      <motion.div
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
        whileTap={{ scale: isLocked ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`shadow-lg transition-all ${isSelected ? 'ring-2 ring-purple-500' : ''} ${isLocked ? 'opacity-75' : ''}`}>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <Checkbox 
                  checked={isSelected} 
                  onChange={() => !isLocked && onToggle()}
                  disabled={isLocked}
                />
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold line-clamp-2">{categoryNames[category.type] || category.name}</h3>
              </div>
              <Tag severity="info" className="font-mono text-xs sm:text-sm">{formatBytes(category.size)}</Tag>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {category.items.length} {t('common.items', { count: category.items.length })}
              </p>
              <Button 
                label={t('common.viewDetails')}
                severity="secondary"
                text
                onClick={onViewDetails}
                disabled={isLocked}
                className="w-full"
                size="small"
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </FeatureLock>
  );
});

CategoryCard.displayName = 'CategoryCard';

export function SmartScan() {
  const navigate = useNavigate();
  const { scanResults, isScanning, startScan, startAuthenticatedScan } = useScanStore();
  const { addScanResult, addCleanupResult } = useHistoryStore();
  const { user } = useAuthStore();
  const { checkScanLimit, checkCleanupLimit, isProUser, formatLimitMessage } = usePlanLimits();
  const { playSound } = useSoundEffect();
  
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [scanLimit, setScanLimit] = useState<any>(null);
  const [cleanupLimit, setCleanupLimit] = useState<any>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  // Progressive scan action
  const scanAction = useProgressiveAction(
    async () => {
      const scanCheck = await checkScanLimit();
      if (!scanCheck.allowed) {
        throw new Error(formatLimitMessage(scanCheck, 'scan'));
      }
      
      notifyScanStarted();
      playSound('scanStart');
      const startTime = Date.now();
      
      // Use authenticated scan if user is logged in
      const scanFunction = user ? startAuthenticatedScan : startScan;
      
      await scanFunction((progress) => {
        setScanProgress(progress.percentage || 0);
        if ((progress.percentage || 0) % 20 === 0) {
          // Update notification every 20%
          playSound('scanProgress');
          window.electron?.showNotification?.(
            t('app.name'),
            t('notifications.scanProgress', { progress: progress.percentage || 0 })
          );
        }
      });
      
      const duration = (Date.now() - startTime) / 1000;
      
      // Save scan to history
      if (scanResults) {
        await addScanResult({
          timestamp: new Date(),
          type: 'smart',
          totalJunkFound: scanResults.totalSpace,
          itemsFound: {
            systemJunk: scanResults.categories.find(c => c.type === 'logs')?.size || 0,
            applicationCaches: scanResults.categories.find(c => c.type === 'cache')?.size || 0,
            downloads: scanResults.categories.find(c => c.type === 'downloads')?.size || 0,
            trashBins: scanResults.categories.find(c => c.type === 'trash')?.size || 0,
          },
          duration,
          status: 'completed',
        });
        
        notifyScanComplete(formatBytes(scanResults.totalSpace));
        playSound('scanComplete');
      }
    },
    {
      simulateProgress: true,
      successMessage: t('scan.complete'),
      errorMessage: t('common.error'),
      onError: () => playSound('error'),
    }
  );

  // Progressive cleanup action
  const cleanupAction = useProgressiveAction(
    async () => {
      const cleanupCheck = await checkCleanupLimit(totalSelectedSize);
      
      if (!cleanupCheck.allowed) {
        throw new Error(formatLimitMessage(cleanupCheck, 'cleanup'));
      }
      
      notifyCleanStarted();
      playSound('cleanStart');
      const startTime = Date.now();
      
      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const duration = (Date.now() - startTime) / 1000;
      
      // Save cleanup to history
      const scanId = 'scan_' + Date.now(); // In real app, use actual scan ID
      await addCleanupResult({
        scanId,
        timestamp: new Date(),
        totalCleaned: totalSelectedSize,
        itemsCleaned: {
          systemJunk: scanResults?.categories.find(c => c.type === 'logs' && selectedCategories.has(c.type))?.size || 0,
          applicationCaches: scanResults?.categories.find(c => c.type === 'cache' && selectedCategories.has(c.type))?.size || 0,
          downloads: scanResults?.categories.find(c => c.type === 'downloads' && selectedCategories.has(c.type))?.size || 0,
          trashBins: scanResults?.categories.find(c => c.type === 'trash' && selectedCategories.has(c.type))?.size || 0,
        },
        duration,
        status: 'completed',
      });
      
      notifyCleanComplete(formatBytes(totalSelectedSize));
      playSound('cleanComplete');
      
      // Reset after cleanup
      setSelectedCategories(new Set());
    },
    {
      simulateProgress: true,
      successMessage: t('scan.cleanComplete'),
      errorMessage: t('common.error'),
      onError: () => playSound('error'),
    }
  );

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    setIsCheckingLimits(true);
    try {
      const scan = await checkScanLimit();
      setScanLimit(scan);
      
      if (scanResults) {
        const cleanup = await checkCleanupLimit(totalSelectedSize);
        setCleanupLimit(cleanup);
      }
    } finally {
      setIsCheckingLimits(false);
    }
  };

  const totalSelectedSize = useMemo(() => {
    if (!scanResults) return 0;
    
    return scanResults.categories
      .filter((cat: ScanCategory) => selectedCategories.has(cat.type))
      .reduce((acc: number, cat: ScanCategory) => acc + cat.size, 0);
  }, [scanResults, selectedCategories]);

  const handleCategoryToggle = (categoryType: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryType)) {
      newSelected.delete(categoryType);
    } else {
      newSelected.add(categoryType);
    }
    setSelectedCategories(newSelected);
  };

  const getSelectedItems = (): ScanItem[] => {
    if (!scanResults) return [];
    
    return scanResults.categories
      .filter((cat: ScanCategory) => selectedCategories.has(cat.type))
      .flatMap((cat: ScanCategory) => cat.items || []);
  };

  const lockedCategories = useMemo(() => {
    if (isProUser) return new Set<string>();
    
    // Free users can only clean cache and trash
    return new Set(['logs', 'downloads', 'applications']);
  }, [isProUser]);

  if (isCheckingLimits) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ProgressBar mode="indeterminate" className="w-64 mb-4" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                <span className="text-gray-900 dark:text-gray-100">{t('scan.smartScan')}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 ml-10 sm:ml-14">
                {t('scan.description')}
              </p>
            </div>
            <Button 
              label={t('common.back')} 
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Scan Limit Indicator */}
          {!isProUser && scanLimit && (
            <Card className="mb-6">
              <LimitIndicator
                type="scan"
                used={scanLimit.used}
                limit={scanLimit.limit}
                onUpgradeClick={() => navigate({ to: '/upgrade' })}
              />
            </Card>
          )}

          {/* Scan Button or Results */}
          {!scanResults ? (
            <Card className="shadow-xl">
              <div className="p-8 sm:p-12 lg:p-16 text-center">
                <motion.div
                  animate={{ rotate: scanAction.isLoading ? 360 : 0 }}
                  transition={{ duration: 2, repeat: scanAction.isLoading ? Infinity : 0, ease: "linear" }}
                  className="inline-flex p-4 sm:p-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-4 sm:mb-6"
                >
                  <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
                </motion.div>
                
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-purple-600">
                  {scanAction.isLoading ? t('scan.scanning') : t('scan.readyToScan')}
                </h2>
                
                {scanAction.isLoading && (
                  <ProgressBar 
                    value={scanAction.progress} 
                    className="w-full sm:w-64 mx-auto mb-4"
                    showValue
                  />
                )}
                
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
                  {t('scan.smartScanDescription')}
                </p>
                
                <Button 
                  label={scanAction.isLoading ? t('scan.scanning') : t('scan.startScan')}
                  icon={scanAction.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-play'}
                  size="large"
                  severity="success"
                  onClick={scanAction.execute}
                  disabled={scanAction.isLoading || (scanLimit && !scanLimit.allowed)}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                />
                
                {scanLimit && !scanLimit.allowed && (
                  <Message 
                    severity="error" 
                    text={formatLimitMessage(scanLimit, 'scan')}
                    className="mt-4 max-w-full sm:max-w-md mx-auto"
                  />
                )}
              </div>
            </Card>
          ) : (
            <>
              {/* Scan Results Summary */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Card className="shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-10">
                    <div className="text-center">
                      <motion.p 
                        className="text-6xl font-bold mb-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        {formatBytes(scanResults.totalSpace)}
                      </motion.p>
                      <p className="text-xl opacity-90">{t('scan.totalJunkFound')}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Categories */}
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">{t('scan.selectItemsToClean')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {scanResults.categories.map((category: ScanCategory, index: number) => (
                    <motion.div
                      key={category.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CategoryCard
                        category={category}
                        isLocked={lockedCategories.has(category.type)}
                        isSelected={selectedCategories.has(category.type)}
                        onToggle={() => handleCategoryToggle(category.type)}
                        onViewDetails={() => console.log('View details for', category.type)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cleanup Action */}
              <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {t('common.selected')}: <span className="text-purple-600">{formatBytes(totalSelectedSize)}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedCategories.size} {t('common.categoriesSelected', { count: selectedCategories.size })}
                      </p>
                    </div>
                    
                    <div className="flex-1 ml-8">
                      {selectedCategories.size > 0 && scanResults && (
                        <CleanButton
                          items={getSelectedItems()}
                          totalSize={totalSelectedSize}
                          onCleanComplete={(freedSpace) => {
                            // Save cleanup to history
                            const scanId = 'scan_' + Date.now();
                            addCleanupResult({
                              scanId,
                              timestamp: new Date(),
                              totalCleaned: freedSpace,
                              itemsCleaned: {
                                systemJunk: scanResults?.categories.find(c => c.type === 'logs' && selectedCategories.has(c.type))?.size || 0,
                                applicationCaches: scanResults?.categories.find(c => c.type === 'cache' && selectedCategories.has(c.type))?.size || 0,
                                downloads: scanResults?.categories.find(c => c.type === 'downloads' && selectedCategories.has(c.type))?.size || 0,
                                trashBins: scanResults?.categories.find(c => c.type === 'trash' && selectedCategories.has(c.type))?.size || 0,
                              },
                              duration: 0,
                              status: 'completed',
                            });
                            
                            notifyCleanComplete(formatBytes(freedSpace));
                            playSound('cleanComplete');
                            
                            // Reset after cleanup
                            setSelectedCategories(new Set());
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pro Features Teaser */}
              {!isProUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="shadow-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="p-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            {t('features.unlockFeatures')}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-2 ml-12">
                            {t('upgrade.features.unlimited')}
                          </p>
                        </div>
                        <Button 
                          label={t('features.upgrade')}
                          icon="pi pi-star"
                          size="large"
                          severity="warning"
                          onClick={() => navigate({ to: '/upgrade' })}
                          className="min-w-[150px]"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}