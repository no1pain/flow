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
