
-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store document embeddings for RAG
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  metadata jsonb,
  embedding vector(768),
  source_table text,
  source_id uuid,
  document_type text DEFAULT 'data',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable vector similarity search
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create a table for chat sessions
CREATE TABLE IF NOT EXISTS public.staff_chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_user_id uuid NOT NULL,
  session_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create a function to match similar documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source_table text,
  source_id uuid,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    document_embeddings.source_table,
    document_embeddings.source_id,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable RLS on the new tables
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for staff access
CREATE POLICY "Staff can view document embeddings" 
  ON public.document_embeddings FOR SELECT 
  USING (true);

CREATE POLICY "Staff can manage their chat sessions" 
  ON public.staff_chat_sessions FOR ALL 
  USING (true);
