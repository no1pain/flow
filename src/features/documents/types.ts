export type Document = {
  id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown> | null;
  parent_id: string | null;
  is_public: boolean;
  shared_with: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DocumentInsert = Omit<
  Document,
  'id' | 'created_at' | 'updated_at'
>;

export type DocumentUpdate = Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>;

export type DocumentWithProfile = Document & {
  creator?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export type DocumentFolder = {
  id: string;
  workspace_id: string;
  title: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  children?: DocumentFolder[];
  documents?: Document[];
};

export type DocumentSearchResult = Document & {
  rank: number;
};
