import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { Battery, BatteryCharging, Zap, AlertTriangle, TrendingDown, Info } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';

interface BatteryInfo {
  level: number; // 0-100
  isCharging: boolean;
  cycleCount: number;
  health: number; // 0-100
  temperature: number; // Celsius
  voltage: number; // Volts
  timeRemaining: number; // Minutes
  designCapacity: number; // mAh
  currentCapacity: number; // mAh
  manufacturer: string;
  serialNumber: string;
}

const MOCK_BATTERY_INFO: BatteryInfo = {
  level: 78,
  isCharging: false,
  cycleCount: 342,
  health: 87,
  temperature: 32.5,
  voltage: 12.4,
  timeRemaining: 245,
  designCapacity: 5000,
  currentCapacity: 4350,
  manufacturer: 'Apple',
  serialNumber: 'C02XX1234567',
};

// Mock history data for chart
const MOCK_HISTORY = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  health: 87 - Math.random() * 2,
  cycles: 342 - (6 - i),
}));

export function BatteryMonitor() {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>(MOCK_BATTERY_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    // Simulate loading battery info
    setTimeout(() => {
      setIsLoading(false);
      playSound('success');
    }, 1500);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setBatteryInfo(prev => ({
        ...prev,
        level: Math.max(0, Math.min(100, prev.level + (prev.isCharging ? 1 : -0.5))),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        voltage: prev.voltage + (Math.random() - 0.5) * 0.1,
        timeRemaining: prev.isCharging 
          ? Math.round((100 - prev.level) * 3) 
          : Math.round(prev.level * 3),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [playSound]);

  const getHealthStatus = (health: number) => {
    if (health >= 80) return { label: t('battery.good'), severity: 'success', icon: <Battery className="w-5 h-5" /> };
    if (health >= 60) return { label: t('battery.fair'), severity: 'warning', icon: <TrendingDown className="w-5 h-5" /> };
    return { label: t('battery.replace'), severity: 'danger', icon: <AlertTriangle className="w-5 h-5" /> };
  };

  const healthStatus = getHealthStatus(batteryInfo.health);

  const chartData = {
    labels: MOCK_HISTORY.map(h => h.day),
    datasets: [
      {
        label: t('battery.health'),
        data: MOCK_HISTORY.map(h => h.health),
        fill: false,
        borderColor: '#10b981',
        tension: 0.4,
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
      y: {
        min: 80,
        max: 90,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <div className="p-12 text-center">
          <Battery className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold mb-2">{t('battery.loading')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('battery.analyzing')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {batteryInfo.isCharging ? (
                  <BatteryCharging className="w-12 h-12 text-green-500" />
                ) : (
                  <Battery className="w-12 h-12 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{t('battery.title')}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {batteryInfo.isCharging ? t('battery.charging') : t('battery.discharging')}
                  </p>
                </div>
              </div>
              <Tag 
                severity={healthStatus.severity as any} 
                value={healthStatus.label}
                icon={healthStatus.icon}
                className="px-4 py-2"
              />
            </div>

            {/* Battery Level */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('battery.level')}</span>
                <span className="text-2xl font-bold">{batteryInfo.level}%</span>
              </div>
              <ProgressBar 
                value={batteryInfo.level} 
                className="h-6"
                color={batteryInfo.level > 20 ? '#10b981' : '#ef4444'}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {batteryInfo.isCharging 
                  ? t('battery.timeToFull', { time: formatTime(batteryInfo.timeRemaining) })
                  : t('battery.timeRemaining', { time: formatTime(batteryInfo.timeRemaining) })
                }
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('battery.health')}</span>
                </div>
                <p className="text-xl font-bold">{batteryInfo.health}%</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('battery.cycles')}</span>
                </div>
                <p className="text-xl font-bold">{batteryInfo.cycleCount}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('battery.temperature')}</span>
                </div>
                <p className="text-xl font-bold">{batteryInfo.temperature.toFixed(1)}°C</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('battery.voltage')}</span>
                </div>
                <p className="text-xl font-bold">{batteryInfo.voltage.toFixed(1)}V</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Health History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('battery.healthHistory')}</h3>
            <div className="h-64">
              <Chart type="line" data={chartData} options={chartOptions} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Detailed Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('battery.details')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('battery.manufacturer')}</span>
                <span className="font-medium">{batteryInfo.manufacturer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('battery.serialNumber')}</span>
                <span className="font-medium">{batteryInfo.serialNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('battery.designCapacity')}</span>
                <span className="font-medium">{batteryInfo.designCapacity} mAh</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">{t('battery.currentCapacity')}</span>
                <span className="font-medium">{batteryInfo.currentCapacity} mAh</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="shadow-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">{t('battery.tips.title')}</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• {t('battery.tips.tip1')}</li>
                  <li>• {t('battery.tips.tip2')}</li>
                  <li>• {t('battery.tips.tip3')}</li>
                  <li>• {t('battery.tips.tip4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Calibrate Button */}
      <div className="flex justify-center">
        <Button
          label={t('battery.calibrate')}
          icon="pi pi-sync"
          severity="info"
          onClick={() => {
            playSound('click');
            // Handle battery calibration
          }}
        />
      </div>
    </div>
  );
}