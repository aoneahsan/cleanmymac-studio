import React, { useState, useEffect } from 'react';
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
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { useScanStore } from '@renderer/stores/scanStore';
import { useHistoryStore } from '@renderer/stores/historyStore';
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

function CategoryCard({ category, isLocked, isSelected, onToggle, onViewDetails }: CategoryCardProps) {
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
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={isSelected} 
                  onChange={() => !isLocked && onToggle()}
                  disabled={isLocked}
                />
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{categoryNames[category.type] || category.name}</h3>
              </div>
              <Tag severity="info" className="font-mono">{formatBytes(category.size)}</Tag>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.items.length} {t('common.items', { count: category.items.length })}
              </p>
              <Button 
                label={t('common.viewDetails')}
                severity="secondary"
                text
                onClick={onViewDetails}
                disabled={isLocked}
                className="w-full"
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </FeatureLock>
  );
}

export function SmartScan() {
  const navigate = useNavigate();
  const { scanResults, isScanning, startScan } = useScanStore();
  const { addScanResult, addCleanupResult } = useHistoryStore();
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
      
      await startScan((progress) => {
        setScanProgress(progress);
        if (progress % 20 === 0) {
          // Update notification every 20%
          playSound('scanProgress');
          window.electron?.showNotification({
            title: t('app.name'),
            body: t('notifications.scanProgress', { progress }),
          });
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
      const selectedSize = getTotalSelectedSize();
      const cleanupCheck = await checkCleanupLimit(selectedSize);
      
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
        totalCleaned: selectedSize,
        itemsCleaned: {
          systemJunk: scanResults?.categories.find(c => c.type === 'logs' && selectedCategories.has(c.type))?.size || 0,
          applicationCaches: scanResults?.categories.find(c => c.type === 'cache' && selectedCategories.has(c.type))?.size || 0,
          downloads: scanResults?.categories.find(c => c.type === 'downloads' && selectedCategories.has(c.type))?.size || 0,
          trashBins: scanResults?.categories.find(c => c.type === 'trash' && selectedCategories.has(c.type))?.size || 0,
        },
        duration,
        status: 'completed',
      });
      
      notifyCleanComplete(formatBytes(selectedSize));
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
        const cleanup = await checkCleanupLimit(getTotalSelectedSize());
        setCleanupLimit(cleanup);
      }
    } finally {
      setIsCheckingLimits(false);
    }
  };

  const getTotalSelectedSize = () => {
    if (!scanResults) return 0;
    
    return scanResults.categories
      .filter((cat: ScanCategory) => selectedCategories.has(cat.type))
      .reduce((acc: number, cat: ScanCategory) => acc + cat.size, 0);
  };

  const handleCategoryToggle = (categoryType: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryType)) {
      newSelected.delete(categoryType);
    } else {
      newSelected.add(categoryType);
    }
    setSelectedCategories(newSelected);
  };

  const getLockedCategories = () => {
    if (isProUser) return new Set<string>();
    
    // Free users can only clean cache and trash
    return new Set(['logs', 'downloads', 'applications']);
  };

  const lockedCategories = getLockedCategories();

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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Zap className="w-10 h-10 text-purple-600" />
                <span className="text-gray-900 dark:text-gray-100">{t('scan.smartScan')}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                {t('scan.description')}
              </p>
            </div>
            <Button 
              label={t('common.back')} 
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={() => navigate({ to: '/dashboard' })}
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
              <div className="p-16 text-center">
                <motion.div
                  animate={{ rotate: scanAction.isLoading ? 360 : 0 }}
                  transition={{ duration: 2, repeat: scanAction.isLoading ? Infinity : 0, ease: "linear" }}
                  className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-6"
                >
                  <Zap className="w-16 h-16 text-purple-600" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-3 text-purple-600">
                  {scanAction.isLoading ? t('scan.scanning') : t('scan.readyToScan')}
                </h2>
                
                {scanAction.isLoading && (
                  <ProgressBar 
                    value={scanAction.progress} 
                    className="w-64 mx-auto mb-4"
                    showValue
                  />
                )}
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {t('scan.smartScanDescription')}
                </p>
                
                <Button 
                  label={scanAction.isLoading ? t('scan.scanning') : t('scan.startScan')}
                  icon={scanAction.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-play'}
                  size="large"
                  severity="success"
                  onClick={scanAction.execute}
                  disabled={scanAction.isLoading || (scanLimit && !scanLimit.allowed)}
                  className="min-w-[200px]"
                />
                
                {scanLimit && !scanLimit.allowed && (
                  <Message 
                    severity="error" 
                    text={formatLimitMessage(scanLimit, 'scan')}
                    className="mt-4 max-w-md mx-auto"
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
                <h2 className="text-xl font-semibold">{t('scan.selectItemsToClean')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {t('common.selected')}: <span className="text-purple-600">{formatBytes(getTotalSelectedSize())}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedCategories.size} {t('common.categoriesSelected', { count: selectedCategories.size })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {!isProUser && cleanupLimit && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {t('common.monthlyLimit')}: {formatBytes(cleanupLimit.remaining || 0)} {t('common.remaining')}
                          </p>
                        </div>
                      )}
                      
                      <Button
                        label={cleanupAction.isLoading ? t('scan.cleaning') : t('scan.clean')}
                        icon={cleanupAction.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
                        size="large"
                        severity="danger"
                        onClick={cleanupAction.execute}
                        disabled={selectedCategories.size === 0 || cleanupAction.isLoading || (cleanupLimit && !cleanupLimit.allowed)}
                      />
                    </div>
                  </div>
                  
                  {cleanupAction.isLoading && (
                    <ProgressBar 
                      value={cleanupAction.progress} 
                      className="mt-4"
                      showValue
                    />
                  )}
                  
                  {cleanupLimit && !cleanupLimit.allowed && (
                    <Message 
                      severity="error" 
                      text={formatLimitMessage(cleanupLimit, 'cleanup')}
                      className="mt-4"
                    />
                  )}
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