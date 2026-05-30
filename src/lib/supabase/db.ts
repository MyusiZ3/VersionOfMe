import { createClient } from './client';

const supabase = createClient();

// Helper to check if Supabase is properly configured and user is authenticated
export async function getSessionUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    return null;
  }
}

// =====================================================================
// COMMITS
// =====================================================================
export async function fetchCommits(userId: string) {
  const { data, error } = await supabase
    .from('commits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commits:', error.message);
    throw error;
  }
  return data;
}

export async function insertCommit(userId: string, commit: {
  title: string;
  description: string;
  mood_level: number;
  emotional_tags: string[];
}) {
  const { data, error } = await supabase
    .from('commits')
    .insert([
      {
        user_id: userId,
        title: commit.title,
        description: commit.description,
        mood_level: commit.mood_level,
        emotional_tags: commit.emotional_tags,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting commit:', error.message);
    throw error;
  }
  return data;
}

// =====================================================================
// MEMORIES
// =====================================================================
export async function fetchMemories(userId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Error fetching memories:', error.message);
    throw error;
  }
  return data;
}

export async function insertMemory(userId: string, memory: {
  title: string;
  description: string;
  category: string;
  event_date: string;
  mood: string;
}) {
  const { data, error } = await supabase
    .from('memories')
    .insert([
      {
        user_id: userId,
        title: memory.title,
        description: memory.description,
        category: memory.category,
        event_date: memory.event_date,
        mood: memory.mood,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting memory:', error.message);
    throw error;
  }
  return data;
}

// =====================================================================
// RELATIONSHIPS
// =====================================================================
export async function fetchRelationships(userId: string) {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching relationships:', error.message);
    throw error;
  }
  return data;
}

export async function insertRelationship(userId: string, relationship: {
  name: string;
  status: string;
  emotional_impact: number;
  last_interaction: string;
}) {
  const { data, error } = await supabase
    .from('relationships')
    .insert([
      {
        user_id: userId,
        name: relationship.name,
        status: relationship.status,
        emotional_impact: relationship.emotional_impact,
        last_interaction: relationship.last_interaction,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting relationship:', error.message);
    throw error;
  }
  return data;
}

// =====================================================================
// CHARACTER STATS
// =====================================================================
export async function fetchCharacterStats(userId: string) {
  const { data, error } = await supabase
    .from('character_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found, trigger creation
      return await initializeCharacterStats(userId);
    }
    console.error('Error fetching character stats:', error.message);
    throw error;
  }
  return data;
}

export async function initializeCharacterStats(userId: string) {
  const { data, error } = await supabase
    .from('character_stats')
    .insert([
      {
        user_id: userId,
        level: 1,
        xp: 0,
        confidence: 50,
        discipline: 50,
        happiness: 50,
        creativity: 50,
        social_energy: 50,
        emotional_stability: 50
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error initializing character stats:', error.message);
    throw error;
  }
  return data;
}

export async function updateCharacterStats(userId: string, stats: {
  level: number;
  xp: number;
  confidence: number;
  discipline: number;
  happiness: number;
  creativity: number;
  social_energy: number;
  emotional_stability: number;
}) {
  const { data, error } = await supabase
    .from('character_stats')
    .update({
      level: stats.level,
      xp: stats.xp,
      confidence: stats.confidence,
      discipline: stats.discipline,
      happiness: stats.happiness,
      creativity: stats.creativity,
      social_energy: stats.social_energy,
      emotional_stability: stats.emotional_stability,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating character stats:', error.message);
    throw error;
  }
  return data;
}

// =====================================================================
// ACHIEVEMENTS
// =====================================================================
export async function fetchUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        unlocked_at,
        achievements (
          id,
          title,
          description,
          icon_name,
          xp_reward
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Error in fetchUserAchievements:', e);
    return [];
  }
}

export async function unlockAchievement(userId: string, achievementTitle: string) {
  try {
    // First, find the achievement by title
    const { data: ach, error: findError } = await supabase
      .from('achievements')
      .select('id')
      .eq('title', achievementTitle)
      .single();

    if (findError || !ach) {
      console.error('Error finding achievement:', findError?.message || 'Not found');
      return null;
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert([
        {
          user_id: userId,
          achievement_id: ach.id,
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique violation, already unlocked
        return { alreadyUnlocked: true };
      }
      console.error('Error unlocking achievement:', error.message);
      throw error;
    }
    return data;
  } catch (e) {
    console.error('Error in unlockAchievement:', e);
    return null;
  }
}

// =====================================================================
// USER PROFILE & AVATAR IMAGES
// =====================================================================

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    throw error;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  profile: {
    display_name?: string;
    avatar_url?: string;
    username?: string;
    bio?: string;
    pronouns?: string;
    location?: string;
    website_url?: string;
    social_links?: {
      linkedin?: string;
      instagram?: string;
      [key: string]: any;
    };
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function uploadAvatarFile(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Try uploading to Supabase Storage bucket 'avatars'
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload failed, falling back to data URL:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (e) {
    console.warn('Storage upload error, falling back to data URL:', e);
    return null;
  }
}


