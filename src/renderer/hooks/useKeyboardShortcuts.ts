import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@renderer/stores/authStore';
import { showNotification } from '@renderer/lib/notifications';
import { t } from '@renderer/lib/i18n-simple';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 's',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        navigate({ to: '/smart-scan' });
        showNotification('info', t('shortcuts.navigatingToSmartScan'));
      },
      description: t('shortcuts.smartScan'),
    },
    {
      key: 'h',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        navigate({ to: '/history' });
        showNotification('info', t('shortcuts.navigatingToHistory'));
      },
      description: t('shortcuts.viewHistory'),
    },
    {
      key: ',',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        navigate({ to: '/settings' });
        showNotification('info', t('shortcuts.navigatingToSettings'));
      },
      description: t('shortcuts.openSettings'),
    },
    {
      key: 'q',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        if (window.electron) {
          window.electron.quit();
        } else {
          // For web version, logout
          logout();
          showNotification('info', t('shortcuts.loggingOut'));
        }
      },
      description: t('shortcuts.quit'),
    },
    {
      key: 'r',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        window.location.reload();
      },
      description: t('shortcuts.refresh'),
    },
    {
      key: 'd',
      metaKey: isMac,
      ctrlKey: !isMac,
      action: () => {
        navigate({ to: '/dashboard' });
        showNotification('info', t('shortcuts.navigatingToDashboard'));
      },
      description: t('shortcuts.dashboard'),
    },
    {
      key: '/',
      action: () => {
        // Focus search if available
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          showNotification('info', t('shortcuts.searchFocused'));
        }
      },
      description: t('shortcuts.focusSearch'),
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dialogs
        const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      },
      description: t('shortcuts.closeModal'),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const matchesMeta = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, logout]);

  return { shortcuts, isMac };
}

// Global keyboard shortcuts that should work on all pages
export function useGlobalKeyboardShortcuts() {
  useKeyboardShortcuts();
}