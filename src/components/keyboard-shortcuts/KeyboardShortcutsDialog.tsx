'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
      <DialogTrigger className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 size-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
        <Keyboard className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
