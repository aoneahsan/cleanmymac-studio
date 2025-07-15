import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';

interface ProcessInfo {
  id: string;
  name: string;
  memory: number;
  cpu: number;
  type: 'system' | 'user' | 'background';
  canOptimize: boolean;
}

interface MemoryStats {
  total: number;
  used: number;
  available: number;
  wired: number;
  compressed: number;
  app: number;
  cache: number;
}

export function MemoryOptimizer() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    total: 16 * 1024 * 1024 * 1024, // 16GB
    used: 12 * 1024 * 1024 * 1024,
    available: 4 * 1024 * 1024 * 1024,
    wired: 3 * 1024 * 1024 * 1024,
    compressed: 2 * 1024 * 1024 * 1024,
    app: 5 * 1024 * 1024 * 1024,
    cache: 2 * 1024 * 1024 * 1024,
  });

  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [memoryHistory, setMemoryHistory] = useState<number[]>(new Array(20).fill(75));
  const { playSound } = useSoundEffect();

  // Simulate real-time memory stats
  useEffect(() => {
    const interval = setInterval(() => {
      // Update memory stats with some randomness
      setMemoryStats(prev => {
        const variation = (Math.random() - 0.5) * 0.1;
        const newUsed = Math.max(
          prev.total * 0.3,
          Math.min(prev.total * 0.9, prev.used * (1 + variation))
        );
        
        return {
          ...prev,
          used: newUsed,
          available: prev.total - newUsed,
          app: newUsed * 0.4,
          wired: newUsed * 0.25,
          compressed: newUsed * 0.15,
          cache: newUsed * 0.2,
        };
      });

      // Update history
      setMemoryHistory(prev => {
        const newHistory = [...prev.slice(1)];
        const usagePercent = (memoryStats.used / memoryStats.total) * 100;
        newHistory.push(usagePercent);
        return newHistory;
      });
    }, 2000);

    // Generate mock processes
    generateMockProcesses();

    return () => clearInterval(interval);
  }, []);

  const generateMockProcesses = () => {
    const mockProcesses: ProcessInfo[] = [
      {
        id: '1',
        name: 'Google Chrome',
        memory: 2.1 * 1024 * 1024 * 1024,
        cpu: 15.2,
        type: 'user',
        canOptimize: true,
      },
      {
        id: '2',
        name: 'Slack',
        memory: 800 * 1024 * 1024,
        cpu: 5.1,
        type: 'user',
        canOptimize: true,
      },
      {
        id: '3',
        name: 'kernel_task',
        memory: 1.5 * 1024 * 1024 * 1024,
        cpu: 8.3,
        type: 'system',
        canOptimize: false,
      },
      {
        id: '4',
        name: 'Spotify',
        memory: 400 * 1024 * 1024,
        cpu: 2.1,
        type: 'user',
        canOptimize: true,
      },
      {
        id: '5',
        name: 'mds_stores',
        memory: 300 * 1024 * 1024,
        cpu: 1.2,
        type: 'background',
        canOptimize: true,
      },
      {
        id: '6',
        name: 'WindowServer',
        memory: 600 * 1024 * 1024,
        cpu: 4.5,
        type: 'system',
        canOptimize: false,
      },
    ];

    setProcesses(mockProcesses.sort((a, b) => b.memory - a.memory));
  };

  const optimizeMemory = useProgressiveAction(
    async () => {
      playSound('scanStart');
      setIsOptimizing(true);

      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update memory stats to show improvement
      setMemoryStats(prev => ({
        ...prev,
        used: prev.used * 0.75,
        available: prev.total - (prev.used * 0.75),
        cache: prev.cache * 0.3,
      }));

      // Update processes to show optimization
      setProcesses(prev =>
        prev.map(process => ({
          ...process,
          memory: process.canOptimize ? process.memory * 0.7 : process.memory,
        }))
      );

      setIsOptimizing(false);
      playSound('success');
      
      const freedMemory = memoryStats.used * 0.25;
      showNotification(
        'success',
        t('memory.optimized', { size: formatBytes(freedMemory) })
      );
    },
    {
      successMessage: t('memory.optimizationComplete'),
      errorMessage: t('memory.optimizationError'),
    }
  );

  const getMemoryPressure = () => {
    const usagePercent = (memoryStats.used / memoryStats.total) * 100;
    if (usagePercent > 90) return { level: 'critical', color: 'danger' };
    if (usagePercent > 75) return { level: 'high', color: 'warning' };
    if (usagePercent > 50) return { level: 'moderate', color: 'info' };
    return { level: 'low', color: 'success' };
  };

  const pressure = getMemoryPressure();

  // Chart configuration
  const chartData = {
    labels: memoryHistory.map(() => ''),
    datasets: [
      {
        label: 'Memory Usage %',
        data: memoryHistory,
        fill: true,
        borderColor: pressure.color === 'danger' ? '#ef4444' : '#8b5cf6',
        backgroundColor: pressure.color === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: {
        display: true,
        min: 0,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const processTypeTemplate = (process: ProcessInfo) => {
    const typeConfig = {
      system: { severity: 'danger' as const, icon: 'pi-shield' },
      user: { severity: 'info' as const, icon: 'pi-user' },
      background: { severity: 'secondary' as const, icon: 'pi-cog' },
    };

    const config = typeConfig[process.type];
    return <Tag severity={config.severity} icon={`pi ${config.icon}`} value={process.type} />;
  };

  const memoryTemplate = (process: ProcessInfo) => {
    return <span className="font-mono">{formatBytes(process.memory)}</span>;
  };

  const cpuTemplate = (process: ProcessInfo) => {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono">{process.cpu.toFixed(1)}%</span>
        {process.cpu > 50 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
      </div>
    );
  };

  const actionTemplate = (process: ProcessInfo) => {
    if (!process.canOptimize) {
      return <Tag severity="secondary" value={t('memory.systemProcess')} />;
    }

    return (
      <Button
        label={t('memory.optimize')}
        size="small"
        severity="warning"
        outlined
        onClick={() => {
          playSound('click');
          showNotification('info', t('memory.processOptimized', { name: process.name }));
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Memory Overview */}
      <Card className="shadow-xl glass overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('memory.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{t('memory.description')}</p>
              </div>
            </div>
            <Button
              label={t('memory.optimizeNow')}
              icon="pi pi-bolt"
              severity="warning"
              size="large"
              loading={isOptimizing}
              onClick={() => optimizeMemory.execute()}
            />
          </div>

          {/* Memory Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Memory Usage Chart */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <div className="p-4">
                <h3 className="font-semibold mb-3">{t('memory.usageTrend')}</h3>
                <div className="h-48">
                  <Chart type="line" data={chartData} options={chartOptions} />
                </div>
              </div>
            </Card>

            {/* Memory Breakdown */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <div className="p-4">
                <h3 className="font-semibold mb-3">{t('memory.breakdown')}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('memory.appMemory')}</span>
                      <span className="font-mono">{formatBytes(memoryStats.app)}</span>
                    </div>
                    <ProgressBar value={(memoryStats.app / memoryStats.total) * 100} showValue={false} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('memory.wiredMemory')}</span>
                      <span className="font-mono">{formatBytes(memoryStats.wired)}</span>
                    </div>
                    <ProgressBar value={(memoryStats.wired / memoryStats.total) * 100} showValue={false} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('memory.compressedMemory')}</span>
                      <span className="font-mono">{formatBytes(memoryStats.compressed)}</span>
                    </div>
                    <ProgressBar value={(memoryStats.compressed / memoryStats.total) * 100} showValue={false} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('memory.cachedFiles')}</span>
                      <span className="font-mono">{formatBytes(memoryStats.cache)}</span>
                    </div>
                    <ProgressBar value={(memoryStats.cache / memoryStats.total) * 100} showValue={false} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Memory Pressure Indicator */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <Activity className={`w-6 h-6 text-${pressure.color}-500`} />
              <div>
                <h4 className="font-semibold">{t('memory.pressure')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`memory.pressure${pressure.level.charAt(0).toUpperCase() + pressure.level.slice(1)}`)}
                </p>
              </div>
            </div>
            <Tag 
              severity={pressure.color as any}
              value={`${((memoryStats.used / memoryStats.total) * 100).toFixed(1)}%`}
              className="text-lg px-4 py-2"
            />
          </div>

          {/* Top Processes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('memory.topProcesses')}</h3>
            <DataTable value={processes} className="p-datatable-striped">
              <Column field="name" header={t('memory.processName')} />
              <Column header={t('memory.type')} body={processTypeTemplate} />
              <Column header={t('memory.memoryUsage')} body={memoryTemplate} sortable />
              <Column header={t('memory.cpuUsage')} body={cpuTemplate} sortable />
              <Column header={t('memory.action')} body={actionTemplate} />
            </DataTable>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={() => {
          playSound('click');
          showNotification('info', t('memory.purgingInactiveMemory'));
        }}>
          <div className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold">{t('memory.purgeInactive')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('memory.purgeInactiveDesc')}
            </p>
          </div>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => {
          playSound('click');
          showNotification('info', t('memory.clearingDNSCache'));
        }}>
          <div className="p-4 text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold">{t('memory.clearDNSCache')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('memory.clearDNSCacheDesc')}
            </p>
          </div>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => {
          playSound('click');
          showNotification('info', t('memory.runningMaintenance'));
        }}>
          <div className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">{t('memory.runMaintenance')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('memory.runMaintenanceDesc')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}