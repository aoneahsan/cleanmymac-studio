import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { motion } from 'framer-motion';
import { DuplicateFinder } from '@renderer/components/features/DuplicateFinder';
import { MemoryOptimizer } from '@renderer/components/features/MemoryOptimizer';
import { SecureShredder } from '@renderer/components/features/SecureShredder';
import { StartupManager } from '@renderer/components/features/StartupManager';
import { BatteryMonitor } from '@renderer/components/features/BatteryMonitor';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { useAuthStore } from '@renderer/stores/authStore';
import { t } from '@renderer/lib/i18n-simple';
import { Wrench, Copy, Zap, HardDrive, Shield, Activity } from 'lucide-react';

export function Tools() {
  const navigate = useNavigate();
  const { isProUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t('tools.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('tools.description')}
              </p>
            </div>
          </div>
          <Button 
            label={t('common.back')} 
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate({ to: '/dashboard' })}
          />
        </div>

        {/* Tools Tabs */}
        <Card className="shadow-xl">
          <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
            {/* Duplicate Finder Tab */}
            <TabPanel header={t('tools.duplicateFinder')} leftIcon="pi pi-copy">
              <FeatureLock 
                isLocked={!isProUser()} 
                featureName={t('tools.duplicateFinder')}
              >
                <DuplicateFinder />
              </FeatureLock>
            </TabPanel>

            {/* Memory Optimizer Tab */}
            <TabPanel header={t('tools.memoryOptimizer')} leftIcon="pi pi-bolt">
              <FeatureLock 
                isLocked={!isProUser()} 
                featureName={t('tools.memoryOptimizer')}
              >
                <MemoryOptimizer />
              </FeatureLock>
            </TabPanel>

            {/* Startup Manager Tab */}
            <TabPanel header={t('tools.startupManager')} leftIcon="pi pi-power-off">
              <FeatureLock 
                isLocked={!isProUser()} 
                featureName={t('tools.startupManager')}
              >
                <StartupManager />
              </FeatureLock>
            </TabPanel>

            {/* Secure Shredder Tab */}
            <TabPanel header={t('tools.secureShredder')} leftIcon="pi pi-shield">
              <FeatureLock 
                isLocked={!isProUser()} 
                featureName={t('tools.secureShredder')}
              >
                <SecureShredder />
              </FeatureLock>
            </TabPanel>

            {/* Battery Monitor Tab */}
            <TabPanel header={t('tools.batteryMonitor')} leftIcon="pi pi-bolt">
              <FeatureLock 
                isLocked={!isProUser()} 
                featureName={t('tools.batteryMonitor')}
              >
                <BatteryMonitor />
              </FeatureLock>
            </TabPanel>
          </TabView>
        </Card>
      </motion.div>
    </div>
  );
}


