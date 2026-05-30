# TECHNICAL REQUIREMENTS & DATABASE BLUEPRINT

Dokumen ini merinci spesifikasi teknis, dependensi proyek, struktur direktori, dan skrip SQL lengkap untuk diimplementasikan pada database PostgreSQL Supabase.

---

## 🛠️ 1. Technical Stack Configuration

### Core Technologies
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript (untuk pengetikan skema database yang aman)
*   **Styling**: SCSS Modules (untuk gaya komponen lokal) & Tailwind CSS (untuk utilities & grid global layout)
*   **State Management**: React Context / Zustand (jika status karakter global semakin kompleks)
*   **Database & Auth**: Supabase (PostgreSQL)

---

## 🗄️ 2. Supabase SQL Database Schema & RLS Policies

Salin dan jalankan skrip SQL berikut langsung di editor SQL Supabase Anda untuk membuat semua tabel, trigger, dan kebijakan Row Level Security (RLS).

```sql
-- =====================================================================
-- 1. EXTENSIONS & SETUP
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 2. CREATE TABLES
-- =====================================================================

-- PROFILES TABLE (Linked with auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username varchar(50) unique not null,
    display_name varchar(100),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHARACTER STATS TABLE
create table public.character_stats (
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

-- COMMITS TABLE (Life Commits)
create table public.commits (
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
create table public.memories (
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

-- RELATIONSHIPS TABLE
create table public.relationships (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name varchar(255) not null,
    status varchar(50) default 'Active' not null, -- Active, Faded, Archived, Lost Connection
    emotional_impact integer check (emotional_impact >= -5 and emotional_impact <= 5) default 0 not null,
    last_interaction date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACHIEVEMENTS TABLE (Global Master Data)
create table public.achievements (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) unique not null,
    description text not null,
    icon_name varchar(100) not null,
    xp_reward integer default 100 not null
);

-- USER ACHIEVEMENTS TABLE (Bridge Table)
create table public.user_achievements (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    achievement_id uuid references public.achievements(id) on delete cascade not null,
    unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, achievement_id)
);

-- =====================================================================
-- 3. AUTOMATION & TRIGGERS
-- =====================================================================

-- A. Auto-Create Profile & Stats on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
    username_val varchar(50);
begin
    -- Membuat username acak atau diambil dari email depan
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

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- B. Auto-Generate Commit Hash on Insert
create or replace function public.generate_commit_hash()
returns trigger as $$
begin
    new.hash := substring(md5(random()::text) from 1 for 7);
    return new;
end;
$$ language plpgsql;

create or replace trigger before_commit_inserted
    before insert on public.commits
    for each row execute procedure public.generate_commit_hash();

-- =====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.character_stats enable row level security;
alter table public.commits enable row level security;
alter table public.memories enable row level security;
alter table public.relationships enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Character Stats Policies
create policy "Users can view their own stats" on public.character_stats for select using (auth.uid() = user_id);
create policy "Users can update their own stats" on public.character_stats for update using (auth.uid() = user_id);

-- Commits Policies
create policy "Users can manage their own commits" on public.commits for all using (auth.uid() = user_id);

-- Memories Policies
create policy "Users can manage their own memories" on public.memories for all using (auth.uid() = user_id);

-- Relationships Policies
create policy "Users can manage their own relationships" on public.relationships for all using (auth.uid() = user_id);

-- User Achievements Policies
create policy "Users can view their own achievements" on public.user_achievements for select using (auth.uid() = user_id);
```

---

## 📦 3. Required Package Dependencies

Daftar paket npm yang wajib diinstal pada langkah awal proyek:

```bash
# Animasi & Visualisasi
npm install gsap framer-motion @studio-freight/lenis lucide-react

# Core Styling
npm install sass

# Supabase Client
npm install @supabase/supabase-js @supabase/ssr
```

---

## 🔒 4. Environment Variables Configuration

Buat berkas `.env.local` di folder root Next.js Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## 📂 5. Project Directory Architecture

Struktur folder terorganisir Next.js App Router yang akan kita bangun:

```text
VersionOfMe/
├── Docs/
│   ├── PRD.MD
│   ├── implementation_plan.md
│   ├── ui_style_guide.md
│   └── technical_requirements.md
├── src/
│   ├── app/
│   │   ├── (auth)/             # Route group untuk Login/Register
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/        # Route group setelah terautentikasi
│   │   │   ├── character/      # Layar status & avatar pertumbuhan
│   │   │   ├── commits/        # Layar log & git-style commits
│   │   │   ├── timeline/       # Layar timeline interaktif
│   │   │   └── journal/        # Layar distraction-free editor
│   │   ├── layout.tsx          # Global Layout dengan Lenis Scroll Wrapper
│   │   └── page.tsx            # Landing Page Premium
│   ├── components/
│   │   ├── ui/                 # Reusable UI Atoms (Button, Input, Card)
│   │   ├── dashboard/          # Komponen dashboard spesifik
│   │   └── motion/             # Pembungkus transisi animasi GSAP/Framer
│   ├── styles/
│   │   ├── variables.scss      # Token desain warna & tipografi HSL
│   │   └── globals.scss        # Reset CSS & integrasi Tailwind
│   ├── lib/
│   │   ├── supabase/           # Konfigurasi client/server Supabase
│   │   └── utils/              # Fungsi helper
│   └── types/                  # Definisi TypeScript untuk database schema
├── public/                     # Aset gambar statis, musik ambient, & logo
└── package.json
```
