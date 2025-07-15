import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuthStore } from '@renderer/stores/authStore';
import { t } from '@renderer/lib/i18n-simple';

interface OnboardingTourProps {
  onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { user, isProUser } = useAuthStore();

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenTour) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.75,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: 'driverjs-theme',
      onDestroyStarted: () => {
        driverObj.destroy();
        localStorage.setItem('hasSeenOnboarding', 'true');
        onComplete?.();
      },
      steps: [
        {
          element: '.onboarding-welcome',
          popover: {
            title: t('onboarding.welcome.title'),
            description: t('onboarding.welcome.description', { name: user?.email?.split('@')[0] || 'User' }),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="smart-scan"]',
          popover: {
            title: t('onboarding.smartScan.title'),
            description: t('onboarding.smartScan.description'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="stats"]',
          popover: {
            title: t('onboarding.stats.title'),
            description: t('onboarding.stats.description'),
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="quick-actions"]',
          popover: {
            title: t('onboarding.quickActions.title'),
            description: t('onboarding.quickActions.description'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="history"]',
          popover: {
            title: t('onboarding.history.title'),
            description: t('onboarding.history.description'),
            side: 'bottom',
            align: 'center',
          },
        },
        !isProUser() && {
          element: '[data-tour="upgrade"]',
          popover: {
            title: t('onboarding.upgrade.title'),
            description: t('onboarding.upgrade.description'),
            side: 'left',
            align: 'center',
          },
        },
      ].filter(Boolean) as any,
    });

    // Start the tour after a small delay
    setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => {
      driverObj.destroy();
    };
  }, [user, isProUser, onComplete]);

  return null;
}