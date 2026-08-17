'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', 'D'], description: 'Go to dashboard' },
  { keys: ['⌘', 'W'], description: 'Go to workspaces' },
  { keys: ['⌘', 'P'], description: 'Go to projects' },
  { keys: ['⌘', 'T'], description: 'Go to tasks' },
  { keys: ['⌘', 'O'], description: 'Go to documents' },
  { keys: ['⌘', 'A'], description: 'Go to analytics' },
  { keys: ['⌘', '⇧', 'P'], description: 'Create new project' },
  { keys: ['⌘', '⇧', 'D'], description: 'Create new document' },
  { keys: ['⌘', 'N'], description: 'Create new task' },
  { keys: ['ESC'], description: 'Close modal/dialog' },
];

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">{key}</kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground self-center">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
