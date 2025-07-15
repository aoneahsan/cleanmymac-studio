import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, Upload, Globe, Activity } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';

interface SpeedTestResult {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  timestamp: Date;
}

interface NetworkSpeedProps {
  onClose?: () => void;
  compact?: boolean;
}

export function NetworkSpeed({ onClose, compact = false }: NetworkSpeedProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');
  const [lastResult, setLastResult] = useState<SpeedTestResult | null>(null);
  const [speedHistory, setSpeedHistory] = useState<number[]>(new Array(10).fill(0));
  const [realTimeSpeed, setRealTimeSpeed] = useState(0);
  const { playSound } = useSoundEffect();

  // Simulate real-time network monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTesting) {
        // Simulate network activity
        const mockSpeed = Math.random() * 50 + 10;
        setRealTimeSpeed(mockSpeed);
        setSpeedHistory(prev => [...prev.slice(1), mockSpeed]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTesting]);

  const runSpeedTest = async () => {
    playSound('scanStart');
    setIsTesting(true);
    setTestProgress(0);
    setCurrentPhase('ping');

    // Simulate ping test
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTestProgress(20);

    // Simulate download test
    setCurrentPhase('download');
    let downloadSpeed = 0;
    for (let i = 0; i < 30; i++) {
      downloadSpeed = Math.random() * 200 + 100;
      setRealTimeSpeed(downloadSpeed);
      setTestProgress(20 + (i / 30) * 40);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate upload test
    setCurrentPhase('upload');
    let uploadSpeed = 0;
    for (let i = 0; i < 20; i++) {
      uploadSpeed = Math.random() * 100 + 50;
      setRealTimeSpeed(uploadSpeed);
      setTestProgress(60 + (i / 20) * 40);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Set results
    const result: SpeedTestResult = {
      download: Math.round(downloadSpeed),
      upload: Math.round(uploadSpeed),
      ping: Math.round(Math.random() * 30 + 10),
      jitter: Math.round(Math.random() * 5 + 1),
      timestamp: new Date(),
    };

    setLastResult(result);
    setIsTesting(false);
    setCurrentPhase('idle');
    setRealTimeSpeed(0);
    playSound('success');
  };

  const getSpeedQuality = (speed: number) => {
    if (speed > 100) return { label: t('network.excellent'), color: 'success' };
    if (speed > 50) return { label: t('network.good'), color: 'info' };
    if (speed > 25) return { label: t('network.fair'), color: 'warning' };
    return { label: t('network.poor'), color: 'danger' };
  };

  const chartData = {
    labels: speedHistory.map(() => ''),
    datasets: [
      {
        label: 'Network Activity',
        data: speedHistory,
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
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
        display: false,
        min: 0,
        max: 250,
      },
    },
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed top-6 right-6 z-40"
      >
        <Button
          className="rounded-full w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 border-0 shadow-lg"
          onClick={() => {
            playSound('click');
            setIsMinimized(false);
          }}
        >
          <Wifi className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <Card className="shadow-lg glass overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">{t('network.title')}</h3>
            </div>
            <Button
              label={t('network.test')}
              size="small"
              severity="success"
              onClick={runSpeedTest}
              loading={isTesting}
            />
          </div>
          
          {lastResult && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('network.download')}: </span>
                <span className="font-bold">{lastResult.download} Mbps</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('network.upload')}: </span>
                <span className="font-bold">{lastResult.upload} Mbps</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -400, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -400, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed top-6 right-6 z-40 w-96"
      >
        <Card className="shadow-2xl glass overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold">{t('network.title')}</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  icon="pi pi-minus"
                  severity="secondary"
                  text
                  rounded
                  onClick={() => {
                    playSound('click');
                    setIsMinimized(true);
                  }}
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

            {/* Real-time Monitor */}
            <div className="mb-4 h-20">
              <Chart type="line" data={chartData} options={chartOptions} />
            </div>

            {/* Speed Test Section */}
            {isTesting ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-green-500 mx-auto mb-2 animate-pulse" />
                  <h4 className="font-semibold mb-1">{t('network.testing')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPhase === 'ping' && t('network.testingPing')}
                    {currentPhase === 'download' && t('network.testingDownload')}
                    {currentPhase === 'upload' && t('network.testingUpload')}
                  </p>
                </div>
                
                <ProgressBar value={testProgress} />
                
                {currentPhase !== 'ping' && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {realTimeSpeed.toFixed(1)} Mbps
                    </div>
                  </div>
                )}
              </div>
            ) : lastResult ? (
              <div className="space-y-4">
                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('network.download')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{lastResult.download}</div>
                    <Tag 
                      severity={getSpeedQuality(lastResult.download).color as any}
                      value={getSpeedQuality(lastResult.download).label}
                      className="mt-1"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Upload className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('network.upload')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{lastResult.upload}</div>
                    <Tag 
                      severity={getSpeedQuality(lastResult.upload).color as any}
                      value={getSpeedQuality(lastResult.upload).label}
                      className="mt-1"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('network.ping')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{lastResult.ping} ms</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('network.jitter')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{lastResult.jitter} ms</div>
                  </motion.div>
                </div>

                <div className="text-center text-xs text-gray-500">
                  {t('network.lastTested')}: {lastResult.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('network.noTestYet')}
                </p>
              </div>
            )}

            {/* Action Button */}
            <Button
              label={t('network.runTest')}
              icon="pi pi-play"
              severity="success"
              className="w-full mt-4"
              loading={isTesting}
              onClick={runSpeedTest}
            />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}