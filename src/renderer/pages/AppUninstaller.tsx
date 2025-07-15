import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { AppUninstaller as AppUninstallerComponent } from '@renderer/components/features/AppUninstaller';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { useAuthStore } from '@renderer/stores/authStore';
import { t } from '@renderer/lib/i18n-simple';
import { Package } from 'lucide-react';

export function AppUninstaller() {
  const navigate = useNavigate();
  const { isProUser } = useAuthStore();

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {t('cleaners.appUninstaller')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('cleaners.appUninstallerDesc')}
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

        {/* Main Content */}
        <FeatureLock 
          isLocked={!isProUser()} 
          featureName={t('cleaners.appUninstaller')}
        >
          <AppUninstallerComponent />
        </FeatureLock>
      </motion.div>
    </div>
  );
}