import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { motion } from 'framer-motion';
import { useHistoryStore } from '@renderer/stores/historyStore';
import { useAuthStore } from '@renderer/stores/authStore';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import { BarChart3, TrendingUp, Clock, Award, Download } from 'lucide-react';
import { ExportDialog } from '@renderer/components/reports/ExportDialog';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import type { ScanResult, CleanupResult, UserStats } from '@renderer/stores/historyStore';

export function History() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    recentScans, 
    recentCleanups, 
    userStats, 
    loadHistory,
    getMonthlyStats,
    isLoading 
  } = useHistoryStore();
  
  const [monthlyData, setMonthlyData] = useState<{ month: string; cleaned: number }[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    if (user) {
      loadHistory();
      loadMonthlyStats();
    }
  }, [user]);

  const loadMonthlyStats = async () => {
    const stats = await getMonthlyStats();
    setMonthlyData(stats);
  };

  // Chart data
  const chartData = {
    labels: monthlyData.map(d => {
      const date = new Date(d.month);
      return date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: t('history.spaceFreed'),
        data: monthlyData.map(d => d.cleaned / (1024 * 1024 * 1024)), // Convert to GB
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('history.monthlyCleanupTrend'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value.toFixed(1)} GB`,
        },
      },
    },
  };

  // Table columns
  const scanDateTemplate = (scan: ScanResult) => {
    return new Date(scan.timestamp).toLocaleDateString('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const scanSizeTemplate = (scan: ScanResult) => {
    return <Tag severity="info" value={formatBytes(scan.totalJunkFound)} />;
  };

  const scanDurationTemplate = (scan: ScanResult) => {
    const minutes = Math.floor(scan.duration / 60);
    const seconds = Math.floor(scan.duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cleanupSizeTemplate = (cleanup: CleanupResult) => {
    return <Tag severity="success" value={formatBytes(cleanup.totalCleaned)} />;
  };

  const cleanupStatusTemplate = (cleanup: CleanupResult) => {
    const severityMap = {
      completed: 'success',
      partial: 'warning',
      failed: 'danger',
    } as const;
    
    return (
      <Tag 
        severity={severityMap[cleanup.status]} 
        value={cleanup.status.charAt(0).toUpperCase() + cleanup.status.slice(1)} 
      />
    );
  };

  if (isLoading && !userStats) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton height="4rem" className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="10rem" />
          ))}
        </div>
        <Skeleton height="20rem" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              <span className="text-gray-900 dark:text-gray-100">{t('common.history')}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
              {t('history.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              label={t('export.title')} 
              icon="pi pi-download"
              severity="info"
              outlined
              onClick={() => {
                playSound('click');
                setShowExportDialog(true);
              }}
            />
            <Button 
              label={t('common.back')} 
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={() => navigate({ to: '/dashboard' })}
            />
          </div>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <Tag severity="success" value={t('history.lifetime')} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {formatBytes(userStats.totalSpaceFreed)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('history.totalSpaceFreed')}
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <Tag severity="info" value={`${userStats.totalScans}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {userStats.totalScans}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('history.totalScans')}
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                    <Tag severity="warning" value={`${Math.floor(userStats.totalTimeSaved / 60)}m`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {Math.floor(userStats.totalTimeSaved / 3600)}h
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('history.timeSaved')}
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-orange-600" />
                    <Tag severity="danger" value={`🔥 ${userStats.cleanupStreak}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {userStats.cleanupStreak} days
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('history.cleanupStreak')}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Chart and Tables */}
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header={t('history.overview')} leftIcon="pi pi-chart-bar">
            <div className="space-y-6">
              {monthlyData.length > 0 && (
                <Card className="shadow-lg">
                  <Chart type="bar" data={chartData} options={chartOptions} />
                </Card>
              )}
              
              <Card className="shadow-lg">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{t('history.quickStats')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {userStats ? formatBytes(userStats.averageJunkPerScan) : '0 B'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('history.averageJunkPerScan')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {userStats?.mostCleanedCategory || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('history.mostCleanedCategory')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {userStats?.lastScanDate 
                          ? new Date(userStats.lastScanDate).toLocaleDateString()
                          : t('common.never')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('history.lastScan')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header={t('history.scans')} leftIcon="pi pi-search">
            <Card className="shadow-lg">
              <DataTable 
                value={recentScans} 
                paginator 
                rows={10}
                emptyMessage={t('history.noScansYet')}
                className="p-datatable-striped"
              >
                <Column field="timestamp" header={t('common.date')} body={scanDateTemplate} sortable />
                <Column field="type" header={t('common.type')} sortable />
                <Column field="totalJunkFound" header={t('history.junkFound')} body={scanSizeTemplate} sortable />
                <Column field="duration" header={t('common.duration')} body={scanDurationTemplate} />
                <Column field="status" header={t('common.status')} />
              </DataTable>
            </Card>
          </TabPanel>

          <TabPanel header={t('history.cleanups')} leftIcon="pi pi-trash">
            <Card className="shadow-lg">
              <DataTable 
                value={recentCleanups} 
                paginator 
                rows={10}
                emptyMessage={t('history.noCleanupsYet')}
                className="p-datatable-striped"
              >
                <Column field="timestamp" header={t('common.date')} body={scanDateTemplate} sortable />
                <Column field="totalCleaned" header={t('history.spaceCleaned')} body={cleanupSizeTemplate} sortable />
                <Column field="duration" header={t('common.duration')} body={scanDurationTemplate} />
                <Column field="status" header={t('common.status')} body={cleanupStatusTemplate} />
              </DataTable>
            </Card>
          </TabPanel>
        </TabView>
      </motion.div>

      {/* Export Dialog */}
      <ExportDialog
        visible={showExportDialog}
        onHide={() => setShowExportDialog(false)}
      />
    </div>
  );
}