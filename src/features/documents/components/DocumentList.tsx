'use client';

import { File, MoreVertical, Trash2, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  onDeleteDocument?: (documentId: string) => void;
  onShareDocument?: (document: Document) => void;
}

export function DocumentList({
  documents,
  onDocumentClick,
  onDeleteDocument,
  onShareDocument,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No documents yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer group"
          onClick={() => onDocumentClick(document)}
        >
          <File className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{document.title}</h3>
            <p className="text-sm text-muted-foreground">
              Updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
            </p>
          </div>
          {document.is_public && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Public</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 opacity-0 group-hover:opacity-100 h-8 w-8 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onShareDocument && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareDocument(document);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              {onDeleteDocument && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(document.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
