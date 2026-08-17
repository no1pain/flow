'use client';

import { useEffect } from 'react';

interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  enabled?: boolean;
}

function matchesHotkey(event: KeyboardEvent, hotkey: string) {
  const parts = hotkey.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const wantsMeta = parts.includes('meta') || parts.includes('cmd');
  const wantsCtrl = parts.includes('ctrl');
  const wantsShift = parts.includes('shift');
  const wantsAlt = parts.includes('alt');

  const eventKey = event.key.toLowerCase();
  const keyMatches = eventKey === key || event.code.toLowerCase() === `key${key}`;
  const metaMatches = wantsMeta ? event.metaKey || event.ctrlKey : !event.metaKey;
  const ctrlMatches = wantsCtrl ? event.ctrlKey : !event.ctrlKey || wantsMeta;
  const shiftMatches = event.shiftKey === wantsShift;
  const altMatches = event.altKey === wantsAlt;

  return keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches;
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const { key, action, enabled = true } of shortcuts) {
        if (enabled && matchesHotkey(event, key)) {
          event.preventDefault();
          action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const defaultShortcuts: ShortcutAction[] = [
  {
    key: 'meta+k',
    description: 'Open command palette',
    action: () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: true,
      });
      document.dispatchEvent(event);
    },
  },
  {
    key: 'meta+d',
    description: 'Go to dashboard',
    action: () => {
      window.location.href = '/dashboard';
    },
  },
  {
    key: 'meta+w',
    description: 'Go to workspaces',
    action: () => {
      window.location.href = '/dashboard/workspaces';
    },
  },
  {
    key: 'meta+p',
    description: 'Go to projects',
    action: () => {
      window.location.href = '/dashboard/projects';
    },
  },
  {
    key: 'meta+t',
    description: 'Go to tasks',
    action: () => {
      window.location.href = '/dashboard/projects';
    },
  },
  {
    key: 'meta+o',
    description: 'Go to documents',
    action: () => {
      window.location.href = '/dashboard/documents';
    },
  },
  {
    key: 'meta+shift+p',
    description: 'Create new project',
    action: () => {
      window.location.href = '/dashboard/projects';
    },
  },
  {
    key: 'meta+shift+d',
    description: 'Create new document',
    action: () => {
      window.location.href = '/dashboard/documents';
    },
  },
  {
    key: 'escape',
    description: 'Close modal/dialog',
    action: () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    },
  },
];
