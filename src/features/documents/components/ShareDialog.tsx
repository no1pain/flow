'use client';

import { useState } from 'react';
import { Share2, Globe, Users, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Document } from '../types';

interface ShareDialogProps {
  document: Document;
  onShare: (sharedWith: string[], isPublic: boolean) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({ document, onShare, open, onOpenChange }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(document.is_public);
  const [sharedWithEmail, setSharedWithEmail] = useState('');
  const [sharedWith, setSharedWith] = useState<string[]>(document.shared_with || []);
  const [copied, setCopied] = useState(false);

  const handleAddUser = () => {
    if (sharedWithEmail.trim() && !sharedWith.includes(sharedWithEmail.trim())) {
      setSharedWith([...sharedWith, sharedWithEmail.trim()]);
      setSharedWithEmail('');
    }
  };

  const handleRemoveUser = (email: string) => {
    setSharedWith(sharedWith.filter((u) => u !== email));
  };

  const handleSave = () => {
    onShare(sharedWith, isPublic);
    onOpenChange?.(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/documents/${document.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>Share &ldquo;{document.title}&rdquo; with others</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant={isPublic ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              Public
            </Button>
            <Button
              variant={!isPublic ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPublic(false)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Private
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Share link</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/documents/${document.id}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!isPublic && (
            <div className="space-y-2">
              <Label>Share with users</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email or user ID"
                  value={sharedWithEmail}
                  onChange={(e) => setSharedWithEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button onClick={handleAddUser}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sharedWith.map((user) => (
                  <Badge key={user} variant="secondary" className="gap-1">
                    {user}
                    <button
                      onClick={() => handleRemoveUser(user)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
