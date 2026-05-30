-- =====================================================================
-- VERSION OF ME - SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- Paste this script directly into your Supabase SQL Editor.
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. CREATE TABLES
-- =====================================================================

-- PROFILES TABLE (Linked with auth.users for login synchronization)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username varchar(50) unique not null,
    display_name varchar(100),
    avatar_url text,
    bio text,
    pronouns varchar(50),
    location varchar(100),
    website_url text,
    readme text,
    social_links jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHARACTER STATS TABLE (User stats progression)
create table if not exists public.character_stats (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade unique not null,
    level integer default 1 not null,
    xp integer default 0 not null,
    confidence integer default 50 check (confidence >= 0 and confidence <= 100) not null,
    discipline integer default 50 check (discipline >= 0 and discipline <= 100) not null,
    happiness integer default 50 check (happiness >= 0 and happiness <= 100) not null,
    creativity integer default 50 check (creativity >= 0 and creativity <= 100) not null,
    social_energy integer default 50 check (social_energy >= 0 and social_energy <= 100) not null,
    emotional_stability integer default 50 check (emotional_stability >= 0 and emotional_stability <= 100) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMMITS TABLE (Git-style Life Commits)
create table if not exists public.commits (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    hash varchar(7) not null,
    title text not null,
    description text,
    mood_level integer check (mood_level >= 1 and mood_level <= 5) not null,
    emotional_tags text[] default '{}'::text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEMORIES TABLE (Life Timeline Events)
create table if not exists public.memories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title varchar(255) not null,
    description text,
    category varchar(50) not null, -- Milestone, Career, Health, Routine, etc.
    event_date date not null,
    media_url text,
    audio_url text,
    mood varchar(50),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RELATIONSHIPS TABLE (Tactile Social Dashboard tracking)
create table if not exists public.relationships (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name varchar(255) not null,
    status varchar(50) default 'Active' not null, -- Active, Faded, Archived, Lost Connection
    emotional_impact integer check (emotional_impact >= -5 and emotional_impact <= 5) default 0 not null,
    last_interaction date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACHIEVEMENTS TABLE (Global Achievements Master Data)
create table if not exists public.achievements (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) unique not null,
    description text not null,
    icon_name varchar(100) not null,
    xp_reward integer default 100 not null
);

-- USER ACHIEVEMENTS TABLE (User-unlocked achievements bridge)
create table if not exists public.user_achievements (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    achievement_id uuid references public.achievements(id) on delete cascade not null,
    unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, achievement_id)
);

-- =====================================================================
-- 2. AUTOMATION & TRIGGERS
-- =====================================================================

-- A. Auto-Create Profile & Stats on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
    username_val varchar(50);
begin
    -- Generate a unique username from email
    username_val := lower(split_part(new.email, '@', 1)) || '_' || floor(random() * 1000)::text;

    insert into public.profiles (id, username, display_name, avatar_url)
    values (
        new.id,
        username_val,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );

    insert into public.character_stats (user_id)
    values (new.id);

    return new;
end;
$$ language plpgsql security definer;

-- Trigger for handle_new_user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- B. Auto-Generate Commit Hash on Insert
create or replace function public.generate_commit_hash()
returns trigger as $$
begin
    if new.hash is null or new.hash = '' then
        new.hash := substring(md5(random()::text) from 1 for 7);
    end if;
    return new;
end;
$$ language plpgsql;

-- Trigger for generate_commit_hash
drop trigger if exists before_commit_inserted on public.commits;
create trigger before_commit_inserted
    before insert on public.commits
    for each row execute procedure public.generate_commit_hash();

-- =====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.character_stats enable row level security;
alter table public.commits enable row level security;
alter table public.memories enable row level security;
alter table public.relationships enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles Policies
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Character Stats Policies
drop policy if exists "Users can view their own stats" on public.character_stats;
create policy "Users can view their own stats" on public.character_stats for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own stats" on public.character_stats;
create policy "Users can update their own stats" on public.character_stats for update using (auth.uid() = user_id);

-- Commits Policies
drop policy if exists "Users can manage their own commits" on public.commits;
create policy "Users can manage their own commits" on public.commits for all using (auth.uid() = user_id);

-- Memories Policies
drop policy if exists "Users can manage their own memories" on public.memories;
create policy "Users can manage their own memories" on public.memories for all using (auth.uid() = user_id);

-- Relationships Policies
drop policy if exists "Users can manage their own relationships" on public.relationships;
create policy "Users can manage their own relationships" on public.relationships for all using (auth.uid() = user_id);

-- User Achievements Policies
drop policy if exists "Users can view their own achievements" on public.user_achievements;
create policy "Users can view their own achievements" on public.user_achievements for select using (auth.uid() = user_id);

-- =====================================================================
-- 4. SEED SAMPLE ACHIEVEMENTS
-- =====================================================================
insert into public.achievements (title, description, icon_name, xp_reward) values
('First Commit', 'Committed your first life update to the ledger.', 'GitCommit', 100),
('Emotional Explorer', 'Recorded a commit of each emotional state from level 1 to 5.', 'Sparkles', 250),
('Discipline Master', 'Maintained discipline above 80 points.', 'Shield', 300),
('Luminous Heart', 'Maintained happiness above 90 points.', 'Heart', 300)
on conflict (title) do nothing;

-- =====================================================================
-- 5. STORAGE BUCKETS & POLICIES FOR AVATARS
-- =====================================================================

-- Create 'avatars' storage bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing storage policies if they exist
drop policy if exists "Allow public access to avatars" on storage.objects;
drop policy if exists "Allow authenticated users to upload avatars" on storage.objects;
drop policy if exists "Allow authenticated users to update avatars" on storage.objects;
drop policy if exists "Allow authenticated users to delete avatars" on storage.objects;

-- Create policies

-- 1. Allow public select access to the avatars bucket (so everyone can see profile pictures)
create policy "Allow public access to avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload files to the avatars bucket
create policy "Allow authenticated users to upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

-- 3. Allow authenticated users to update their own files in the avatars bucket
create policy "Allow authenticated users to update avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars');

-- 4. Allow authenticated users to delete their own files in the avatars bucket
create policy "Allow authenticated users to delete avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars');

