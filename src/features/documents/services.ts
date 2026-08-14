import { createClient } from '@/lib/supabase/client';
import type {
  Document,
  DocumentInsert,
  DocumentUpdate,
  DocumentWithProfile,
  DocumentFolder,
  DocumentSearchResult,
} from './types';

const supabase = createClient();

export const documentService = {
  async getDocumentsByWorkspace(workspaceId: string, parentId?: string | null) {
    const query = supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('parent_id', parentId ?? null)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as Document[];
  },

  async getDocumentById(id: string): Promise<DocumentWithProfile> {
    const { data, error } = await supabase
      .from('documents')
      .select(
        `
        *,
        creator:profiles!documents_created_by_fkey (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      creator: (data as { creator?: { id: string; username: string; avatar_url: string | null } })
        .creator,
    } as DocumentWithProfile;
  },

  async getFolderStructure(workspaceId: string): Promise<DocumentFolder[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .not('parent_id', 'is', null)
      .order('title', { ascending: true });

    if (error) throw error;

    const folders = data as Document[];
    const folderMap = new Map<string, DocumentFolder>();
    const rootFolders: DocumentFolder[] = [];

    // Initialize folder map
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        id: folder.id,
        workspace_id: folder.workspace_id,
        title: folder.title,
        parent_id: folder.parent_id,
        created_by: folder.created_by,
        created_at: folder.created_at,
        children: [],
        documents: [],
      });
    });

    // Build hierarchy
    folders.forEach((folder) => {
      const folderNode = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id)!.children!.push(folderNode);
      } else {
        rootFolders.push(folderNode);
      }
    });

    // Get documents for each folder
    for (const [folderId, folderNode] of folderMap) {
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('parent_id', folderId)
        .order('title', { ascending: true });

      folderNode.documents = (docs || []) as Document[];
    }

    return rootFolders;
  },

  async createDocument(document: DocumentInsert) {
    const { data, error } = await supabase.from('documents').insert(document).select().single();

    if (error) throw error;
    return data as Document;
  },

  async updateDocument(id: string, updates: DocumentUpdate) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async deleteDocument(id: string) {
    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) throw error;
  },

  async shareDocument(id: string, sharedWith: string[], isPublic: boolean) {
    const { data, error } = await supabase
      .from('documents')
      .update({ shared_with: sharedWith, is_public: isPublic })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async searchDocuments(workspaceId: string, query: string): Promise<DocumentSearchResult[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .textSearch('search_vector', query)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((doc, index) => ({
      ...doc,
      rank: index,
    })) as DocumentSearchResult[];
  },

  async getSharedDocuments(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .contains('shared_with', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async getPublicDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },
};
