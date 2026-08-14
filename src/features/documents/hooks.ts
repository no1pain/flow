import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from './services';
import type { Document, DocumentInsert, DocumentUpdate } from './types';

export function useDocuments(workspaceId: string, parentId?: string | null) {
  return useQuery({
    queryKey: ['documents', workspaceId, parentId],
    queryFn: () => documentService.getDocumentsByWorkspace(workspaceId, parentId),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
  });
}

export function useFolderStructure(workspaceId: string) {
  return useQuery({
    queryKey: ['folderStructure', workspaceId],
    queryFn: () => documentService.getFolderStructure(workspaceId),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (document: DocumentInsert) =>
      documentService.createDocument(document),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', data.workspace_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['folderStructure', data.workspace_id],
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DocumentUpdate }) =>
      documentService.updateDocument(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['document', data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['documents', data.workspace_id],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
      queryClient.invalidateQueries({
        queryKey: ['folderStructure'],
      });
    },
  });
}

export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      sharedWith,
      isPublic,
    }: {
      id: string;
      sharedWith: string[];
      isPublic: boolean;
    }) => documentService.shareDocument(id, sharedWith, isPublic),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['document', data.id],
      });
    },
  });
}

export function useSearchDocuments() {
  return useMutation({
    mutationFn: ({ workspaceId, query }: { workspaceId: string; query: string }) =>
      documentService.searchDocuments(workspaceId, query),
  });
}

export function useSharedDocuments(userId: string) {
  return useQuery({
    queryKey: ['sharedDocuments', userId],
    queryFn: () => documentService.getSharedDocuments(userId),
  });
}

export function usePublicDocuments() {
  return useQuery({
    queryKey: ['publicDocuments'],
    queryFn: () => documentService.getPublicDocuments(),
  });
}
