'use client';

import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DocumentFolder } from '../types';

interface FolderTreeProps {
  folders: DocumentFolder[];
  onFolderClick?: (folderId: string) => void;
  onDocumentClick?: (documentId: string) => void;
  selectedFolderId?: string;
  selectedDocumentId?: string;
}

export function FolderTree({
  folders,
  onFolderClick,
  onDocumentClick,
  selectedFolderId,
  selectedDocumentId,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: DocumentFolder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent',
            isSelected && 'bg-accent'
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            toggleFolder(folder.id);
            onFolderClick?.(folder.id);
          }}
        >
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm flex-1 truncate">{folder.title}</span>
          {folder.documents && folder.documents.length > 0 && (
            <span className="text-xs text-muted-foreground">{folder.documents.length}</span>
          )}
        </div>
        {isExpanded && (
          <>
            {folder.documents && folder.documents.length > 0 && (
              <div>
                {folder.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent',
                      selectedDocumentId === doc.id && 'bg-accent'
                    )}
                    style={{ paddingLeft: `${level * 12 + 28}px` }}
                    onClick={() => onDocumentClick?.(doc.id)}
                  >
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            )}
            {folder.children && folder.children.length > 0 && (
              <div>
                {folder.children.map((child) => renderFolder(child, level + 1))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (folders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No folders yet
      </div>
    );
  }

  return <div className="space-y-0.5">{folders.map((folder) => renderFolder(folder))}</div>;
}
