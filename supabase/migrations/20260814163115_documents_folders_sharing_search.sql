-- Add folder structure, sharing, and full-text search to documents

-- Add parent_id for folder structure
ALTER TABLE documents ADD COLUMN parent_id UUID REFERENCES documents(id) ON DELETE CASCADE;

-- Add sharing fields
ALTER TABLE documents ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN shared_with UUID[] DEFAULT ARRAY[]::UUID[];

-- Add tsvector for full-text search
ALTER TABLE documents ADD COLUMN search_vector tsvector;

-- Create index for parent_id
CREATE INDEX idx_documents_parent_id ON documents(parent_id);

-- Create GIN index for full-text search
CREATE INDEX idx_documents_search_vector ON documents USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION documents_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on insert/update
CREATE TRIGGER documents_search_vector_trigger
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION documents_search_vector_update();

-- Update existing documents' search vectors
UPDATE documents SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content::text, '')), 'B');

-- Update RLS policies for documents
DROP POLICY IF EXISTS "Workspace members can view documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view shared documents" ON documents
  FOR SELECT USING (
    is_public = TRUE OR
    auth.uid() = ANY(shared_with)
  );

CREATE POLICY "Workspace members can view workspace documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = documents.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents" ON documents
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = documents.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (created_by = auth.uid());
