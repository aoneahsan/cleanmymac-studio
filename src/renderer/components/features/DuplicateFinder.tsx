import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, FileX, FolderOpen, CheckCircle } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';

interface DuplicateGroup {
  id: string;
  hash: string;
  files: FileInfo[];
  totalSize: number;
  duplicateCount: number;
}

interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  modified: Date;
  selected: boolean;
}

export function DuplicateFinder() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const { playSound } = useSoundEffect();

  // Mock scan for duplicates
  const scanForDuplicates = useProgressiveAction(
    async () => {
      playSound('scanStart');
      setIsScanning(true);
      setScanProgress(0);
      setDuplicateGroups([]);
      setSelectedGroups(new Set());

      // Simulate scanning process
      const mockDuplicates: DuplicateGroup[] = [];
      
      // Simulate finding duplicates
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setScanProgress((i + 1) * 20);

        const group: DuplicateGroup = {
          id: `group-${i}`,
          hash: `hash-${i}`,
          files: [
            {
              id: `file-${i}-1`,
              name: `Document-${i}.pdf`,
              path: `/Users/demo/Downloads/Document-${i}.pdf`,
              size: Math.floor(Math.random() * 10000000) + 1000000,
              modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              selected: false,
            },
            {
              id: `file-${i}-2`,
              name: `Document-${i} (Copy).pdf`,
              path: `/Users/demo/Desktop/Document-${i} (Copy).pdf`,
              size: Math.floor(Math.random() * 10000000) + 1000000,
              modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              selected: true,
            },
            {
              id: `file-${i}-3`,
              name: `Document-${i} (2).pdf`,
              path: `/Users/demo/Documents/Archive/Document-${i} (2).pdf`,
              size: Math.floor(Math.random() * 10000000) + 1000000,
              modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              selected: true,
            },
          ],
          totalSize: 0,
          duplicateCount: 3,
        };

        group.totalSize = group.files.reduce((sum, file) => sum + file.size, 0);
        mockDuplicates.push(group);
      }

      setDuplicateGroups(mockDuplicates);
      setIsScanning(false);
      setShowResultsDialog(true);
      playSound('scanComplete');

      const totalDuplicateSize = mockDuplicates.reduce(
        (sum, group) => sum + group.files.filter(f => f.selected).reduce((s, f) => s + f.size, 0),
        0
      );

      showNotification(
        'success',
        t('duplicates.found', {
          count: mockDuplicates.length,
          size: formatBytes(totalDuplicateSize),
        })
      );
    },
    {
      successMessage: t('duplicates.scanComplete'),
      errorMessage: t('duplicates.scanError'),
    }
  );

  const handleSelectGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleFileSelection = (groupId: string, fileId: string) => {
    setDuplicateGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            files: group.files.map(file => ({
              ...file,
              selected: file.id === fileId ? !file.selected : file.selected,
            })),
          };
        }
        return group;
      })
    );
  };

  const handleSmartSelection = () => {
    // Smart selection: keep newest file, select older duplicates
    playSound('click');
    setDuplicateGroups(prev =>
      prev.map(group => {
        const sortedFiles = [...group.files].sort((a, b) => 
          b.modified.getTime() - a.modified.getTime()
        );
        
        return {
          ...group,
          files: group.files.map(file => ({
            ...file,
            selected: file.id !== sortedFiles[0].id,
          })),
        };
      })
    );
    showNotification('info', t('duplicates.smartSelectionApplied'));
  };

  const getSelectedSize = () => {
    return duplicateGroups.reduce((total, group) => {
      return total + group.files.filter(f => f.selected).reduce((sum, f) => sum + f.size, 0);
    }, 0);
  };

  const getSelectedCount = () => {
    return duplicateGroups.reduce((total, group) => {
      return total + group.files.filter(f => f.selected).length;
    }, 0);
  };

  const rowExpansionTemplate = (data: DuplicateGroup) => {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800">
        <h4 className="font-semibold mb-3">{t('duplicates.filesInGroup')}</h4>
        <div className="space-y-2">
          {data.files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={file.selected}
                  onChange={() => handleFileSelection(data.id, file.id)}
                />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{file.path}</p>
                  <p className="text-xs text-gray-500">
                    {t('duplicates.modified')}: {file.modified.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Tag severity="info" value={formatBytes(file.size)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const actionTemplate = (rowData: DuplicateGroup) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-folder-open"
          severity="secondary"
          text
          tooltip={t('duplicates.showInFinder')}
          onClick={() => {
            playSound('click');
            // In real app, would open folder
            showNotification('info', 'Opening folder...');
          }}
        />
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-xl glass overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Copy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {t('duplicates.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{t('duplicates.description')}</p>
              </div>
            </div>
          </div>

          {!isScanning && duplicateGroups.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Search className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('duplicates.readyToScan')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('duplicates.scanDescription')}
              </p>
              <Button
                label={t('duplicates.startScan')}
                icon="pi pi-search"
                severity="warning"
                size="large"
                onClick={() => scanForDuplicates.execute()}
              />
            </motion.div>
          )}

          {isScanning && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-4">{t('duplicates.scanning')}</h3>
              <ProgressBar value={scanProgress} className="mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('duplicates.searchingForDuplicates')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Results Dialog */}
      <Dialog
        header={t('duplicates.results')}
        visible={showResultsDialog}
        onHide={() => setShowResultsDialog(false)}
        className="w-full max-w-6xl"
        breakpoints={{ '768px': '90vw' }}
      >
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-orange-50 dark:bg-orange-900/20">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {duplicateGroups.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('duplicates.groupsFound')}
                </p>
              </div>
            </Card>
            <Card className="bg-red-50 dark:bg-red-900/20">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {getSelectedCount()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('duplicates.filesSelected')}
                </p>
              </div>
            </Card>
            <Card className="bg-green-50 dark:bg-green-900/20">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatBytes(getSelectedSize())}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('duplicates.potentialSavings')}
                </p>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              label={t('duplicates.smartSelection')}
              icon="pi pi-bolt"
              severity="info"
              onClick={handleSmartSelection}
            />
          </div>

          {/* Duplicates Table */}
          <DataTable
            value={duplicateGroups}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"
            className="p-datatable-striped"
          >
            <Column expander style={{ width: '3em' }} />
            <Column 
              field="files[0].name" 
              header={t('duplicates.fileName')}
              body={(rowData) => rowData.files[0].name}
            />
            <Column 
              field="duplicateCount" 
              header={t('duplicates.copies')}
              body={(rowData) => (
                <Tag severity="warning" value={`${rowData.duplicateCount} ${t('duplicates.files')}`} />
              )}
            />
            <Column 
              field="totalSize" 
              header={t('duplicates.totalSize')}
              body={(rowData) => <span className="font-mono">{formatBytes(rowData.totalSize)}</span>}
            />
            <Column body={actionTemplate} style={{ width: '8rem' }} />
          </DataTable>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('duplicates.reviewBeforeDeleting')}
            </p>
            <div className="flex gap-2">
              <Button
                label={t('common.cancel')}
                severity="secondary"
                onClick={() => setShowResultsDialog(false)}
              />
              <Button
                label={t('duplicates.cleanSelected')}
                icon="pi pi-trash"
                severity="danger"
                disabled={getSelectedCount() === 0}
                onClick={() => {
                  playSound('success');
                  showNotification('success', t('duplicates.cleaned'));
                  setShowResultsDialog(false);
                  setDuplicateGroups([]);
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}