'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceStore } from '@/features/workspace/store';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts/KeyboardShortcutsDialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Workspaces', href: '/dashboard/workspaces', icon: '🏢' },
  { label: 'Projects', href: '/dashboard/projects', icon: '📁' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
  { label: 'Documents', href: '/dashboard/documents', icon: '📄' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
  { label: 'Time', href: '/dashboard/time-tracking', icon: '⏱️' },
];

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNavigate = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="border-b align-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl font-bold shrink-0 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Flow
              </span>
              {currentWorkspace && (
                <span className="text-sm text-muted-foreground truncate hidden sm:block">
                  / {currentWorkspace.name}
                </span>
              )}
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="gap-1.5"
                >
                  <span className="hidden lg:inline">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-muted-foreground hidden lg:inline">Search</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <ThemeToggle />
            <KeyboardShortcutsDialog />

            {user && <NotificationBell userId={user.id} />}

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Avatar className="h-8 w-8">
                    {user?.user_metadata?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.username || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium">
                        {(user?.user_metadata?.username || user?.email)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.user_metadata?.username || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/settings')}
                  className="gap-2"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile navigation menu */}
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => handleNavigate(item.href)}
                    className="gap-2"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCommandPaletteOpen(true);
                  }}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  );
}
