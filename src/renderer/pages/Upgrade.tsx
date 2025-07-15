import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { Check, X, Crown } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';

export function Upgrade() {
  const navigate = useNavigate();

  const features = {
    free: [
      { name: t('upgrade.features.unlimitedScans'), included: false },
      { name: t('upgrade.features.autoCleanup'), included: false },
      { name: t('upgrade.features.scheduledScans'), included: false },
      { name: t('upgrade.features.advancedTools'), included: false },
      { name: t('upgrade.features.prioritySupport'), included: false },
      { name: t('upgrade.features.noAds'), included: false },
    ],
    pro: [
      { name: t('upgrade.features.unlimitedScans'), included: true },
      { name: t('upgrade.features.autoCleanup'), included: true },
      { name: t('upgrade.features.scheduledScans'), included: true },
      { name: t('upgrade.features.advancedTools'), included: true },
      { name: t('upgrade.features.prioritySupport'), included: true },
      { name: t('upgrade.features.noAds'), included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t('upgrade.title')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('upgrade.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{t('upgrade.free')}</h2>
                <p className="text-4xl font-bold">$0</p>
                <p className="text-gray-600 dark:text-gray-400">Forever</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <X className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 line-through">{feature.name}</span>
                  </div>
                ))}
              </div>
              
              <Button
                label={t('upgrade.currentPlan')}
                severity="secondary"
                className="w-full"
                disabled
              />
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-2 border-purple-500 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-6 py-2 rounded-bl-lg">
                {t('upgrade.pricing.mostPopular')}
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{t('upgrade.pro')}</h2>
                <p className="text-4xl font-bold">$9.99</p>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {features.pro.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
              
              <Button
                label={t('upgrade.cta.upgradePow')}
                severity="success"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 border-0"
                onClick={() => {
                  // Handle upgrade logic
                }}
              />
            </Card>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <Button
              label={t('common.back')}
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={() => navigate({ to: '/dashboard' })}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}