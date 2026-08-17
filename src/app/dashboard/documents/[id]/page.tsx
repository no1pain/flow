'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocument } from '@/features/documents/hooks';
import { useUpdateDocument } from '@/features/documents/hooks';
import { useDeleteDocument } from '@/features/documents/hooks';
import { useShareDocument } from '@/features/documents/hooks';
import { DocumentEditor } from '@/features/documents/components/DocumentEditor';
import { ShareDialog } from '@/features/documents/components/ShareDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const { data: document, isLoading, error } = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const shareDocument = useShareDocument();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update state when document loads
  if (document && (title !== document.title || content !== document.content)) {
    setTitle(document.title);
    setContent(document.content);
  }

  const handleSave = async () => {
    if (!document) return;

    await updateDocument.mutateAsync({
      id: document.id,
      updates: { title, content },
    });
    setHasUnsavedChanges(false);
  };

  const handleDelete = async () => {
    if (!document || !confirm('Are you sure you want to delete this document?')) return;

    await deleteDocument.mutateAsync(document.id);
    router.push('/dashboard/documents');
  };

  const handleShare = async (sharedWith: string[], isPublic: boolean) => {
    if (!document) return;

    await shareDocument.mutateAsync({
      id: document.id,
      sharedWith,
      isPublic,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Failed to load document</p>
            <Button variant="link" onClick={() => router.push('/dashboard/documents')}>
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/documents')}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Documents
          </Button>
          <div className="flex gap-2">
            <ShareDialog
              document={document}
              onShare={handleShare}
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
            />
            <Button variant="outline" onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges || updateDocument.isPending}>
              {updateDocument.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
            placeholder="Document title"
          />
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
            {document.is_public && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Public</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <DocumentEditor
            content={content}
            onChange={(newContent) => {
              setContent(newContent);
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
