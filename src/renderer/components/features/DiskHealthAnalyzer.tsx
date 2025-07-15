import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { motion } from 'framer-motion';
import { HardDrive, AlertTriangle, CheckCircle, Activity, Thermometer, Clock, Zap } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { formatBytes } from '@renderer/lib/utils';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface DiskInfo {
  name: string;
  mountPoint: string;
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  type: 'internal' | 'external' | 'network';
  fileSystem: string;
  isBootDisk: boolean;
}

interface SMARTData {
  health: 'good' | 'warning' | 'critical';
  temperature: number;
  powerOnHours: number;
  powerCycles: number;
  reallocatedSectors: number;
  pendingSectors: number;
  uncorrectableSectors: number;
  readErrorRate: number;
  seekErrorRate: number;
  spinRetryCount: number;
  attributes: Array<{
    id: number;
    name: string;
    value: number;
    worst: number;
    threshold: number;
    status: 'ok' | 'warning' | 'failing';
  }>;
}

interface BenchmarkResult {
  readSpeed: number;
  writeSpeed: number;
  randomRead4K: number;
  randomWrite4K: number;
  latency: number;
}

export function DiskHealthAnalyzer() {
  const { playSound } = useSoundEffect();
  const [selectedDisk, setSelectedDisk] = useState<DiskInfo | null>(null);
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [smartData, setSmartData] = useState<SMARTData | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);

  // Load disks on mount
  useEffect(() => {
    loadDisks();
  }, []);

  const loadDisks = async () => {
    // Simulated disk data
    const mockDisks: DiskInfo[] = [
      {
        name: 'Macintosh HD',
        mountPoint: '/',
        totalSpace: 500 * 1024 * 1024 * 1024,
        freeSpace: 150 * 1024 * 1024 * 1024,
        usedSpace: 350 * 1024 * 1024 * 1024,
        type: 'internal',
        fileSystem: 'APFS',
        isBootDisk: true,
      },
      {
        name: 'External SSD',
        mountPoint: '/Volumes/External',
        totalSpace: 1024 * 1024 * 1024 * 1024,
        freeSpace: 512 * 1024 * 1024 * 1024,
        usedSpace: 512 * 1024 * 1024 * 1024,
        type: 'external',
        fileSystem: 'APFS',
        isBootDisk: false,
      },
    ];
    
    setDisks(mockDisks);
    if (mockDisks.length > 0) {
      setSelectedDisk(mockDisks[0]);
    }
  };

  const analyzeDisk = useProgressiveAction(
    async () => {
      if (!selectedDisk) throw new Error('No disk selected');
      
      playSound('scanStart');
      
      // Simulate SMART data retrieval
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSmartData: SMARTData = {
        health: 'good',
        temperature: 42,
        powerOnHours: 8760,
        powerCycles: 1234,
        reallocatedSectors: 0,
        pendingSectors: 0,
        uncorrectableSectors: 0,
        readErrorRate: 0,
        seekErrorRate: 0,
        spinRetryCount: 0,
        attributes: [
          { id: 5, name: 'Reallocated Sectors Count', value: 100, worst: 100, threshold: 5, status: 'ok' },
          { id: 9, name: 'Power On Hours', value: 95, worst: 95, threshold: 0, status: 'ok' },
          { id: 12, name: 'Power Cycle Count', value: 99, worst: 99, threshold: 0, status: 'ok' },
          { id: 194, name: 'Temperature', value: 42, worst: 45, threshold: 0, status: 'ok' },
          { id: 197, name: 'Current Pending Sector Count', value: 100, worst: 100, threshold: 0, status: 'ok' },
          { id: 198, name: 'Uncorrectable Sector Count', value: 100, worst: 100, threshold: 0, status: 'ok' },
        ],
      };
      
      setSmartData(mockSmartData);
      
      // Update health history
      const newHealthPoint = {
        date: new Date().toLocaleDateString(),
        health: 100,
        temperature: mockSmartData.temperature,
      };
      setHealthHistory(prev => [...prev.slice(-29), newHealthPoint]);
      
      playSound('scanComplete');
      showNotification('success', t('tools.diskHealth.analysisComplete'));
    },
    {
      simulateProgress: true,
      successMessage: t('tools.diskHealth.analysisComplete'),
      errorMessage: t('common.error'),
    }
  );

  const runBenchmark = useProgressiveAction(
    async () => {
      if (!selectedDisk) throw new Error('No disk selected');
      
      playSound('scanStart');
      
      // Simulate benchmark
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockBenchmark: BenchmarkResult = {
        readSpeed: 2500 + Math.random() * 500, // MB/s
        writeSpeed: 2000 + Math.random() * 400,
        randomRead4K: 60 + Math.random() * 20,
        randomWrite4K: 150 + Math.random() * 50,
        latency: 0.05 + Math.random() * 0.02,
      };
      
      setBenchmarkResult(mockBenchmark);
      playSound('success');
      showNotification('success', t('tools.diskHealth.benchmarkComplete'));
    },
    {
      simulateProgress: true,
      successMessage: t('tools.diskHealth.benchmarkComplete'),
      errorMessage: t('common.error'),
    }
  );

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-16 h-16 text-red-500" />;
      default:
        return <HardDrive className="w-16 h-16 text-gray-500" />;
    }
  };

  const getHealthSeverity = (health: string): "success" | "warning" | "danger" => {
    switch (health) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'success';
    }
  };

  const healthChartData = {
    labels: healthHistory.map(h => h.date),
    datasets: [
      {
        label: t('tools.diskHealth.healthScore'),
        data: healthHistory.map(h => h.health),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: t('tools.diskHealth.temperature'),
        data: healthHistory.map(h => h.temperature),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const healthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: t('tools.diskHealth.healthScore') + ' (%)',
        },
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        max: 80,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: t('tools.diskHealth.temperature') + ' (°C)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Disk Selector */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('tools.diskHealth.selectDisk')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disks.map((disk) => (
              <motion.div
                key={disk.mountPoint}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedDisk?.mountPoint === disk.mountPoint
                      ? 'ring-2 ring-purple-500'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedDisk(disk)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-8 h-8 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">{disk.name}</h4>
                          <p className="text-sm text-gray-500">{disk.fileSystem}</p>
                        </div>
                      </div>
                      {disk.isBootDisk && (
                        <Tag severity="info" value={t('tools.diskHealth.bootDisk')} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('common.used')}:</span>
                        <span>{formatBytes(disk.usedSpace)}</span>
                      </div>
                      <ProgressBar
                        value={(disk.usedSpace / disk.totalSpace) * 100}
                        showValue={false}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{formatBytes(disk.freeSpace)} {t('common.free')}</span>
                        <span>{formatBytes(disk.totalSpace)} {t('common.total')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Analysis Actions */}
      {selectedDisk && (
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                label={t('tools.diskHealth.analyzeDisk')}
                icon="pi pi-search"
                size="large"
                severity="success"
                onClick={analyzeDisk.execute}
                loading={analyzeDisk.isLoading}
                className="min-w-[200px]"
              />
              <Button
                label={t('tools.diskHealth.runBenchmark')}
                icon="pi pi-chart-line"
                size="large"
                severity="info"
                onClick={runBenchmark.execute}
                loading={runBenchmark.isLoading}
                className="min-w-[200px]"
              />
            </div>
            {(analyzeDisk.isLoading || runBenchmark.isLoading) && (
              <ProgressBar
                value={analyzeDisk.isLoading ? analyzeDisk.progress : runBenchmark.progress}
                className="mt-4"
                showValue
              />
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      {smartData && (
        <TabView>
          <TabPanel header={t('tools.diskHealth.overview')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Status */}
              <Card>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">{t('tools.diskHealth.healthStatus')}</h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="mb-4"
                  >
                    {getHealthIcon(smartData.health)}
                  </motion.div>
                  <Tag
                    severity={getHealthSeverity(smartData.health)}
                    value={t(`tools.diskHealth.health.${smartData.health}`)}
                    className="text-lg px-4 py-2"
                  />
                </div>
              </Card>

              {/* Key Metrics */}
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">{t('tools.diskHealth.keyMetrics')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span>{t('tools.diskHealth.temperature')}</span>
                      </div>
                      <Tag
                        severity={smartData.temperature > 50 ? 'warning' : 'success'}
                        value={`${smartData.temperature}°C`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span>{t('tools.diskHealth.powerOnHours')}</span>
                      </div>
                      <span className="font-mono">{smartData.powerOnHours.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <span>{t('tools.diskHealth.powerCycles')}</span>
                      </div>
                      <span className="font-mono">{smartData.powerCycles.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header={t('tools.diskHealth.smartAttributes')}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t('tools.diskHealth.attribute')}</th>
                    <th className="text-center p-3">{t('tools.diskHealth.value')}</th>
                    <th className="text-center p-3">{t('tools.diskHealth.worst')}</th>
                    <th className="text-center p-3">{t('tools.diskHealth.threshold')}</th>
                    <th className="text-center p-3">{t('tools.diskHealth.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {smartData.attributes.map((attr) => (
                    <tr key={attr.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{attr.name}</div>
                          <div className="text-sm text-gray-500">ID: {attr.id}</div>
                        </div>
                      </td>
                      <td className="text-center p-3 font-mono">{attr.value}</td>
                      <td className="text-center p-3 font-mono">{attr.worst}</td>
                      <td className="text-center p-3 font-mono">{attr.threshold}</td>
                      <td className="text-center p-3">
                        <Tag
                          severity={
                            attr.status === 'ok' ? 'success' : 
                            attr.status === 'warning' ? 'warning' : 'danger'
                          }
                          value={t(`tools.diskHealth.status.${attr.status}`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>

          <TabPanel header={t('tools.diskHealth.performance')}>
            {benchmarkResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h4 className="text-lg font-bold mb-4">{t('tools.diskHealth.sequentialSpeed')}</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>{t('tools.diskHealth.readSpeed')}</span>
                          <span className="font-mono">{benchmarkResult.readSpeed.toFixed(0)} MB/s</span>
                        </div>
                        <ProgressBar
                          value={(benchmarkResult.readSpeed / 3000) * 100}
                          showValue={false}
                          className="h-3"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>{t('tools.diskHealth.writeSpeed')}</span>
                          <span className="font-mono">{benchmarkResult.writeSpeed.toFixed(0)} MB/s</span>
                        </div>
                        <ProgressBar
                          value={(benchmarkResult.writeSpeed / 3000) * 100}
                          showValue={false}
                          className="h-3"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h4 className="text-lg font-bold mb-4">{t('tools.diskHealth.randomSpeed')}</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>{t('tools.diskHealth.random4kRead')}</span>
                          <span className="font-mono">{benchmarkResult.randomRead4K.toFixed(1)} MB/s</span>
                        </div>
                        <ProgressBar
                          value={(benchmarkResult.randomRead4K / 100) * 100}
                          showValue={false}
                          className="h-3"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>{t('tools.diskHealth.random4kWrite')}</span>
                          <span className="font-mono">{benchmarkResult.randomWrite4K.toFixed(1)} MB/s</span>
                        </div>
                        <ProgressBar
                          value={(benchmarkResult.randomWrite4K / 200) * 100}
                          showValue={false}
                          className="h-3"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center p-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('tools.diskHealth.runBenchmarkFirst')}</p>
              </div>
            )}
          </TabPanel>

          <TabPanel header={t('tools.diskHealth.history')}>
            {healthHistory.length > 0 ? (
              <div className="h-96">
                <Chart type="line" data={healthChartData} options={healthChartOptions} />
              </div>
            ) : (
              <div className="text-center p-8">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('tools.diskHealth.noHistoryData')}</p>
              </div>
            )}
          </TabPanel>
        </TabView>
      )}
    </div>
  );
}