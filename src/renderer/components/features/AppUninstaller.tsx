import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Trash2, AlertTriangle, CheckCircle, FileText, Settings, Download } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { formatBytes } from '@renderer/lib/utils';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface AppInfo {
  id: string;
  name: string;
  version: string;
  size: number;
  installDate: Date;
  lastUsed: Date;
  path: string;
  icon?: string;
  category: string;
  isSystemApp: boolean;
  associatedFiles: {
    preferences: string[];
    caches: string[];
    logs: string[];
    applicationSupport: string[];
    savedState: string[];
    launchAgents: string[];
    other: string[];
  };
  totalSize: number;
}

interface UninstallOptions {
  removePreferences: boolean;
  removeCaches: boolean;
  removeLogs: boolean;
  removeApplicationSupport: boolean;
  removeSavedState: boolean;
  removeLaunchAgents: boolean;
  createBackup: boolean;
}

export function AppUninstaller() {
  const { playSound } = useSoundEffect();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppInfo[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSystemApps, setShowSystemApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);
  const [uninstallOptions, setUninstallOptions] = useState<UninstallOptions>({
    removePreferences: true,
    removeCaches: true,
    removeLogs: true,
    removeApplicationSupport: true,
    removeSavedState: true,
    removeLaunchAgents: true,
    createBackup: false,
  });
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'lastUsed'>('name');

  // Load apps on mount
  useEffect(() => {
    loadApplications();
  }, []);

  // Filter apps based on search and system app toggle
  useEffect(() => {
    let filtered = apps;
    
    if (!showSystemApps) {
      filtered = filtered.filter(app => !app.isSystemApp);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort apps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.totalSize - a.totalSize;
        case 'lastUsed':
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        default:
          return 0;
      }
    });
    
    setFilteredApps(filtered);
  }, [apps, searchQuery, showSystemApps, sortBy]);

  const loadApplications = async () => {
    // Simulated app data
    const mockApps: AppInfo[] = [
      {
        id: '1',
        name: 'Adobe Photoshop',
        version: '2024.0.0',
        size: 2.5 * 1024 * 1024 * 1024,
        installDate: new Date('2024-01-15'),
        lastUsed: new Date('2025-01-10'),
        path: '/Applications/Adobe Photoshop 2024.app',
        category: 'Graphics & Design',
        isSystemApp: false,
        associatedFiles: {
          preferences: [
            '~/Library/Preferences/com.adobe.Photoshop.plist',
            '~/Library/Preferences/Adobe Photoshop 2024 Settings',
          ],
          caches: [
            '~/Library/Caches/Adobe/Adobe Photoshop 2024',
            '~/Library/Caches/com.adobe.Photoshop',
          ],
          logs: [
            '~/Library/Logs/Adobe/Adobe Photoshop 2024',
          ],
          applicationSupport: [
            '~/Library/Application Support/Adobe/Adobe Photoshop 2024',
          ],
          savedState: [
            '~/Library/Saved Application State/com.adobe.Photoshop.savedState',
          ],
          launchAgents: [],
          other: [],
        },
        totalSize: 3.2 * 1024 * 1024 * 1024,
      },
      {
        id: '2',
        name: 'Slack',
        version: '4.36.134',
        size: 180 * 1024 * 1024,
        installDate: new Date('2023-06-20'),
        lastUsed: new Date('2025-01-15'),
        path: '/Applications/Slack.app',
        category: 'Productivity',
        isSystemApp: false,
        associatedFiles: {
          preferences: [
            '~/Library/Preferences/com.tinyspeck.slackmacgap.plist',
          ],
          caches: [
            '~/Library/Caches/com.tinyspeck.slackmacgap',
          ],
          logs: [
            '~/Library/Logs/Slack',
          ],
          applicationSupport: [
            '~/Library/Application Support/Slack',
          ],
          savedState: [
            '~/Library/Saved Application State/com.tinyspeck.slackmacgap.savedState',
          ],
          launchAgents: [
            '~/Library/LaunchAgents/com.tinyspeck.slackmacgap.ShipIt.plist',
          ],
          other: [],
        },
        totalSize: 520 * 1024 * 1024,
      },
      {
        id: '3',
        name: 'Chess',
        version: '3.18',
        size: 45 * 1024 * 1024,
        installDate: new Date('2023-01-01'),
        lastUsed: new Date('2024-12-01'),
        path: '/Applications/Chess.app',
        category: 'Games',
        isSystemApp: true,
        associatedFiles: {
          preferences: [
            '~/Library/Preferences/com.apple.Chess.plist',
          ],
          caches: [],
          logs: [],
          applicationSupport: [],
          savedState: [
            '~/Library/Saved Application State/com.apple.Chess.savedState',
          ],
          launchAgents: [],
          other: [],
        },
        totalSize: 48 * 1024 * 1024,
      },
    ];
    
    setApps(mockApps);
  };

  const scanForApps = useProgressiveAction(
    async () => {
      playSound('scanStart');
      
      // Simulate scanning for new apps
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, would scan /Applications and ~/Applications
      await loadApplications();
      
      playSound('scanComplete');
      showNotification('success', t('appUninstaller.scanComplete'));
    },
    {
      simulateProgress: true,
      successMessage: t('appUninstaller.scanComplete'),
      errorMessage: t('common.error'),
    }
  );

  const uninstallApps = useProgressiveAction(
    async () => {
      const appsToUninstall = apps.filter(app => selectedApps.has(app.id));
      if (appsToUninstall.length === 0) return;
      
      playSound('cleanStart');
      
      for (const app of appsToUninstall) {
        // Simulate uninstall process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation:
        // 1. Create backup if requested
        // 2. Remove app bundle
        // 3. Remove associated files based on options
        // 4. Update system caches
      }
      
      // Remove uninstalled apps from list
      setApps(prev => prev.filter(app => !selectedApps.has(app.id)));
      setSelectedApps(new Set());
      setShowUninstallDialog(false);
      
      playSound('cleanComplete');
      showNotification('success', t('appUninstaller.uninstallComplete', { count: appsToUninstall.length }));
    },
    {
      simulateProgress: true,
      successMessage: t('appUninstaller.uninstallComplete'),
      errorMessage: t('common.error'),
    }
  );

  const calculateSelectedSize = () => {
    return apps
      .filter(app => selectedApps.has(app.id))
      .reduce((sum, app) => sum + app.totalSize, 0);
  };

  const toggleApp = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const toggleAllApps = () => {
    if (selectedApps.size === filteredApps.filter(app => !app.isSystemApp).length) {
      setSelectedApps(new Set());
    } else {
      const newSelected = new Set(
        filteredApps.filter(app => !app.isSystemApp).map(app => app.id)
      );
      setSelectedApps(newSelected);
    }
  };

  const nameBodyTemplate = (app: AppInfo) => {
    return (
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Package className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <div className="font-semibold">{app.name}</div>
          <div className="text-sm text-gray-500">v{app.version}</div>
        </div>
      </div>
    );
  };

  const sizeBodyTemplate = (app: AppInfo) => {
    return (
      <div>
        <div className="font-mono">{formatBytes(app.totalSize)}</div>
        <div className="text-sm text-gray-500">
          {t('appUninstaller.appSize')}: {formatBytes(app.size)}
        </div>
      </div>
    );
  };

  const categoryBodyTemplate = (app: AppInfo) => {
    return (
      <Tag 
        value={app.category} 
        severity={app.isSystemApp ? 'warning' : 'info'}
      />
    );
  };

  const actionBodyTemplate = (app: AppInfo) => {
    return (
      <div className="flex items-center gap-2">
        <Button
          icon="pi pi-info-circle"
          severity="secondary"
          text
          onClick={() => {
            setSelectedApp(app);
            setShowDetails(true);
          }}
          tooltip={t('common.viewDetails')}
        />
        <Checkbox
          checked={selectedApps.has(app.id)}
          onChange={() => toggleApp(app.id)}
          disabled={app.isSystemApp}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
              <span className="p-input-icon-left w-full sm:w-auto">
                <Search className="w-5 h-5" />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('appUninstaller.searchApps')}
                  className="w-full sm:w-80"
                />
              </span>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="showSystem"
                  checked={showSystemApps}
                  onChange={(e) => setShowSystemApps(e.checked || false)}
                />
                <label htmlFor="showSystem" className="cursor-pointer">
                  {t('appUninstaller.showSystemApps')}
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                label={t('appUninstaller.rescan')}
                icon="pi pi-refresh"
                severity="secondary"
                onClick={scanForApps.execute}
                loading={scanForApps.isLoading}
              />
              <Button
                label={t('appUninstaller.uninstall')}
                icon="pi pi-trash"
                severity="danger"
                onClick={() => setShowUninstallDialog(true)}
                disabled={selectedApps.size === 0}
                badge={selectedApps.size > 0 ? selectedApps.size.toString() : undefined}
              />
            </div>
          </div>
          
          {scanForApps.isLoading && (
            <ProgressBar
              value={scanForApps.progress}
              className="mt-4"
              showValue
            />
          )}
        </div>
      </Card>

      {/* Apps Table */}
      <Card>
        <DataTable
          value={filteredApps}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 50]}
          className="p-datatable-striped"
          emptyMessage={t('appUninstaller.noAppsFound')}
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {t('appUninstaller.installedApps')} ({filteredApps.length})
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {t('appUninstaller.selectedSize')}: {formatBytes(calculateSelectedSize())}
                </span>
                <Button
                  label={selectedApps.size === filteredApps.filter(app => !app.isSystemApp).length 
                    ? t('common.deselectAll') 
                    : t('common.selectAll')}
                  severity="secondary"
                  text
                  onClick={toggleAllApps}
                />
              </div>
            </div>
          }
        >
          <Column 
            field="name" 
            header={t('appUninstaller.name')} 
            body={nameBodyTemplate}
            sortable
          />
          <Column 
            field="category" 
            header={t('appUninstaller.category')} 
            body={categoryBodyTemplate}
            sortable
          />
          <Column 
            field="totalSize" 
            header={t('appUninstaller.totalSize')} 
            body={sizeBodyTemplate}
            sortable
          />
          <Column 
            field="lastUsed" 
            header={t('appUninstaller.lastUsed')} 
            body={(app) => app.lastUsed.toLocaleDateString()}
            sortable
          />
          <Column 
            header={t('common.actions')} 
            body={actionBodyTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </Card>

      {/* App Details Dialog */}
      <Dialog
        visible={showDetails}
        onHide={() => setShowDetails(false)}
        header={selectedApp?.name}
        className="w-full max-w-3xl"
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">{t('appUninstaller.appInfo')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.version')}:</span>
                    <span>{selectedApp.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.category')}:</span>
                    <span>{selectedApp.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.installed')}:</span>
                    <span>{selectedApp.installDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.path')}:</span>
                    <span className="font-mono text-xs truncate" title={selectedApp.path}>
                      {selectedApp.path}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('appUninstaller.storageInfo')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.appSize')}:</span>
                    <span>{formatBytes(selectedApp.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('appUninstaller.dataSize')}:</span>
                    <span>{formatBytes(selectedApp.totalSize - selectedApp.size)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{t('appUninstaller.totalSize')}:</span>
                    <span>{formatBytes(selectedApp.totalSize)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t('appUninstaller.associatedFiles')}</h4>
              <div className="space-y-2">
                {Object.entries(selectedApp.associatedFiles).map(([type, files]) => (
                  files.length > 0 && (
                    <div key={type} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium capitalize">{type}</span>
                        <Tag value={`${files.length} files`} severity="info" />
                      </div>
                      <div className="space-y-1">
                        {files.map((file, index) => (
                          <div key={index} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Uninstall Confirmation Dialog */}
      <Dialog
        visible={showUninstallDialog}
        onHide={() => setShowUninstallDialog(false)}
        header={t('appUninstaller.confirmUninstall')}
        className="w-full max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label={t('common.cancel')}
              severity="secondary"
              onClick={() => setShowUninstallDialog(false)}
            />
            <Button
              label={t('appUninstaller.uninstallNow')}
              severity="danger"
              icon="pi pi-trash"
              onClick={uninstallApps.execute}
              loading={uninstallApps.isLoading}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                {t('appUninstaller.uninstallWarning')}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {t('appUninstaller.uninstallWarningDesc', { count: selectedApps.size })}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">{t('appUninstaller.uninstallOptions')}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="removePrefs"
                  checked={uninstallOptions.removePreferences}
                  onChange={(e) => setUninstallOptions(prev => ({ ...prev, removePreferences: e.checked || false }))}
                />
                <label htmlFor="removePrefs" className="cursor-pointer">
                  {t('appUninstaller.removePreferences')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="removeCaches"
                  checked={uninstallOptions.removeCaches}
                  onChange={(e) => setUninstallOptions(prev => ({ ...prev, removeCaches: e.checked || false }))}
                />
                <label htmlFor="removeCaches" className="cursor-pointer">
                  {t('appUninstaller.removeCaches')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="removeLogs"
                  checked={uninstallOptions.removeLogs}
                  onChange={(e) => setUninstallOptions(prev => ({ ...prev, removeLogs: e.checked || false }))}
                />
                <label htmlFor="removeLogs" className="cursor-pointer">
                  {t('appUninstaller.removeLogs')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="backup"
                  checked={uninstallOptions.createBackup}
                  onChange={(e) => setUninstallOptions(prev => ({ ...prev, createBackup: e.checked || false }))}
                />
                <label htmlFor="backup" className="cursor-pointer">
                  {t('appUninstaller.createBackup')}
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">{t('appUninstaller.appsToUninstall')}</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {apps
                .filter(app => selectedApps.has(app.id))
                .map(app => (
                  <div key={app.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>{app.name}</span>
                    <span className="text-sm text-gray-500">{formatBytes(app.totalSize)}</span>
                  </div>
                ))}
            </div>
          </div>
          
          {uninstallApps.isLoading && (
            <ProgressBar
              value={uninstallApps.progress}
              showValue
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}