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
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleDelete = () => {
    if (!document) return;
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!document) return;

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
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="bg-destructive/10 rounded-full p-4 mb-4 mx-auto w-fit">
                  <Trash2 className="size-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Document not found</h3>
                <p className="text-muted-foreground mb-6">
                  This document may have been deleted or you don&apos;t have permission to view it.
                </p>
                <Button onClick={() => router.push('/dashboard/documents')}>Go to Documents</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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

        <div className="bg-card rounded-lg shadow-lg p-6 border mb-6">
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

        <div className="bg-card rounded-lg shadow-lg p-6 border">
          <DocumentEditor
            content={content}
            onChange={(newContent) => {
              setContent(newContent);
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={confirmDeleteDocument}
        cancelText="Cancel"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
