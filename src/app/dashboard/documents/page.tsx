'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useDocuments } from '@/features/documents/hooks';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { FolderTree } from '@/features/documents/components/FolderTree';
import { useFolderStructure } from '@/features/documents/hooks';
import { useCreateDocument } from '@/features/documents/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Search, File, FolderPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DocumentsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const {
    data: documents,
    isLoading,
    error,
  } = useDocuments(currentWorkspace?.id || '', selectedFolderId);
  const { data: folders } = useFolderStructure(currentWorkspace?.id || '');
  const createDocument = useCreateDocument();

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim() || !currentWorkspace) return;

    await createDocument.mutateAsync({
      workspace_id: currentWorkspace.id,
      title: newDocTitle,
      content: { type: 'doc', content: [] },
      parent_id: isCreatingFolder ? null : selectedFolderId || null,
      is_public: false,
      shared_with: [],
      created_by: '', // Will be set by RLS
    });

    setNewDocTitle('');
    setShowCreateDialog(false);
    setIsCreatingFolder(false);
  };

  const handleDocumentClick = (document: { id: string }) => {
    router.push(`/dashboard/documents/${document.id}`);
  };

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="bg-primary/10 rounded-full p-4 mb-4 mx-auto w-fit">
                  <svg
                    className="size-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No workspace selected</h3>
                <p className="text-muted-foreground mb-6">
                  Please select a workspace to view and manage documents
                </p>
                <Button onClick={() => router.push('/dashboard/workspaces')}>
                  Go to Workspaces
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-4" />
          <div className="grid grid-cols-4 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="col-span-3 h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Failed to load documents</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/workspaces')}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Workspaces
            </Button>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground mt-1">{currentWorkspace.name}</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger
              className={cn(
                "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Plus className="size-4 mr-2" />
              New Document
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={!isCreatingFolder ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsCreatingFolder(false)}
                    className="flex-1"
                  >
                    <File className="h-4 w-4 mr-2" />
                    Document
                  </Button>
                  <Button
                    variant={isCreatingFolder ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex-1"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Folder
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDocument}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-card rounded-lg shadow-lg p-4 border h-fit">
            <h2 className="font-semibold mb-4">Folders</h2>
            <FolderTree
              folders={folders || []}
              onFolderClick={setSelectedFolderId}
              onDocumentClick={(documentId) => router.push(`/dashboard/documents/${documentId}`)}
              selectedFolderId={selectedFolderId}
            />
          </div>
          <div className="col-span-3 bg-card rounded-lg shadow-lg p-6 border">
            <h2 className="font-semibold mb-4">
              {selectedFolderId ? 'Documents in folder' : 'All documents'}
            </h2>
            <DocumentList documents={documents || []} onDocumentClick={handleDocumentClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
