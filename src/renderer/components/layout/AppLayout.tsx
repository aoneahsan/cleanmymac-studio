import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeArea } from '@renderer/contexts/SafeAreaContext';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { useAuthStore } from '@renderer/stores/authStore';
import { useNavigate } from '@tanstack/react-router';
import { t } from '@renderer/lib/i18n-simple';
import { AnimatedBackground } from '@renderer/components/ui/AnimatedBackground';
import { Footer } from './Footer';

export function AppLayout() {
  const { insets, titlebarHeight, isElectron } = useSafeArea();
  const { user, logout, isProUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: t('dashboard.title'),
      icon: 'pi pi-home',
      command: () => navigate({ to: '/dashboard' }),
    },
    {
      label: t('dashboard.smartScan'),
      icon: 'pi pi-bolt',
      command: () => navigate({ to: '/smart-scan' }),
    },
    {
      label: t('common.history'),
      icon: 'pi pi-history',
      command: () => navigate({ to: '/history' }),
      className: 'menuitem-history',
    },
    {
      label: t('tools.title'),
      icon: 'pi pi-wrench',
      command: () => navigate({ to: '/tools' }),
      className: !isProUser() ? 'opacity-75' : '',
    },
    {
      label: t('settings.title'),
      icon: 'pi pi-cog',
      command: () => navigate({ to: '/settings' }),
    },
  ];

  const end = (
    <div className="flex items-center gap-3">
      {!isProUser() && (
        <Button
          label={t('features.upgrade')}
          icon="pi pi-star"
          severity="warning"
          size="small"
          onClick={() => navigate({ to: '/upgrade' })}
          data-tour="upgrade"
        />
      )}
      <div className="flex items-center gap-2">
        <Avatar 
          label={user?.email?.[0].toUpperCase()} 
          size="normal"
          shape="circle"
          className="bg-purple-500 text-white"
        />
        <span className="text-sm font-medium hidden md:block">
          {user?.email}
        </span>
        {isProUser() && (
          <Badge value="PRO" severity="success" />
        )}
      </div>
      <Button
        icon="pi pi-sign-out"
        severity="secondary"
        text
        onClick={logout}
        tooltip={t('auth.logout')}
        tooltipOptions={{ position: 'bottom' }}
      />
    </div>
  );

  const showFooter = !['/welcome', '/', '/scanning', '/scan-results'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative flex flex-col">
      <AnimatedBackground />
      
      {/* Safe area for titlebar on macOS */}
      {isElectron && (
        <div 
          className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-50"
          style={{ height: titlebarHeight }}
        >
          <div className="titlebar-area" />
        </div>
      )}
      
      {/* Navigation Bar */}
      <div 
        className="fixed left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-40"
        style={{ 
          top: isElectron ? titlebarHeight : 0,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Menubar 
            model={menuItems} 
            end={end}
            className="border-0 bg-transparent px-4"
            pt={{
              menuitem: { 'data-tour': (item: any) => item.label === t('common.history') ? 'history' : undefined }
            }}
          />
        </div>
      </div>

      {/* Main content with safe area padding */}
      <main 
        className="relative flex-1"
        style={{
          paddingTop: isElectron ? titlebarHeight + 60 : 60, // titlebar + navbar height
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* Bottom safe area indicator for devices with home indicator */}
      {insets.bottom > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800"
          style={{ height: insets.bottom }}
        />
      )}
    </div>
  );
}