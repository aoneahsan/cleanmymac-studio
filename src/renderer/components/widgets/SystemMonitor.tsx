import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Wifi, X } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';

interface SystemStats {
  cpu: number;
  memory: { used: number; total: number };
  disk: { used: number; total: number };
  network: { download: number; upload: number };
}

interface SystemMonitorProps {
  onClose?: () => void;
}

export function SystemMonitor({ onClose }: SystemMonitorProps) {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: { used: 0, total: 16 },
    disk: { used: 0, total: 500 },
    network: { download: 0, upload: 0 },
  });
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(20).fill(0));
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Simulate real-time system stats
    const interval = setInterval(() => {
      setStats({
        cpu: Math.random() * 100,
        memory: { 
          used: 8 + Math.random() * 6, 
          total: 16 
        },
        disk: { 
          used: 250 + Math.random() * 50, 
          total: 500 
        },
        network: { 
          download: Math.random() * 100, 
          upload: Math.random() * 50 
        },
      });

      setCpuHistory(prev => [...prev.slice(1), Math.random() * 100]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const cpuChartData = {
    labels: cpuHistory.map((_, i) => ''),
    datasets: [
      {
        label: 'CPU Usage',
        data: cpuHistory,
        fill: true,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const cpuChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { 
        display: false,
        min: 0,
        max: 100,
      },
    },
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    color, 
    percentage 
  }: { 
    icon: any; 
    label: string; 
    value: string; 
    unit: string; 
    color: string;
    percentage?: number;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        {percentage !== undefined && (
          <span className="text-xs font-mono">{percentage.toFixed(1)}%</span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
          {unit}
        </span>
      </div>
    </motion.div>
  );

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          className="rounded-full w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-2xl"
          onClick={() => setIsMinimized(false)}
        >
          <Cpu className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed bottom-6 right-6 z-50 w-96"
      >
        <Card className="shadow-2xl glass overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('monitor.title')}
              </h3>
              <div className="flex gap-2">
                <Button
                  icon="pi pi-minus"
                  severity="secondary"
                  text
                  rounded
                  onClick={() => setIsMinimized(true)}
                />
                {onClose && (
                  <Button
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    rounded
                    onClick={onClose}
                  />
                )}
              </div>
            </div>

            {/* CPU Chart */}
            <div className="mb-4 h-24">
              <Chart type="line" data={cpuChartData} options={cpuChartOptions} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Cpu}
                label={t('monitor.cpu')}
                value={stats.cpu.toFixed(0)}
                unit="%"
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                percentage={stats.cpu}
              />
              <StatCard
                icon={MemoryStick}
                label={t('monitor.memory')}
                value={stats.memory.used.toFixed(1)}
                unit={`/ ${stats.memory.total} GB`}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                percentage={(stats.memory.used / stats.memory.total) * 100}
              />
              <StatCard
                icon={HardDrive}
                label={t('monitor.disk')}
                value={stats.disk.used.toFixed(0)}
                unit={`/ ${stats.disk.total} GB`}
                color="bg-gradient-to-br from-green-500 to-green-600"
                percentage={(stats.disk.used / stats.disk.total) * 100}
              />
              <StatCard
                icon={Wifi}
                label={t('monitor.network')}
                value={`↓${stats.network.download.toFixed(0)}`}
                unit="MB/s"
                color="bg-gradient-to-br from-orange-500 to-orange-600"
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                label={t('monitor.optimize')}
                icon="pi pi-bolt"
                severity="success"
                size="small"
                className="flex-1"
              />
              <Button
                label={t('monitor.details')}
                icon="pi pi-chart-line"
                severity="secondary"
                size="small"
                outlined
                className="flex-1"
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}