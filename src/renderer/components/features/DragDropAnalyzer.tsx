import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Folder, X, Search, AlertCircle } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

interface AnalysisResult {
  file: FileInfo;
  category: 'cache' | 'temp' | 'log' | 'download' | 'other';
  canBeDeleted: boolean;
  reason: string;
}

export function DragDropAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { playSound } = useSoundEffect();

  const analyzeFile = (file: File): AnalysisResult => {
    // Simple analysis logic - in real app, this would be more sophisticated
    const fileInfo: FileInfo = {
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified),
    };

    let category: AnalysisResult['category'] = 'other';
    let canBeDeleted = false;
    let reason = '';

    // Categorize based on file extension and path
    const ext = file.name.split('.').pop()?.toLowerCase();
    const nameLower = file.name.toLowerCase();

    if (ext === 'log' || nameLower.includes('log')) {
      category = 'log';
      canBeDeleted = true;
      reason = 'Log file that can be safely removed';
    } else if (ext === 'tmp' || ext === 'temp' || nameLower.includes('temp')) {
      category = 'temp';
      canBeDeleted = true;
      reason = 'Temporary file that is no longer needed';
    } else if (nameLower.includes('cache')) {
      category = 'cache';
      canBeDeleted = true;
      reason = 'Cache file that can be regenerated';
    } else if (file.webkitRelativePath?.includes('Downloads/')) {
      category = 'download';
      canBeDeleted = false;
      reason = 'Downloaded file - review before deleting';
    } else {
      category = 'other';
      canBeDeleted = false;
      reason = 'User file - manual review recommended';
    }

    return {
      file: fileInfo,
      category,
      canBeDeleted,
      reason,
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    playSound('click');
    setFiles(acceptedFiles.map(f => ({
      name: f.name,
      path: f.webkitRelativePath || f.name,
      size: f.size,
      type: f.type || 'unknown',
      lastModified: new Date(f.lastModified),
    })));
    
    setShowDialog(true);
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults([]);

    // Analyze files
    const results: AnalysisResult[] = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const result = analyzeFile(file);
      results.push(result);
      
      // Update progress
      setProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
      
      // Small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setAnalysisResults(results);
    setIsAnalyzing(false);
    playSound('scanComplete');
    
    // Show summary notification
    const deletableCount = results.filter(r => r.canBeDeleted).length;
    const totalSize = results
      .filter(r => r.canBeDeleted)
      .reduce((sum, r) => sum + r.file.size, 0);
    
    showNotification(
      'info',
      t('dragDrop.analysisComplete', {
        count: deletableCount,
        size: formatBytes(totalSize),
      })
    );
  }, [playSound]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false,
  });

  const categoryTemplate = (row: AnalysisResult) => {
    const severity = {
      cache: 'warning',
      temp: 'warning',
      log: 'info',
      download: 'success',
      other: 'secondary',
    } as const;

    return <Tag severity={severity[row.category]} value={row.category} />;
  };

  const sizeTemplate = (row: AnalysisResult) => {
    return <span className="font-mono">{formatBytes(row.file.size)}</span>;
  };

  const canDeleteTemplate = (row: AnalysisResult) => {
    return row.canBeDeleted ? (
      <Tag severity="success" icon="pi pi-check" value={t('common.yes')} />
    ) : (
      <Tag severity="danger" icon="pi pi-times" value={t('common.no')} />
    );
  };

  const getSummaryStats = () => {
    const deletable = analysisResults.filter(r => r.canBeDeleted);
    const totalSize = deletable.reduce((sum, r) => sum + r.file.size, 0);
    
    return {
      total: analysisResults.length,
      deletable: deletable.length,
      size: totalSize,
    };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-xl glass overflow-hidden">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-300 
              ${isDragActive 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <motion.div
              animate={{
                scale: isDragActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="mx-auto w-24 h-24 mb-6 relative">
                <motion.div
                  animate={{
                    y: isDragActive ? -10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Upload className="w-24 h-24 text-purple-500" />
                </motion.div>
                {isDragActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-ping" />
                  </motion.div>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isDragActive ? t('dragDrop.dropNow') : t('dragDrop.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('dragDrop.description')}
              </p>
              <Button
                label={t('dragDrop.selectFiles')}
                icon="pi pi-folder-open"
                severity="secondary"
                outlined
              />
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Analysis Results Dialog */}
      <Dialog
        header={t('dragDrop.analysisResults')}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        className="w-full max-w-4xl"
        breakpoints={{ '768px': '90vw' }}
      >
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-4">{t('dragDrop.analyzing')}</h3>
              <ProgressBar value={progress} className="mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('dragDrop.analyzingFiles', { count: files.length })}
              </p>
            </div>
          ) : analysisResults.length > 0 && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {getSummaryStats().total}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dragDrop.totalFiles')}
                    </p>
                  </div>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getSummaryStats().deletable}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dragDrop.canBeDeleted')}
                    </p>
                  </div>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatBytes(getSummaryStats().size)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dragDrop.potentialSpace')}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Results Table */}
              <DataTable
                value={analysisResults}
                paginator
                rows={10}
                className="p-datatable-striped"
              >
                <Column field="file.name" header={t('dragDrop.fileName')} sortable />
                <Column field="category" header={t('dragDrop.category')} body={categoryTemplate} sortable />
                <Column field="file.size" header={t('dragDrop.size')} body={sizeTemplate} sortable />
                <Column field="canBeDeleted" header={t('dragDrop.safe')} body={canDeleteTemplate} />
                <Column field="reason" header={t('dragDrop.reason')} />
              </DataTable>

              <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('dragDrop.disclaimer')}
                </p>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}