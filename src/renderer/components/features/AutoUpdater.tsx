import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { RadioButton } from 'primereact/radiobutton';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { showNotification } from '@renderer/lib/notifications';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

export const AutoUpdater: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateChannel, setUpdateChannel] = useState<'latest' | 'beta'>('latest');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current version from package.json or hardcode it
    setCurrentVersion('1.0.0');
    
    // Set default update channel
    setUpdateChannel('latest');

    // Set up event listeners
    const unsubUpdateAvailable = window.electron.updater.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      showNotification('info', t('updater.updateAvailable') + ' - ' + t('updater.newVersion', { version: info.version }));
    });

    const unsubDownloadProgress = window.electron.updater.onDownloadProgress((progress) => {
      setDownloading(true);
      setDownloadProgress(progress);
    });

    const unsubUpdateDownloaded = window.electron.updater.onUpdateDownloaded((info) => {
      setDownloading(false);
      setUpdateReady(true);
      setUpdateInfo(info);
      showNotification('success', t('updater.updateReady') + ' - ' + t('updater.readyToInstall'));
    });

    const unsubError = window.electron.updater.onError((errorMessage) => {
      setError(errorMessage);
      setChecking(false);
      setDownloading(false);
      showNotification('error', t('updater.updateError') + ': ' + errorMessage);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubUpdateAvailable();
      unsubDownloadProgress();
      unsubUpdateDownloaded();
      unsubError();
    };
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    setError(null);
    try {
      await window.electron.updater.checkForUpdates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setChecking(false);
    }
  };

  const downloadUpdate = async () => {
    setError(null);
    await window.electron.updater.downloadUpdate();
  };

  const installUpdate = async () => {
    window.electron.updater.quitAndInstall();
  };

  const changeChannel = async (channel: 'latest' | 'beta') => {
    setUpdateChannel(channel);
    // Channel change would need to be implemented in main process
    showNotification('info', t('updater.channelChanged') + ' - ' + t('updater.channelChangedDesc', { channel }));
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  return (
    <Card className="mb-4">
      <div className="space-y-6">
        {/* Current Version */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t('updater.currentVersion')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              CleanMyMac Pro+ v{currentVersion}
            </p>
          </div>
          <Tag severity="info" icon="pi pi-tag">
            {updateChannel === 'beta' ? 'Beta Channel' : 'Stable Channel'}
          </Tag>
        </div>

        {/* Update Channel Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3">{t('updater.updateChannel')}</h4>
          <div className="flex gap-4">
            <div className="flex items-center">
              <RadioButton
                inputId="stable"
                name="channel"
                value="latest"
                onChange={(e) => changeChannel(e.value)}
                checked={updateChannel === 'latest'}
              />
              <label htmlFor="stable" className="ml-2 cursor-pointer">
                {t('updater.stableChannel')}
              </label>
            </div>
            <div className="flex items-center">
              <RadioButton
                inputId="beta"
                name="channel"
                value="beta"
                onChange={(e) => changeChannel(e.value)}
                checked={updateChannel === 'beta'}
              />
              <label htmlFor="beta" className="ml-2 cursor-pointer">
                {t('updater.betaChannel')}
              </label>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {t('updater.error')}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {updateAvailable && !downloading && !updateReady && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    {t('updater.updateAvailable')}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {t('updater.version')} {updateInfo?.version} - {updateInfo?.releaseDate}
                  </p>
                  {updateInfo?.releaseNotes && (
                    <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">{t('updater.releaseNotes')}:</p>
                      <p className="whitespace-pre-wrap">{updateInfo.releaseNotes}</p>
                    </div>
                  )}
                  <Button
                    label={t('updater.download')}
                    icon="pi pi-download"
                    size="small"
                    className="mt-3"
                    onClick={downloadUpdate}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {downloading && downloadProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('updater.downloading')}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatSpeed(downloadProgress.bytesPerSecond)}
                </span>
              </div>
              <ProgressBar value={Math.round(downloadProgress.percent)} />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{formatBytes(downloadProgress.transferred)}</span>
                <span>{formatBytes(downloadProgress.total)}</span>
              </div>
            </motion.div>
          )}

          {updateReady && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {t('updater.updateReady')}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {t('updater.readyToInstallDesc')}
                  </p>
                  <Button
                    label={t('updater.installAndRestart')}
                    icon="pi pi-power-off"
                    size="small"
                    severity="success"
                    className="mt-3"
                    onClick={installUpdate}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {!updateAvailable && !downloading && !updateReady && !error && !checking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('updater.upToDate')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check for Updates Button */}
        {!downloading && !updateReady && (
          <div className="flex justify-center">
            <Button
              label={t('updater.checkForUpdates')}
              icon={checking ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
              onClick={checkForUpdates}
              disabled={checking}
              outlined
            />
          </div>
        )}
      </div>
    </Card>
  );
};