import { useHistoryStore } from '@renderer/stores/historyStore';
import { useAuthStore } from '@renderer/stores/authStore';
import { formatBytes } from '@renderer/lib/utils';
import { t } from '@renderer/lib/i18n-simple';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    from: Date;
    to: Date;
  };
  includeScans?: boolean;
  includeCleanups?: boolean;
  includeStats?: boolean;
}

export async function exportReport(options: ExportOptions) {
  const { user } = useAuthStore.getState();
  const { scanHistory, cleanupHistory, getUserStats } = useHistoryStore.getState();
  const stats = getUserStats();

  // Filter data by date range if provided
  const filterByDate = (items: any[]) => {
    if (!options.dateRange) return items;
    const { from, to } = options.dateRange;
    return items.filter(item => {
      const date = new Date(item.timestamp);
      return date >= from && date <= to;
    });
  };

  const filteredScans = options.includeScans ? filterByDate(scanHistory) : [];
  const filteredCleanups = options.includeCleanups ? filterByDate(cleanupHistory) : [];

  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      user: user?.email,
      appName: t('app.name'),
      reportPeriod: options.dateRange ? {
        from: options.dateRange.from.toISOString(),
        to: options.dateRange.to.toISOString(),
      } : 'All time',
    },
    summary: options.includeStats ? {
      totalSpaceFreed: formatBytes(stats.totalSpaceFreed),
      totalScans: stats.totalScans,
      totalCleanups: stats.totalCleanups,
      averageSpacePerCleanup: formatBytes(stats.averageSpacePerCleanup),
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    } : undefined,
    scans: filteredScans,
    cleanups: filteredCleanups,
  };

  switch (options.format) {
    case 'pdf':
      return exportToPDF(reportData);
    case 'excel':
      return exportToExcel(reportData);
    case 'csv':
      return exportToCSV(reportData);
    case 'json':
      return exportToJSON(reportData);
  }
}

function exportToPDF(data: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(147, 51, 234); // Purple color
  doc.text(t('app.name') + ' - Cleaning Report', pageWidth / 2, 20, { align: 'center' });
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}`, 14, 30);
  doc.text(`User: ${data.metadata.user}`, 14, 35);
  
  let yPos = 45;
  
  // Summary Section
  if (data.summary) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, yPos);
    yPos += 10;
    
    const summaryData = [
      ['Total Space Freed', data.summary.totalSpaceFreed],
      ['Total Scans', data.summary.totalScans.toString()],
      ['Total Cleanups', data.summary.totalCleanups.toString()],
      ['Average Space per Cleanup', data.summary.averageSpacePerCleanup],
      ['Current Streak', `${data.summary.currentStreak} days`],
      ['Longest Streak', `${data.summary.longestStreak} days`],
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Scans Section
  if (data.scans.length > 0) {
    doc.setFontSize(14);
    doc.text('Scan History', 14, yPos);
    yPos += 10;
    
    const scanData = data.scans.map((scan: any) => [
      new Date(scan.timestamp).toLocaleString(),
      scan.type,
      formatBytes(scan.totalJunkFound),
      `${scan.duration}s`,
      scan.status,
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Type', 'Junk Found', 'Duration', 'Status']],
      body: scanData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Cleanups Section
  if (data.cleanups.length > 0 && yPos < 250) {
    doc.setFontSize(14);
    doc.text('Cleanup History', 14, yPos);
    yPos += 10;
    
    const cleanupData = data.cleanups.map((cleanup: any) => [
      new Date(cleanup.timestamp).toLocaleString(),
      formatBytes(cleanup.totalCleaned),
      `${cleanup.duration}s`,
      cleanup.status,
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Space Cleaned', 'Duration', 'Status']],
      body: cleanupData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });
  }
  
  // Save the PDF
  const filename = `cleanmymac-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function exportToExcel(data: any) {
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  if (data.summary) {
    const summaryData = [
      ['CleanMyMac Pro+ Report'],
      ['Generated', new Date(data.metadata.generatedAt).toLocaleString()],
      ['User', data.metadata.user],
      [''],
      ['Summary'],
      ['Total Space Freed', data.summary.totalSpaceFreed],
      ['Total Scans', data.summary.totalScans],
      ['Total Cleanups', data.summary.totalCleanups],
      ['Average Space per Cleanup', data.summary.averageSpacePerCleanup],
      ['Current Streak', `${data.summary.currentStreak} days`],
      ['Longest Streak', `${data.summary.longestStreak} days`],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  }
  
  // Scans Sheet
  if (data.scans.length > 0) {
    const scanHeaders = ['Date', 'Type', 'Total Junk Found', 'Duration (s)', 'Status'];
    const scanData = data.scans.map((scan: any) => [
      new Date(scan.timestamp).toLocaleString(),
      scan.type,
      formatBytes(scan.totalJunkFound),
      scan.duration,
      scan.status,
    ]);
    
    const scanSheet = XLSX.utils.aoa_to_sheet([scanHeaders, ...scanData]);
    XLSX.utils.book_append_sheet(wb, scanSheet, 'Scans');
  }
  
  // Cleanups Sheet
  if (data.cleanups.length > 0) {
    const cleanupHeaders = ['Date', 'Total Cleaned', 'Duration (s)', 'Status'];
    const cleanupData = data.cleanups.map((cleanup: any) => [
      new Date(cleanup.timestamp).toLocaleString(),
      formatBytes(cleanup.totalCleaned),
      cleanup.duration,
      cleanup.status,
    ]);
    
    const cleanupSheet = XLSX.utils.aoa_to_sheet([cleanupHeaders, ...cleanupData]);
    XLSX.utils.book_append_sheet(wb, cleanupSheet, 'Cleanups');
  }
  
  // Save the Excel file
  const filename = `cleanmymac-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

function exportToCSV(data: any) {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push('CleanMyMac Pro+ Report');
  csvRows.push(`Generated,${new Date(data.metadata.generatedAt).toISOString()}`);
  csvRows.push(`User,${data.metadata.user}`);
  csvRows.push('');
  
  // Add summary if included
  if (data.summary) {
    csvRows.push('Summary');
    csvRows.push(`Total Space Freed,${data.summary.totalSpaceFreed}`);
    csvRows.push(`Total Scans,${data.summary.totalScans}`);
    csvRows.push(`Total Cleanups,${data.summary.totalCleanups}`);
    csvRows.push(`Average Space per Cleanup,${data.summary.averageSpacePerCleanup}`);
    csvRows.push(`Current Streak,${data.summary.currentStreak} days`);
    csvRows.push(`Longest Streak,${data.summary.longestStreak} days`);
    csvRows.push('');
  }
  
  // Add scans if included
  if (data.scans.length > 0) {
    csvRows.push('Scan History');
    csvRows.push('Date,Type,Total Junk Found,Duration,Status');
    data.scans.forEach((scan: any) => {
      csvRows.push([
        new Date(scan.timestamp).toISOString(),
        scan.type,
        scan.totalJunkFound,
        `${scan.duration}s`,
        scan.status,
      ].join(','));
    });
    csvRows.push('');
  }
  
  // Add cleanups if included
  if (data.cleanups.length > 0) {
    csvRows.push('Cleanup History');
    csvRows.push('Date,Total Cleaned,Duration,Status');
    data.cleanups.forEach((cleanup: any) => {
      csvRows.push([
        new Date(cleanup.timestamp).toISOString(),
        cleanup.totalCleaned,
        `${cleanup.duration}s`,
        cleanup.status,
      ].join(','));
    });
  }
  
  // Create and download CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cleanmymac-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToJSON(data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cleanmymac-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}