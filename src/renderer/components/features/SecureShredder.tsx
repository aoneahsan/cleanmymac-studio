import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Shield, AlertTriangle, FileX, HardDrive } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { formatBytes } from '@renderer/lib/utils';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface FileToShred {
  id: string;
  name: string;
  path: string;
  size: number;
}

interface ShredAlgorithm {
  name: string;
  value: string;
  passes: number;
  description: string;
}

const SHRED_ALGORITHMS: ShredAlgorithm[] = [
  { name: 'Quick Erase', value: 'quick', passes: 1, description: 'Single pass random data overwrite' },
  { name: 'DoD 5220.22-M', value: 'dod', passes: 3, description: 'US Department of Defense standard' },
  { name: 'Gutmann', value: 'gutmann', passes: 35, description: 'Most secure 35-pass overwrite' },
  { name: 'Random', value: 'random', passes: 7, description: '7-pass random data overwrite' },
];

export function SecureShredder() {
  const [files, setFiles] = useState<FileToShred[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<ShredAlgorithm>(SHRED_ALGORITHMS[1]);
  const [isShredding, setIsShredding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const { playSound } = useSoundEffect();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    playSound('click');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: FileToShred[] = droppedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      path: file.name, // File object doesn't have path property in browser
      size: file.size,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (fileId: string) => {
    playSound('click');
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startShredding = async () => {
    if (files.length === 0) return;
    
    playSound('scanStart');
    setIsShredding(true);
    setProgress(0);
    
    // Simulate shredding process
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      
      // Simulate multiple passes
      const totalPasses = selectedAlgorithm.passes;
      for (let pass = 0; pass < totalPasses; pass++) {
        const fileProgress = ((i + (pass + 1) / totalPasses) / files.length) * 100;
        setProgress(fileProgress);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      }
    }
    
    setIsShredding(false);
    setCurrentFile('');
    setProgress(100);
    
    playSound('success');
    showNotification('success', t('features.shredder.complete', { count: files.length }));
    
    // Clear files after shredding
    setTimeout(() => {
      setFiles([]);
      setProgress(0);
    }, 2000);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      {/* Warning Message */}
      <Message 
        severity="warn" 
        icon={<AlertTriangle className="w-5 h-5" />}
        text={t('features.shredder.warning')}
      />

      {/* Algorithm Selection */}
      <Card className="shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            {t('features.shredder.algorithm')}
          </h3>
          
          <Dropdown
            value={selectedAlgorithm}
            options={SHRED_ALGORITHMS}
            onChange={(e) => setSelectedAlgorithm(e.value)}
            optionLabel="name"
            className="w-full md:w-64"
            disabled={isShredding}
          />
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {selectedAlgorithm.description} ({t('features.shredder.passes')}: {selectedAlgorithm.passes})
          </p>
        </div>
      </Card>

      {/* File Drop Zone */}
      <Card className="shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileX className="w-5 h-5 text-red-500" />
            {t('features.shredder.addFiles')}
          </h3>
          
          <div
            className={`border-2 border-dashed ${isShredding ? 'border-gray-300' : 'border-purple-400'} rounded-lg p-12 text-center transition-colors ${
              isShredding ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              {isShredding ? t('features.shredder.shredding') : t('features.dragDrop.dropZone')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('features.shredder.dropHint')}
            </p>
          </div>
        </div>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className="shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t('features.shredder.filesToShred')} ({files.length})
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('common.totalSize')}: {formatBytes(totalSize)}
              </span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {files.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileX className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    
                    {!isShredding && (
                      <Button
                        icon="pi pi-times"
                        severity="secondary"
                        text
                        rounded
                        onClick={() => removeFile(file.id)}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      )}

      {/* Shredding Progress */}
      {isShredding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="w-6 h-6 text-red-500 animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium">{t('features.shredder.shredding')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentFile}</p>
                </div>
              </div>
              
              <ProgressBar 
                value={progress} 
                className="h-4"
                color="#ef4444"
              />
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {t('features.shredder.passInfo', { 
                  current: Math.ceil((progress / 100) * files.length * selectedAlgorithm.passes),
                  total: files.length * selectedAlgorithm.passes 
                })}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          label={isShredding ? t('features.shredder.shredding') : t('features.shredder.shredNow')}
          icon={isShredding ? "pi pi-spin pi-spinner" : "pi pi-trash"}
          severity="danger"
          size="large"
          className="px-8"
          disabled={files.length === 0 || isShredding}
          onClick={startShredding}
        />
      </div>
    </div>
  );
}