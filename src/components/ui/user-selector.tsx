'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { authService, type UserProfile } from '@/features/auth/services';
import { cn } from '@/lib/utils';

interface UserSelectorProps {
  value?: UserProfile | null;
  onChange: (user: UserProfile | null) => void;
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function UserSelector({
  value,
  onChange,
  excludeIds = [],
  placeholder = 'Search users...',
  disabled = false,
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        // Load initial users when opened
        if (isOpen) {
          setIsLoading(true);
          try {
            const allUsers = await authService.getAllUsers(20);
            setUsers(allUsers.filter((u) => !excludeIds.includes(u.id)));
          } catch (error) {
            console.error('Failed to load users:', error);
          } finally {
            setIsLoading(false);
          }
        }
        return;
      }

      setIsLoading(true);
      try {
        const results = await authService.searchUsers(searchQuery, 10);
        setUsers(results.filter((u) => !excludeIds.includes(u.id)));
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isOpen, excludeIds]);

  const handleSelectUser = (user: UserProfile) => {
    onChange(user);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {value ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
          <Avatar className="size-6">
            <AvatarImage src={value.avatar_url || undefined} />
            <AvatarFallback>{value.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{value.username}</span>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className="pl-9"
          />
        </div>
      )}

      {isOpen && !value && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? 'No users found' : 'No users available'}
              </div>
            ) : (
              <div className="p-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left'
                    )}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.id}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
