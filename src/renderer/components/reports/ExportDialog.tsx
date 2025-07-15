import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { exportReport, ExportFormat } from '@renderer/lib/exportReports';
import { t } from '@renderer/lib/i18n-simple';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { showNotification } from '@renderer/lib/notifications';
import { useSoundEffect } from '@renderer/lib/soundEffects';

interface ExportDialogProps {
  visible: boolean;
  onHide: () => void;
}

export function ExportDialog({ visible, onHide }: ExportDialogProps) {
  const { playSound } = useSoundEffect();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [includeScans, setIncludeScans] = useState(true);
  const [includeCleanups, setIncludeCleanups] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Best for printing and sharing' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Best for data analysis' },
    { value: 'csv', label: 'CSV File', icon: FileText, description: 'Simple format for data import' },
    { value: 'json', label: 'JSON Data', icon: FileJson, description: 'Raw data for developers' },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      playSound('click');

      const options = {
        format,
        dateRange: dateRange.length === 2 ? {
          from: dateRange[0],
          to: dateRange[1],
        } : undefined,
        includeScans,
        includeCleanups,
        includeStats,
      };

      await exportReport(options);
      
      showNotification('success', t('export.success'));
      playSound('success');
      onHide();
    } catch (error) {
      showNotification('error', t('export.error'));
      playSound('error');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label={t('common.cancel')}
        severity="secondary"
        onClick={onHide}
        disabled={isExporting}
      />
      <Button
        label={t('export.export')}
        icon="pi pi-download"
        onClick={handleExport}
        loading={isExporting}
        disabled={!includeScans && !includeCleanups && !includeStats}
      />
    </div>
  );

  return (
    <Dialog
      header={t('export.title')}
      visible={visible}
      onHide={onHide}
      footer={footer}
      className="w-full max-w-2xl"
      breakpoints={{ '768px': '90vw' }}
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('export.selectFormat')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <label
                  key={fmt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    format === fmt.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <RadioButton
                    value={fmt.value}
                    checked={format === fmt.value}
                    onChange={(e) => setFormat(e.value as ExportFormat)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Icon className="w-4 h-4" />
                      {fmt.label}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {fmt.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('export.dateRange')}</h3>
          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value as Date[])}
            selectionMode="range"
            dateFormat="mm/dd/yy"
            showIcon
            placeholder={t('export.selectDateRange')}
            className="w-full"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('export.dateRangeHint')}
          </p>
        </div>

        {/* Content Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('export.includeData')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <Checkbox
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.checked ?? false)}
              />
              <div>
                <div className="font-medium">{t('export.includeSummary')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('export.includeSummaryDesc')}
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <Checkbox
                checked={includeScans}
                onChange={(e) => setIncludeScans(e.checked ?? false)}
              />
              <div>
                <div className="font-medium">{t('export.includeScans')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('export.includeScansDesc')}
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <Checkbox
                checked={includeCleanups}
                onChange={(e) => setIncludeCleanups(e.checked ?? false)}
              />
              <div>
                <div className="font-medium">{t('export.includeCleanups')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('export.includeCleanupsDesc')}
                </p>
              </div>
            </label>
          </div>
        </div>

        {!includeScans && !includeCleanups && !includeStats && (
          <Message
            severity="warn"
            text={t('export.selectAtLeastOne')}
          />
        )}
      </div>
    </Dialog>
  );
}