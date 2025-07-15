import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Chrome, Globe, MessageSquare, FileText, Clock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { formatBytes } from '@renderer/lib/utils';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface BrowserData {
  browser: string;
  icon: React.ReactNode;
  installed: boolean;
  history: {
    count: number;
    size: number;
    lastCleared?: Date;
  };
  cookies: {
    count: number;
    size: number;
  };
  cache: {
    size: number;
  };
  downloads: {
    count: number;
  };
  autofill: {
    count: number;
  };
  passwords: {
    count: number;
  };
}

interface AppPrivacyData {
  app: string;
  icon: React.ReactNode;
  installed: boolean;
  data: {
    messages?: { count: number; size: number };
    attachments?: { count: number; size: number };
    callHistory?: { count: number };
    documents?: { count: number; size: number };
    cache?: { size: number };
  };
}

interface PrivacyItem {
  id: string;
  category: string;
  name: string;
  description: string;
  size?: number;
  count?: number;
  risk: 'low' | 'medium' | 'high';
  selected: boolean;
}

export function PrivacyCleaner() {
  const { playSound } = useSoundEffect();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [browserData, setBrowserData] = useState<BrowserData[]>([]);
  const [appData, setAppData] = useState<AppPrivacyData[]>([]);
  const [privacyItems, setPrivacyItems] = useState<PrivacyItem[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = () => {
    // Mock browser data
    const browsers: BrowserData[] = [
      {
        browser: 'Safari',
        icon: <Globe className="w-6 h-6" />,
        installed: true,
        history: { count: 5234, size: 125 * 1024 * 1024 },
        cookies: { count: 892, size: 45 * 1024 * 1024 },
        cache: { size: 680 * 1024 * 1024 },
        downloads: { count: 234 },
        autofill: { count: 156 },
        passwords: { count: 89 },
      },
      {
        browser: 'Chrome',
        icon: <Chrome className="w-6 h-6" />,
        installed: true,
        history: { count: 8921, size: 234 * 1024 * 1024 },
        cookies: { count: 1567, size: 89 * 1024 * 1024 },
        cache: { size: 1.2 * 1024 * 1024 * 1024 },
        downloads: { count: 456 },
        autofill: { count: 234 },
        passwords: { count: 123 },
      },
      {
        browser: 'Firefox',
        icon: <Globe className="w-6 h-6" />,
        installed: false,
        history: { count: 0, size: 0 },
        cookies: { count: 0, size: 0 },
        cache: { size: 0 },
        downloads: { count: 0 },
        autofill: { count: 0 },
        passwords: { count: 0 },
      },
    ];

    // Mock app data
    const apps: AppPrivacyData[] = [
      {
        app: 'Messages',
        icon: <MessageSquare className="w-6 h-6" />,
        installed: true,
        data: {
          messages: { count: 15234, size: 2.3 * 1024 * 1024 * 1024 },
          attachments: { count: 892, size: 4.5 * 1024 * 1024 * 1024 },
        },
      },
      {
        app: 'Slack',
        icon: <MessageSquare className="w-6 h-6" />,
        installed: true,
        data: {
          messages: { count: 8921, size: 890 * 1024 * 1024 },
          cache: { size: 456 * 1024 * 1024 },
        },
      },
      {
        app: 'Recent Documents',
        icon: <FileText className="w-6 h-6" />,
        installed: true,
        data: {
          documents: { count: 234, size: 0 },
        },
      },
    ];

    // Mock privacy items
    const items: PrivacyItem[] = [
      {
        id: '1',
        category: 'browser',
        name: 'Safari History',
        description: 'Browsing history from Safari',
        count: 5234,
        size: 125 * 1024 * 1024,
        risk: 'medium',
        selected: false,
      },
      {
        id: '2',
        category: 'browser',
        name: 'Chrome Cookies',
        description: 'Cookies stored by Chrome',
        count: 1567,
        size: 89 * 1024 * 1024,
        risk: 'high',
        selected: false,
      },
      {
        id: '3',
        category: 'system',
        name: 'Clipboard History',
        description: 'Recently copied items',
        count: 45,
        risk: 'high',
        selected: false,
      },
      {
        id: '4',
        category: 'system',
        name: 'Terminal History',
        description: 'Command line history',
        count: 892,
        risk: 'medium',
        selected: false,
      },
      {
        id: '5',
        category: 'app',
        name: 'Slack Cache',
        description: 'Cached messages and files',
        size: 456 * 1024 * 1024,
        risk: 'low',
        selected: false,
      },
    ];

    setBrowserData(browsers.filter(b => b.installed));
    setAppData(apps.filter(a => a.installed));
    setPrivacyItems(items);
  };

  const scanForPrivacyData = useProgressiveAction(
    async () => {
      playSound('scanStart');
      
      // Simulate scanning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const totalSize = privacyItems.reduce((sum, item) => sum + (item.size || 0), 0);
      const totalItems = privacyItems.reduce((sum, item) => sum + (item.count || 1), 0);
      
      setScanResults({
        totalSize,
        totalItems,
        highRiskItems: privacyItems.filter(i => i.risk === 'high').length,
        mediumRiskItems: privacyItems.filter(i => i.risk === 'medium').length,
        lowRiskItems: privacyItems.filter(i => i.risk === 'low').length,
      });
      
      playSound('scanComplete');
      showNotification('success', t('privacyCleaner.scanComplete'));
    },
    {
      simulateProgress: true,
      successMessage: t('privacyCleaner.scanComplete'),
      errorMessage: t('common.error'),
    }
  );

  const cleanPrivacyData = useProgressiveAction(
    async () => {
      const itemsToClean = privacyItems.filter(item => item.selected);
      if (itemsToClean.length === 0) return;
      
      playSound('cleanStart');
      
      // Simulate cleaning
      for (const item of itemsToClean) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Reset selected items
      setPrivacyItems(prev => prev.map(item => ({ ...item, selected: false })));
      setShowConfirmDialog(false);
      setScanResults(null);
      
      playSound('cleanComplete');
      showNotification('success', t('privacyCleaner.cleanComplete', { count: itemsToClean.length }));
    },
    {
      simulateProgress: true,
      successMessage: t('privacyCleaner.cleanComplete'),
      errorMessage: t('common.error'),
    }
  );

  const toggleItem = (itemId: string) => {
    setPrivacyItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleCategory = (category: string) => {
    const categoryItems = privacyItems.filter(item => item.category === category);
    const allSelected = categoryItems.every(item => item.selected);
    
    setPrivacyItems(prev => prev.map(item => 
      item.category === category ? { ...item, selected: !allSelected } : item
    ));
  };

  const selectedItems = privacyItems.filter(item => item.selected);
  const selectedSize = selectedItems.reduce((sum, item) => sum + (item.size || 0), 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + (item.count || 1), 0);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Button */}
      {!scanResults && (
        <Card className="shadow-xl">
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: scanForPrivacyData.isLoading ? 360 : 0 }}
              transition={{ duration: 2, repeat: scanForPrivacyData.isLoading ? Infinity : 0, ease: "linear" }}
              className="inline-flex p-6 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 mb-6"
            >
              <Shield className="w-16 h-16 text-green-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-3 text-green-600">
              {scanForPrivacyData.isLoading ? t('privacyCleaner.scanning') : t('privacyCleaner.readyToScan')}
            </h2>
            
            {scanForPrivacyData.isLoading && (
              <ProgressBar 
                value={scanForPrivacyData.progress} 
                className="w-64 mx-auto mb-4"
                showValue
              />
            )}
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('privacyCleaner.description')}
            </p>
            
            <Button 
              label={scanForPrivacyData.isLoading ? t('privacyCleaner.scanning') : t('privacyCleaner.startScan')}
              icon={scanForPrivacyData.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
              size="large"
              severity="success"
              onClick={scanForPrivacyData.execute}
              disabled={scanForPrivacyData.isLoading}
              className="min-w-[200px]"
            />
          </div>
        </Card>
      )}

      {/* Scan Results */}
      {scanResults && (
        <>
          {/* Summary Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Card className="shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 text-white p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-4xl font-bold mb-2">{formatBytes(scanResults.totalSize)}</p>
                    <p className="text-lg opacity-90">{t('privacyCleaner.totalData')}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold mb-2">{scanResults.totalItems.toLocaleString()}</p>
                    <p className="text-lg opacity-90">{t('privacyCleaner.totalItems')}</p>
                  </div>
                  <div>
                    <div className="flex justify-center gap-2 mb-2">
                      <Tag severity="danger" value={scanResults.highRiskItems} />
                      <Tag severity="warning" value={scanResults.mediumRiskItems} />
                      <Tag severity="success" value={scanResults.lowRiskItems} />
                    </div>
                    <p className="text-lg opacity-90">{t('privacyCleaner.riskLevels')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Privacy Items Tabs */}
          <Card className="shadow-xl">
            <TabView>
              <TabPanel header={t('privacyCleaner.browsers')} leftIcon="pi pi-globe">
                <div className="space-y-4">
                  {browserData.map((browser) => (
                    <Card key={browser.browser} className="border">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              {browser.icon}
                            </div>
                            <h3 className="text-lg font-semibold">{browser.browser}</h3>
                          </div>
                          <Button
                            label={t('common.selectAll')}
                            severity="secondary"
                            text
                            onClick={() => toggleCategory(`browser-${browser.browser.toLowerCase()}`)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {browser.history.count > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Checkbox
                                checked={privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('History'))?.selected || false}
                                onChange={() => {
                                  const item = privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('History'));
                                  if (item) toggleItem(item.id);
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{t('privacyCleaner.browsingHistory')}</p>
                                <p className="text-sm text-gray-500">
                                  {browser.history.count} {t('common.items')} • {formatBytes(browser.history.size)}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {browser.cookies.count > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Checkbox
                                checked={privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('Cookies'))?.selected || false}
                                onChange={() => {
                                  const item = privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('Cookies'));
                                  if (item) toggleItem(item.id);
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{t('privacyCleaner.cookies')}</p>
                                <p className="text-sm text-gray-500">
                                  {browser.cookies.count} {t('common.items')} • {formatBytes(browser.cookies.size)}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {browser.cache.size > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Checkbox
                                checked={privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('Cache'))?.selected || false}
                                onChange={() => {
                                  const item = privacyItems.find(i => i.name.includes(browser.browser) && i.name.includes('Cache'));
                                  if (item) toggleItem(item.id);
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{t('privacyCleaner.cache')}</p>
                                <p className="text-sm text-gray-500">{formatBytes(browser.cache.size)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabPanel>

              <TabPanel header={t('privacyCleaner.system')} leftIcon="pi pi-desktop">
                <div className="space-y-3">
                  {privacyItems.filter(item => item.category === 'system').map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Checkbox
                        checked={item.selected}
                        onChange={() => toggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Tag severity={getRiskColor(item.risk)} value={t(`privacyCleaner.risk.${item.risk}`)} />
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        {(item.count || item.size) && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.count && `${item.count} ${t('common.items')}`}
                            {item.count && item.size && ' • '}
                            {item.size && formatBytes(item.size)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabPanel>

              <TabPanel header={t('privacyCleaner.applications')} leftIcon="pi pi-th-large">
                <div className="space-y-4">
                  {appData.map((app) => (
                    <Card key={app.app} className="border">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            {app.icon}
                          </div>
                          <h3 className="text-lg font-semibold">{app.app}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {Object.entries(app.data).map(([key, data]) => (
                            <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Checkbox
                                checked={privacyItems.find(i => i.name.includes(app.app))?.selected || false}
                                onChange={() => {
                                  const item = privacyItems.find(i => i.name.includes(app.app));
                                  if (item) toggleItem(item.id);
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium capitalize">{key}</p>
                                <p className="text-sm text-gray-500">
                                  {'count' in data && data.count && `${data.count} ${t('common.items')}`}
                                  {'count' in data && 'size' in data && data.count && data.size && ' • '}
                                  {'size' in data && data.size && formatBytes(data.size)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabPanel>
            </TabView>
          </Card>

          {/* Clean Action */}
          <Card className="shadow-xl border-2 border-green-200 dark:border-green-800">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {t('common.selected')}: <span className="text-green-600">{selectedCount} {t('common.items')}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('privacyCleaner.totalSize')}: {formatBytes(selectedSize)}
                  </p>
                </div>
                
                <Button
                  label={t('privacyCleaner.cleanNow')}
                  icon="pi pi-trash"
                  size="large"
                  severity="success"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={selectedItems.length === 0}
                />
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header={t('privacyCleaner.confirmClean')}
        className="w-full max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label={t('common.cancel')}
              severity="secondary"
              onClick={() => setShowConfirmDialog(false)}
            />
            <Button
              label={t('privacyCleaner.cleanNow')}
              severity="success"
              icon="pi pi-trash"
              onClick={cleanPrivacyData.execute}
              loading={cleanPrivacyData.isLoading}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                {t('privacyCleaner.cleanWarning')}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {t('privacyCleaner.cleanWarningDesc')}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">{t('privacyCleaner.itemsToClean')}</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-3">
                    {item.risk === 'high' ? <EyeOff className="w-4 h-4 text-red-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag severity={getRiskColor(item.risk)} value={t(`privacyCleaner.risk.${item.risk}`)} />
                    {item.size && <span className="text-sm text-gray-500">{formatBytes(item.size)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {cleanPrivacyData.isLoading && (
            <ProgressBar
              value={cleanPrivacyData.progress}
              showValue
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}