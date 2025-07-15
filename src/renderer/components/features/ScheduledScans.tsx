import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { motion } from 'framer-motion';
import { Clock, Plus, Trash2, Edit2, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useSoundEffect } from '@renderer/lib/soundEffects';
import { showNotification } from '@renderer/lib/notifications';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScheduledScan {
  id: string;
  name: string;
  type: 'smart' | 'system' | 'privacy' | 'duplicates';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: Date;
  daysOfWeek?: number[]; // For weekly scans
  dayOfMonth?: number; // For monthly scans
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  notifications: boolean;
}

interface ScheduledScansStore {
  scans: ScheduledScan[];
  addScan: (scan: Omit<ScheduledScan, 'id' | 'nextRun'>) => void;
  updateScan: (id: string, updates: Partial<ScheduledScan>) => void;
  deleteScan: (id: string) => void;
  toggleScan: (id: string) => void;
}

const useScheduledScansStore = create<ScheduledScansStore>()(
  persist(
    (set) => ({
      scans: [],
      addScan: (scan) =>
        set((state) => ({
          scans: [
            ...state.scans,
            {
              ...scan,
              id: Date.now().toString(),
              nextRun: calculateNextRun(scan),
            },
          ],
        })),
      updateScan: (id, updates) =>
        set((state) => ({
          scans: state.scans.map((scan) =>
            scan.id === id
              ? { ...scan, ...updates, nextRun: calculateNextRun({ ...scan, ...updates }) }
              : scan
          ),
        })),
      deleteScan: (id) =>
        set((state) => ({
          scans: state.scans.filter((scan) => scan.id !== id),
        })),
      toggleScan: (id) =>
        set((state) => ({
          scans: state.scans.map((scan) =>
            scan.id === id ? { ...scan, enabled: !scan.enabled } : scan
          ),
        })),
    }),
    {
      name: 'scheduled-scans',
    }
  )
);

function calculateNextRun(scan: Partial<ScheduledScan>): Date {
  const now = new Date();
  const baseTime = scan.time || new Date();
  
  let nextRun = new Date(now);
  nextRun.setHours(baseTime.getHours());
  nextRun.setMinutes(baseTime.getMinutes());
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);

  if (nextRun <= now) {
    switch (scan.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }

  return nextRun;
}

