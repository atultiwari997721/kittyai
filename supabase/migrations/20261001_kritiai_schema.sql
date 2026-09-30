-- =========================================================================
-- KritiAI Database Schema Migration
-- Autonomous Personal AI Operating System
-- Tables, Foreign Keys, UUIDs, Timestamps & Row-Level Security (RLS)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. Devices & Device Pairs
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'online',
    public_key TEXT,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own devices" ON public.devices FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.device_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pairing_code TEXT NOT NULL,
    initiating_device_id UUID REFERENCES public.devices(id),
    paired_device_id UUID REFERENCES public.devices(id),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.device_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own device pairs" ON public.device_pairs FOR ALL USING (auth.uid() = user_id);

-- 3. Conversations & Messages
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    active_agent TEXT NOT NULL DEFAULT 'AUTO',
    active_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user' | 'ai' | 'system'
    content TEXT NOT NULL,
    agent TEXT,
    model TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);

-- 4. Tasks, Steps & Consequential Approvals
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    agent TEXT NOT NULL DEFAULT 'GeneralAgent',
    model TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'IDLE', -- 'IDLE', 'ANALYZING', 'PLANNING', 'WAITING_APPROVAL', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED'
    risk_level TEXT NOT NULL DEFAULT 'low',
    execution_environment TEXT NOT NULL DEFAULT 'desktop',
    result JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.task_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    tool_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    output JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own task steps" ON public.task_steps FOR ALL USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_steps.task_id AND tasks.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'EMAIL_SEND', 'CALENDAR_CREATE', 'CODE_PATCH', 'TERMINAL_COMMAND', 'MEETING_JOIN'
    summary TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own approvals" ON public.approvals FOR ALL USING (auth.uid() = user_id);

-- 5. Personal Memory Vault
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    type TEXT NOT NULL DEFAULT 'personal',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence REAL NOT NULL DEFAULT 1.0,
    source TEXT NOT NULL DEFAULT 'user_chat',
    privacy_level TEXT NOT NULL DEFAULT 'local_only',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own memories" ON public.memories FOR ALL USING (auth.uid() = user_id);

-- 6. Integrations & Connected Accounts
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'gmail', 'calendar', 'drive', 'whatsapp', 'vscode', 'outlook'
    status TEXT NOT NULL DEFAULT 'connected',
    scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
    credentials_encrypted TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own integrations" ON public.integrations FOR ALL USING (auth.uid() = user_id);

-- 7. Meeting Summaries & Action Items
CREATE TABLE IF NOT EXISTS public.meeting_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Google Meet',
    executive_summary TEXT NOT NULL,
    decisions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.meeting_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own meeting summaries" ON public.meeting_summaries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.meeting_action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES public.meeting_summaries(id) ON DELETE CASCADE,
    owner TEXT NOT NULL,
    task TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own action items" ON public.meeting_action_items FOR ALL USING (EXISTS (SELECT 1 FROM public.meeting_summaries WHERE meeting_summaries.id = meeting_action_items.summary_id AND meeting_summaries.user_id = auth.uid()));

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    agent TEXT,
    tool TEXT,
    risk_level TEXT NOT NULL DEFAULT 'low',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own audit logs" ON public.audit_logs FOR ALL USING (auth.uid() = user_id);
