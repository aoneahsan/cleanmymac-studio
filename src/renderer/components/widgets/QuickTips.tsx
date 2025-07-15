import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';

interface Tip {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: 'performance' | 'security' | 'storage' | 'general';
}

const tips: Tip[] = [
  {
    id: '1',
    title: 'tips.emptyTrashRegularly.title',
    description: 'tips.emptyTrashRegularly.description',
    icon: 'pi-trash',
    category: 'storage',
  },
  {
    id: '2',
    title: 'tips.clearBrowserCache.title',
    description: 'tips.clearBrowserCache.description',
    icon: 'pi-globe',
    category: 'performance',
  },
  {
    id: '3',
    title: 'tips.updateApps.title',
    description: 'tips.updateApps.description',
    icon: 'pi-refresh',
    category: 'security',
  },
  {
    id: '4',
    title: 'tips.organizeDesktop.title',
    description: 'tips.organizeDesktop.description',
    icon: 'pi-desktop',
    category: 'performance',
  },
  {
    id: '5',
    title: 'tips.useCloudStorage.title',
    description: 'tips.useCloudStorage.description',
    icon: 'pi-cloud',
    category: 'storage',
  },
  {
    id: '6',
    title: 'tips.removeStartupItems.title',
    description: 'tips.removeStartupItems.description',
    icon: 'pi-power-off',
    category: 'performance',
  },
  {
    id: '7',
    title: 'tips.enableFirewall.title',
    description: 'tips.enableFirewall.description',
    icon: 'pi-shield',
    category: 'security',
  },
  {
    id: '8',
    title: 'tips.archiveOldFiles.title',
    description: 'tips.archiveOldFiles.description',
    icon: 'pi-file-archive',
    category: 'storage',
  },
];

interface QuickTipsProps {
  onClose?: () => void;
  compact?: boolean;
}

export function QuickTips({ onClose, compact = false }: QuickTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const { playSound } = useSoundEffect();

  // Rotate tips automatically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMinimized) {
        handleNextTip();
      }
    }, 10000); // Change tip every 10 seconds

    return () => clearInterval(interval);
  }, [currentTipIndex, isMinimized]);

  const handleNextTip = () => {
    playSound('hover');
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handlePrevTip = () => {
    playSound('hover');
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const currentTip = tips[currentTipIndex];

  const categoryColors = {
    performance: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    security: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    storage: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    general: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <Button
          className="rounded-full w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-lg"
          onClick={() => {
            playSound('click');
            setIsMinimized(false);
          }}
        >
          <Lightbulb className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <Card className="shadow-lg glass overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">{t('tips.quickTip')}</h3>
            </div>
            <div className="flex gap-1">
              <Button
                icon="pi pi-chevron-left"
                severity="secondary"
                text
                rounded
                onClick={handlePrevTip}
              />
              <Button
                icon="pi pi-chevron-right"
                severity="secondary"
                text
                rounded
                onClick={handleNextTip}
              />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-medium mb-1">{t(currentTip.title)}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(currentTip.description)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed bottom-6 left-6 z-40 w-80"
      >
        <Card className="shadow-2xl glass overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold">{t('tips.dailyTips')}</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  icon="pi pi-minus"
                  severity="secondary"
                  text
                  rounded
                  onClick={() => {
                    playSound('click');
                    setIsMinimized(true);
                  }}
                />
                {onClose && (
                  <Button
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    rounded
                    onClick={() => {
                      playSound('click');
                      onClose();
                    }}
                  />
                )}
              </div>
            </div>

            {/* Tip Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  {currentTip.icon && (
                    <div className={`p-2 rounded-lg ${categoryColors[currentTip.category]}`}>
                      <i className={`pi ${currentTip.icon} text-lg`} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t(currentTip.title)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(currentTip.description)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTipIndex
                        ? 'bg-purple-600 w-6'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={() => {
                      playSound('hover');
                      setCurrentTipIndex(index);
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  icon="pi pi-chevron-left"
                  severity="secondary"
                  text
                  rounded
                  onClick={handlePrevTip}
                />
                <Button
                  icon="pi pi-chevron-right"
                  severity="secondary"
                  text
                  rounded
                  onClick={handleNextTip}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}