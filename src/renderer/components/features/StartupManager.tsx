import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { InputText } from 'primereact/inputtext';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Zap, AlertCircle, Search, Loader2 } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface StartupItem {
  id: string;
  name: string;
  path: string;
  type: 'loginItem' | 'launchAgent' | 'launchDaemon';
  enabled: boolean;
  impact: 'high' | 'medium' | 'low';
  description?: string;
  vendor?: string;
  startupTime?: number; // in ms
}

const MOCK_STARTUP_ITEMS: StartupItem[] = [
  {
    id: '1',
    name: 'Dropbox',
    path: '/Applications/Dropbox.app',
    type: 'loginItem',
    enabled: true,
    impact: 'medium',
    vendor: 'Dropbox Inc.',
    startupTime: 2500,
  },
  {
    id: '2',
    name: 'Spotify',
    path: '/Applications/Spotify.app',
    type: 'loginItem',
    enabled: true,
    impact: 'low',
    vendor: 'Spotify',
    startupTime: 1200,
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    path: '/Library/LaunchAgents/com.adobe.AdobeCreativeCloud.plist',
    type: 'launchAgent',
    enabled: true,
    impact: 'high',
    vendor: 'Adobe Systems',
    startupTime: 4500,
  },
  {
    id: '4',
    name: 'Microsoft Update Assistant',
    path: '/Library/LaunchAgents/com.microsoft.update.agent.plist',
    type: 'launchAgent',
    enabled: true,
    impact: 'medium',
    vendor: 'Microsoft Corporation',
    startupTime: 2000,
  },
  {
    id: '5',
    name: 'Backup Service',
    path: '/Library/LaunchDaemons/com.backblaze.backup.plist',
    type: 'launchDaemon',
    enabled: true,
    impact: 'high',
    vendor: 'Backblaze',
    startupTime: 3500,
  },
];

export function StartupManager() {
  const [items, setItems] = useState<StartupItem[]>(MOCK_STARTUP_ITEMS);
  const [isScanning, setIsScanning] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    // Simulate scanning for startup items
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, []);

  const toggleItem = async (itemId: string) => {
    playSound('click');
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, enabled: !i.enabled } : i
    ));
    
    const action = item.enabled ? 'disabled' : 'enabled';
    showNotification('success', t('features.startup.itemToggled', { 
      name: item.name, 
      action 
    }));
  };

  const removeItem = async (itemId: string) => {
    playSound('delete');
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    setItems(prev => prev.filter(i => i.id !== itemId));
    showNotification('success', t('features.startup.itemRemoved', { name: item.name }));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getTotalStartupTime = () => {
    return items
      .filter(item => item.enabled)
      .reduce((sum, item) => sum + (item.startupTime || 0), 0);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loginItems = filteredItems.filter(item => item.type === 'loginItem');
  const launchAgents = filteredItems.filter(item => item.type === 'launchAgent');
  const launchDaemons = filteredItems.filter(item => item.type === 'launchDaemon');

  const renderItemList = (itemList: StartupItem[]) => (
    <div className="space-y-3">
      <AnimatePresence>
        {itemList.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <InputSwitch
                  checked={item.enabled}
                  onChange={() => toggleItem(item.id)}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{item.name}</h4>
                    <Tag 
                      severity={getImpactColor(item.impact) as any}
                      value={t(`features.startup.${item.impact}`)}
                      className="text-xs"
                    />
                  </div>
                  {item.vendor && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.vendor}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{item.path}</p>
                  {item.startupTime && (
                    <p className="text-xs text-gray-500">
                      {t('features.startup.startupTime')}: {(item.startupTime / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                onClick={() => removeItem(item.id)}
                tooltip={t('features.startup.remove')}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {itemList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('features.startup.noItems')}
        </div>
      )}
    </div>
  );

  if (isScanning) {
    return (
      <Card className="shadow-lg">
        <div className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">{t('features.startup.scanning')}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('features.startup.scanningDesc')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{t('features.startup.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.startup.managedItems', { count: items.length })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.startup.totalStartupTime')}
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {(getTotalStartupTime() / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
          
          {/* Impact Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {items.filter(i => i.impact === 'high' && i.enabled).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.startup.highImpact')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {items.filter(i => i.impact === 'medium' && i.enabled).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.startup.mediumImpact')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {items.filter(i => i.impact === 'low' && i.enabled).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.startup.lowImpact')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Items */}
      <Card className="shadow-lg">
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <span className="p-input-icon-left w-full">
              <Search className="w-5 h-5" />
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search')}
                className="w-full"
              />
            </span>
          </div>

          {/* Tabs */}
          <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
            <TabPanel 
              header={t('features.startup.loginItems')} 
              leftIcon="pi pi-user"
              rightIcon={<Tag value={loginItems.length} />}
            >
              {renderItemList(loginItems)}
            </TabPanel>
            
            <TabPanel 
              header={t('features.startup.launchAgents')} 
              leftIcon="pi pi-cog"
              rightIcon={<Tag value={launchAgents.length} />}
            >
              {renderItemList(launchAgents)}
            </TabPanel>
            
            <TabPanel 
              header={t('features.startup.launchDaemons')} 
              leftIcon="pi pi-server"
              rightIcon={<Tag value={launchDaemons.length} />}
            >
              {renderItemList(launchDaemons)}
            </TabPanel>
          </TabView>
        </div>
      </Card>

      {/* Info Message */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {t('features.startup.infoMessage')}
          </p>
        </div>
      </div>
    </div>
  );
}