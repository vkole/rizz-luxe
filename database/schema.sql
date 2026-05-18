-- Rizz Luxe Dancer Database Schema
-- PostgreSQL/Supabase

-- Users table (basic profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_key VARCHAR(255) UNIQUE NOT NULL,
  sl_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Folders table (dance library organization)
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_folder_name_per_parent UNIQUE(user_id, parent_id, name)
);

-- Dances table (animation inventory)
CREATE TABLE IF NOT EXISTS dances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  animation_id VARCHAR(255),
  duration_seconds INT,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dance folder references (many-to-many)
CREATE TABLE IF NOT EXISTS dance_folder_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dance_id UUID NOT NULL REFERENCES dances(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_dance_in_folder UNIQUE(dance_id, folder_id)
);

-- Sequences table (dance sequences/choreography)
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration_seconds INT,
  loop BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sequence items (ordered list of dances in sequence)
CREATE TABLE IF NOT EXISTS sequence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  dance_id UUID NOT NULL REFERENCES dances(id) ON DELETE CASCADE,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_sequence_position UNIQUE(sequence_id, position)
);

-- User options (preferences/settings)
CREATE TABLE IF NOT EXISTS user_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  show_favorites_first BOOLEAN DEFAULT TRUE,
  auto_scroll_list BOOLEAN DEFAULT TRUE,
  confirm_before_delete BOOLEAN DEFAULT TRUE,
  show_button_numbers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backups (library backups/exports)
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  backup_name VARCHAR(255) NOT NULL,
  backup_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invites (dancer collaboration/group management)
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_key VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_dances_user_id ON dances(user_id);
CREATE INDEX idx_dances_favorite ON dances(user_id, favorite);
CREATE INDEX idx_dance_folder_refs_dance_id ON dance_folder_refs(dance_id);
CREATE INDEX idx_dance_folder_refs_folder_id ON dance_folder_refs(folder_id);
CREATE INDEX idx_sequences_user_id ON sequences(user_id);
CREATE INDEX idx_sequence_items_sequence_id ON sequence_items(sequence_id);
CREATE INDEX idx_backups_user_id ON backups(user_id);
CREATE INDEX idx_invites_sender_id ON invites(sender_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dance_folder_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for users - adjust based on your auth system)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Folders visible to owner" ON folders
  FOR SELECT USING (true);

CREATE POLICY "Dances visible to owner" ON dances
  FOR SELECT USING (true);
