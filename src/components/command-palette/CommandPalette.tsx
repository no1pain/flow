'use client';

import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Settings,
  Plus,
  BarChart3,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [input, setInput] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onOpenChange(false);
    setInput('');
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'workspaces',
      label: 'Go to Workspaces',
      icon: Users,
      path: '/dashboard/workspaces',
    },
    {
      id: 'projects',
      label: 'Go to Projects',
      icon: FolderKanban,
      path: '/dashboard/projects',
    },
    {
      id: 'tasks',
      label: 'Go to Tasks',
      icon: CheckSquare,
      path: '/dashboard/projects',
    },
    {
      id: 'documents',
      label: 'Go to Documents',
      icon: FileText,
      path: '/dashboard/documents',
    },
    {
      id: 'analytics',
      label: 'Go to Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
    },
  ];

  const actionItems = [
    {
      id: 'new-task',
      label: 'Create New Task',
      icon: Plus,
      action: () => handleNavigate('/dashboard/projects'),
    },
    {
      id: 'new-project',
      label: 'Create New Project',
      icon: FolderKanban,
      action: () => handleNavigate('/dashboard/projects'),
    },
    {
      id: 'new-document',
      label: 'Create New Document',
      icon: FileText,
      action: () => handleNavigate('/dashboard/documents'),
    },
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => handleNavigate('/dashboard/settings'),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={input}
        onValueChange={setInput}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem key={item.id} onSelect={() => handleNavigate(item.path)}>
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem key={item.id} onSelect={item.action}>
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Settings">
          {settingsItems.map((item) => (
            <CommandItem key={item.id} onSelect={item.action}>
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Press</span>
        <kbd className="mx-1">⌘K</kbd>
        <span>to open</span>
      </div>
    </CommandDialog>
  );
}
