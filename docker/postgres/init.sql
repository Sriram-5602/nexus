-- Enable pgvector extension for semantic search (Atlas / Cortex embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Schemas: each backend stack gets its own namespace
-- Spring Boot uses the default 'public' schema
CREATE SCHEMA IF NOT EXISTS cortex;
CREATE SCHEMA IF NOT EXISTS chat;

-- Grant access to the application user on all schemas
GRANT ALL ON SCHEMA public TO nexus;
GRANT ALL ON SCHEMA cortex TO nexus;
GRANT ALL ON SCHEMA chat   TO nexus;

-- Set default search path so each service finds its tables
ALTER DATABASE nexus SET search_path TO public, cortex, chat;
