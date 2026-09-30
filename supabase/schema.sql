-- ==============================================================================
-- KittyAI / KritiAI - Supabase PostgreSQL Schema
-- Real-time Sync for Web, Desktop, Mobile, and Python Local Sidecar
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "default_model": "ollama:qwen2.5",
        "fallback_provider": "gemini",
        "assist_mode_enabled": true,
        "assist_interval_sec": 3,
        "voice_feedback": true,
        "theme": "dark"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Tasks Table
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intent TEXT NOT NULL CHECK (intent IN ('OS_NAV', 'CODE_AGENT', 'MEETING_AGENT', 'PLUGIN_AGENT', 'GENERAL_CHAT')),
    prompt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB DEFAULT '{}'::jsonb,
    logs JSONB DEFAULT '[]'::jsonb,
    model_used TEXT,
    execution_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Meetings & Autonomous Delegate Records
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'google_meet' CHECK (platform IN ('google_meet', 'zoom', 'teams', 'other')),
    join_url TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delegate_joining', 'in_progress', 'completed', 'failed')),
    delegate_status TEXT DEFAULT 'idle',
    full_transcript TEXT,
    summary TEXT,
    key_decisions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Action Items (Extracted from Meetings & Tasks)
CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assignee TEXT,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coding Sessions (VS Code Error Analysis & Diff Patches)
CREATE TABLE IF NOT EXISTS public.coding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT,
    workspace_path TEXT,
    active_file TEXT,
    error_trace TEXT,
    proposed_diff TEXT,
    explanation TEXT,
    status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'patch_generated', 'applied', 'rejected', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Plugin Configurations & Connected Services
CREATE TABLE IF NOT EXISTS public.plugin_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plugin_id TEXT NOT NULL CHECK (plugin_id IN ('gmail', 'whatsapp', 'google_calendar', 'outlook', 'vscode', 'system')),
    is_enabled BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'pending', 'error')),
    settings JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, plugin_id)
);

-- 7. Real-Time Activity Logs (For Mobile & Web Feed)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    message TEXT NOT NULL,
    level TEXT DEFAULT 'info' CHECK (level IN ('info', 'success', 'warning', 'error')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Personal Knowledge & Memory Records (Entities, Contacts, Preferences, Rules)
CREATE TABLE IF NOT EXISTS public.user_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    display_key TEXT,
    value JSONB NOT NULL,
    category TEXT DEFAULT 'entity' CHECK (category IN ('entity', 'contact', 'preference', 'project', 'rule', 'custom_fact')),
    description TEXT,
    source TEXT DEFAULT 'user_chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, key)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_status ON public.agent_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_meetings_user_time ON public.meetings(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_action_items_user_status ON public.action_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_time ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_user_key ON public.user_memories(user_id, key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own tasks" ON public.agent_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their meetings" ON public.meetings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage action items" ON public.action_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage coding sessions" ON public.coding_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage plugins" ON public.plugin_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their activity logs" ON public.activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their personal memory" ON public.user_memories FOR ALL USING (auth.uid() = user_id);

-- Realtime Publication for instant UI updates across Windows App & Web/Mobile
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plugin_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_memories;

