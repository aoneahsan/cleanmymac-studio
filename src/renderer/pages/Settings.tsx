import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { ColorPicker } from 'primereact/colorpicker';
import { Slider } from 'primereact/slider';
import { TabView, TabPanel } from 'primereact/tabview';
import { motion } from 'framer-motion';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@renderer/lib/i18n-simple';
import { useNotificationStore } from '@renderer/lib/notifications';
import { useAuthStore } from '@renderer/stores/authStore';
import { t } from '@renderer/lib/i18n-simple';
import { useKeyboardShortcuts } from '@renderer/hooks/useKeyboardShortcuts';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { Palette, Bell, Globe, Shield, Keyboard, Download, Volume2 } from 'lucide-react';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  particlesEnabled: boolean;
  animationSpeed: number;
}

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { scanNotifications, promotionalNotifications, setScanNotifications, setPromotionalNotifications } = useNotificationStore();
  const { isMac } = useKeyboardShortcuts();
  const { settings: soundSettings, setEnabled: setSoundEnabled, setVolume: setSoundVolume, playSound } = useSoundEffect();
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: 'system',
    primaryColor: '#9333ea',
    accentColor: '#ec4899',
    particlesEnabled: true,
    animationSpeed: 1,
  });

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Load saved theme settings
    const savedTheme = localStorage.getItem('theme-settings');
    if (savedTheme) {
      setThemeSettings(JSON.parse(savedTheme));
    }
  }, []);

  const saveThemeSettings = (newSettings: ThemeSettings) => {
    setThemeSettings(newSettings);
    localStorage.setItem('theme-settings', JSON.stringify(newSettings));
    
    // Apply theme changes
    if (newSettings.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newSettings.mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    // Apply custom colors
    document.documentElement.style.setProperty('--primary-color', newSettings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', newSettings.accentColor);
  };

  const themeOptions = [
    { label: t('settings.light'), value: 'light', icon: 'pi pi-sun' },
    { label: t('settings.dark'), value: 'dark', icon: 'pi pi-moon' },
    { label: t('settings.system'), value: 'system', icon: 'pi pi-desktop' },
  ];

  const languageOptions = Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
    label: `${lang.flag} ${lang.name}`,
    value: code,
  }));

  const exportData = async () => {
    // Simulate exporting data
    const data = {
      user: user?.email,
      scans: [],
      cleanups: [],
      stats: {},
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleanmymac-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('settings.description')}
            </p>
          </div>
          <Button 
            label={t('common.back')} 
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate({ to: '/dashboard' })}
          />
        </div>

        {/* Settings Tabs */}
        <Card className="shadow-xl">
          <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
            {/* Appearance Tab */}
            <TabPanel header={t('settings.appearance')} leftIcon="pi pi-palette">
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    {t('settings.theme')}
                  </h3>
                  <Dropdown
                    value={themeSettings.mode}
                    options={themeOptions}
                    onChange={(e) => saveThemeSettings({ ...themeSettings, mode: e.value })}
                    className="w-full md:w-64"
                    optionLabel="label"
                    placeholder={t('settings.selectTheme')}
                  />
                </div>

                {/* Colors */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('settings.colors')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('settings.primaryColor')}
                      </label>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          value={themeSettings.primaryColor}
                          onChange={(e) => saveThemeSettings({ ...themeSettings, primaryColor: `#${e.value}` })}
                        />
                        <span className="font-mono text-sm">{themeSettings.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('settings.accentColor')}
                      </label>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          value={themeSettings.accentColor}
                          onChange={(e) => saveThemeSettings({ ...themeSettings, accentColor: `#${e.value}` })}
                        />
                        <span className="font-mono text-sm">{themeSettings.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animation Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('settings.animations')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label>{t('settings.enableParticles')}</label>
                      <InputSwitch
                        checked={themeSettings.particlesEnabled}
                        onChange={(e) => saveThemeSettings({ ...themeSettings, particlesEnabled: e.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('settings.animationSpeed')} ({themeSettings.animationSpeed}x)
                      </label>
                      <Slider
                        value={themeSettings.animationSpeed}
                        onChange={(e) => saveThemeSettings({ ...themeSettings, animationSpeed: e.value as number })}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Sound Effects */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    {t('settings.soundEffects')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label>{t('settings.enableSounds')}</label>
                      <InputSwitch
                        checked={soundSettings.enabled}
                        onChange={(e) => {
                          setSoundEnabled(e.value);
                          if (e.value) playSound('success');
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('settings.volume')} ({Math.round(soundSettings.volume * 100)}%)
                      </label>
                      <Slider
                        value={soundSettings.volume}
                        onChange={(e) => setSoundVolume(e.value as number)}
                        onSlideEnd={() => playSound('click')}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                        disabled={!soundSettings.enabled}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        label={t('settings.testSound')}
                        icon="pi pi-play"
                        size="small"
                        severity="secondary"
                        onClick={() => playSound('notification')}
                        disabled={!soundSettings.enabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Language Tab */}
            <TabPanel header={t('settings.language')} leftIcon="pi pi-globe">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t('settings.selectLanguage')}
                  </h3>
                  <Dropdown
                    value={currentLanguage}
                    options={languageOptions}
                    onChange={(e) => setLanguage(e.value)}
                    className="w-full md:w-64"
                    optionLabel="label"
                    filter
                    filterPlaceholder={t('common.search')}
                  />
                </div>
              </div>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel header={t('settings.notifications')} leftIcon="pi pi-bell">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('settings.notificationPreferences')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.scanNotifications')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.scanNotificationsDesc')}
                      </p>
                    </div>
                    <InputSwitch
                      checked={scanNotifications}
                      onChange={(e) => setScanNotifications(e.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.promotionalNotifications')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.promotionalNotificationsDesc')}
                      </p>
                    </div>
                    <InputSwitch
                      checked={promotionalNotifications}
                      onChange={(e) => setPromotionalNotifications(e.value)}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Privacy Tab */}
            <TabPanel header={t('settings.privacy')} leftIcon="pi pi-shield">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('settings.privacySettings')}
                </h3>
                <div className="space-y-4">
                  <Card className="bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-2">{t('settings.dataCollection')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('settings.dataCollectionDesc')}
                    </p>
                    <Button
                      label={t('settings.manageData')}
                      icon="pi pi-cog"
                      severity="secondary"
                      size="small"
                    />
                  </Card>
                  <Card className="bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-2">{t('settings.exportData')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('settings.exportDataDesc')}
                    </p>
                    <Button
                      label={t('settings.exportNow')}
                      icon="pi pi-download"
                      severity="info"
                      size="small"
                      onClick={exportData}
                    />
                  </Card>
                </div>
              </div>
            </TabPanel>

            {/* Shortcuts Tab */}
            <TabPanel header={t('settings.shortcuts')} leftIcon="pi pi-code">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  {t('settings.keyboardShortcuts')}
                </h3>
                <div className="space-y-2">
                  {[
                    { keys: [isMac ? '⌘' : 'Ctrl', 'S'], action: t('shortcuts.smartScan') },
                    { keys: [isMac ? '⌘' : 'Ctrl', 'H'], action: t('shortcuts.viewHistory') },
                    { keys: [isMac ? '⌘' : 'Ctrl', ','], action: t('shortcuts.openSettings') },
                    { keys: [isMac ? '⌘' : 'Ctrl', 'Q'], action: t('shortcuts.quit') },
                    { keys: [isMac ? '⌘' : 'Ctrl', 'R'], action: t('shortcuts.refresh') },
                    { keys: [isMac ? '⌘' : 'Ctrl', 'D'], action: t('shortcuts.dashboard') },
                    { keys: ['/'], action: t('shortcuts.focusSearch') },
                    { keys: ['Esc'], action: t('shortcuts.closeModal') },
                  ].map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, j) => (
                          <kbd key={j} className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>
          </TabView>
        </Card>

        {/* Account Section */}
        <Card className="shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('settings.account')}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.memberSince', { date: user?.createdAt?.toLocaleDateString() })}
                </p>
              </div>
              <Button
                label={t('auth.logout')}
                icon="pi pi-sign-out"
                severity="danger"
                outlined
                onClick={logout}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}