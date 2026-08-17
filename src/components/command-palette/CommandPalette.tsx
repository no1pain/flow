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
      shortcut: '⌘D',
    },
    {
      id: 'workspaces',
      label: 'Go to Workspaces',
      icon: Users,
      path: '/dashboard/workspaces',
      shortcut: '⌘W',
    },
    {
      id: 'projects',
      label: 'Go to Projects',
      icon: FolderKanban,
      path: '/dashboard/projects',
      shortcut: '⌘P',
    },
    {
      id: 'tasks',
      label: 'Go to Tasks',
      icon: CheckSquare,
      path: '/dashboard/projects',
      shortcut: '⌘T',
    },
    {
      id: 'documents',
      label: 'Go to Documents',
      icon: FileText,
      path: '/dashboard/documents',
      shortcut: '⌘O',
    },
    {
      id: 'analytics',
      label: 'Go to Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
      shortcut: '⌘A',
    },
  ];

  const actionItems = [
    {
      id: 'new-task',
      label: 'Create New Task',
      icon: Plus,
      action: () => handleNavigate('/dashboard/projects'),
      shortcut: '⌘N',
    },
    {
      id: 'new-project',
      label: 'Create New Project',
      icon: FolderKanban,
      action: () => handleNavigate('/dashboard/projects'),
      shortcut: '⌘⇧P',
    },
    {
      id: 'new-document',
      label: 'Create New Document',
      icon: FileText,
      action: () => handleNavigate('/dashboard/documents'),
      shortcut: '⌘⇧D',
    },
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => handleNavigate('/dashboard/settings'),
      shortcut: '⌘,',
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
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <kbd className="ml-auto text-xs opacity-60">{item.shortcut}</kbd>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem key={item.id} onSelect={item.action}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <kbd className="ml-auto text-xs opacity-60">{item.shortcut}</kbd>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Settings">
          {settingsItems.map((item) => (
            <CommandItem key={item.id} onSelect={item.action}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <kbd className="ml-auto text-xs opacity-60">{item.shortcut}</kbd>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