export function ScheduledScans() {
  const { scans, addScan, updateScan, deleteScan, toggleScan } = useScheduledScansStore();
  const { playSound } = useSoundEffect();
  const [showDialog, setShowDialog] = useState(false);
  const [editingScan, setEditingScan] = useState<ScheduledScan | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ScheduledScan['type']>('smart');
  const [frequency, setFrequency] = useState<ScheduledScan['frequency']>('daily');
  const [time, setTime] = useState<Date>(new Date());
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // Monday by default
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [notifications, setNotifications] = useState(true);

  const scanTypes = [
    { label: t('schedules.smartScan'), value: 'smart', icon: 'pi-bolt' },
    { label: t('schedules.systemScan'), value: 'system', icon: 'pi-desktop' },
    { label: t('schedules.privacyScan'), value: 'privacy', icon: 'pi-shield' },
    { label: t('schedules.duplicatesScan'), value: 'duplicates', icon: 'pi-copy' },
  ];

  const frequencies = [
    { label: t('schedules.daily'), value: 'daily' },
    { label: t('schedules.weekly'), value: 'weekly' },
    { label: t('schedules.monthly'), value: 'monthly' },
  ];

  const weekDays = [
    { label: t('schedules.monday'), value: 1 },
    { label: t('schedules.tuesday'), value: 2 },
    { label: t('schedules.wednesday'), value: 3 },
    { label: t('schedules.thursday'), value: 4 },
    { label: t('schedules.friday'), value: 5 },
    { label: t('schedules.saturday'), value: 6 },
    { label: t('schedules.sunday'), value: 0 },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      showNotification('warning', t('schedules.nameRequired'));
      return;
    }

    const scanData = {
      name,
      type,
      frequency,
      time,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      enabled: true,
      notifications,
    };

    if (editingScan) {
      updateScan(editingScan.id, scanData);
      showNotification('success', t('schedules.updated'));
    } else {
      addScan(scanData);
      showNotification('success', t('schedules.created'));
    }

    playSound('success');
    resetForm();
    setShowDialog(false);
  };

  const resetForm = () => {
    setName('');
    setType('smart');
    setFrequency('daily');
    setTime(new Date());
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setNotifications(true);
    setEditingScan(null);
  };

  const handleEdit = (scan: ScheduledScan) => {
    setEditingScan(scan);
    setName(scan.name);
    setType(scan.type);
    setFrequency(scan.frequency);
    setTime(scan.time);
    setDaysOfWeek(scan.daysOfWeek || [1]);
    setDayOfMonth(scan.dayOfMonth || 1);
    setNotifications(scan.notifications);
    setShowDialog(true);
  };

  const typeTemplate = (scan: ScheduledScan) => {
    const typeInfo = scanTypes.find(t => t.value === scan.type);
    return (
      <div className="flex items-center gap-2">
        <i className={`pi ${typeInfo?.icon} text-lg`} />
        <span>{typeInfo?.label}</span>
      </div>
    );
  };

  const scheduleTemplate = (scan: ScheduledScan) => {
    const timeStr = scan.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let scheduleStr = '';

    switch (scan.frequency) {
      case 'daily':
        scheduleStr = t('schedules.everyDayAt', { time: timeStr });
        break;
      case 'weekly':
        const days = scan.daysOfWeek?.map(d => 
          weekDays.find(wd => wd.value === d)?.label
        ).join(', ');
        scheduleStr = t('schedules.everyWeekOn', { days, time: timeStr });
        break;
      case 'monthly':
        scheduleStr = t('schedules.everyMonthOn', { day: scan.dayOfMonth, time: timeStr });
        break;
    }

    return <span className="text-sm">{scheduleStr}</span>;
  };

  const nextRunTemplate = (scan: ScheduledScan) => {
    const isOverdue = scan.nextRun < new Date() && scan.enabled;
    return (
      <Tag 
        severity={isOverdue ? 'warning' : 'info'} 
        value={scan.nextRun.toLocaleString()} 
      />
    );
  };

  const actionTemplate = (scan: ScheduledScan) => {
    return (
      <div className="flex items-center gap-2">
        <InputSwitch
          checked={scan.enabled}
          onChange={() => {
            toggleScan(scan.id);
            playSound('click');
          }}
        />
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          onClick={() => handleEdit(scan)}
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          onClick={() => {
            deleteScan(scan.id);
            playSound('success');
            showNotification('info', t('schedules.deleted'));
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {t('schedules.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{t('schedules.description')}</p>
              </div>
            </div>
            <Button
              label={t('schedules.addSchedule')}
              icon="pi pi-plus"
              severity="info"
              onClick={() => {
                resetForm();
                setShowDialog(true);
              }}
            />
          </div>

          {scans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <CalendarIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('schedules.noSchedules')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('schedules.noSchedulesDesc')}
              </p>
            </motion.div>
          ) : (
            <DataTable value={scans} className="p-datatable-striped">
              <Column field="name" header={t('schedules.name')} />
              <Column header={t('schedules.type')} body={typeTemplate} />
              <Column header={t('schedules.schedule')} body={scheduleTemplate} />
              <Column header={t('schedules.nextRun')} body={nextRunTemplate} />
              <Column header={t('schedules.actions')} body={actionTemplate} style={{ width: '200px' }} />
            </DataTable>
          )}
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingScan ? t('schedules.editSchedule') : t('schedules.newSchedule')}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        className="w-full max-w-lg"
        breakpoints={{ '768px': '90vw' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('schedules.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder={t('schedules.namePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('schedules.scanType')}</label>
            <Dropdown
              value={type}
              options={scanTypes}
              onChange={(e) => setType(e.value)}
              className="w-full"
              optionLabel="label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('schedules.frequency')}</label>
            <Dropdown
              value={frequency}
              options={frequencies}
              onChange={(e) => setFrequency(e.value)}
              className="w-full"
              optionLabel="label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('schedules.time')}</label>
            <Calendar
              value={time}
              onChange={(e) => setTime(e.value as Date)}
              timeOnly
              hourFormat="24"
              className="w-full"
            />
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('schedules.daysOfWeek')}</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <Chip
                    key={day.value}
                    label={day.label}
                    className={`cursor-pointer ${
                      daysOfWeek.includes(day.value)
                        ? 'p-chip-selected bg-blue-500 text-white'
                        : ''
                    }`}
                    onClick={() => {
                      if (daysOfWeek.includes(day.value)) {
                        setDaysOfWeek(daysOfWeek.filter(d => d !== day.value));
                      } else {
                        setDaysOfWeek([...daysOfWeek, day.value]);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('schedules.dayOfMonth')}</label>
              <input
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                min="1"
                max="31"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="text-sm">{t('schedules.enableNotifications')}</span>
            </div>
            <InputSwitch
              checked={notifications}
              onChange={(e) => setNotifications(e.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              label={t('common.cancel')}
              severity="secondary"
              onClick={() => setShowDialog(false)}
            />
            <Button
              label={t('common.save')}
              icon="pi pi-check"
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}