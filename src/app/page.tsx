"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  getSessionUser,
  fetchCommits,
  insertCommit,
  fetchMemories,
  insertMemory,
  fetchRelationships,
  insertRelationship,
  fetchCharacterStats,
  updateCharacterStats,
  fetchUserAchievements,
  unlockAchievement,
  fetchProfile,
  updateProfile,
  uploadAvatarFile,
  updateCommit,
  deleteCommit
} from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { 
  GitCommit, 
  Calendar, 
  Users, 
  BookOpen, 
  Activity, 
  Zap, 
  Heart, 
  ArrowRight, 
  Plus, 
  Lock, 
  Volume2, 
  VolumeX, 
  Shield, 
  Sparkles,
  Award,
  Database,
  Camera,
  MapPin,
  Globe,
  Edit2
} from "lucide-react";

// Custom Interface for Inline Icons that accept a size prop
interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Inline Custom Brand Icons for LinkedIn and Instagram
const Linkedin = ({ size, className, ...props }: CustomIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: size || props.width || 14, height: size || props.height || 14 }}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = ({ size, className, ...props }: CustomIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: size || props.width || 14, height: size || props.height || 14 }}
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Web Audio API Typewriter Synthesizer class
class KeyboardSynth {
  ctx: AudioContext | null = null;
  ambientGain: GainNode | null = null;
  oscillators: OscillatorNode[] = [];
  lfo: OscillatorNode | null = null;
  currentMood: number = 3;
  fadingVoices: { gainNode: GainNode; oscs: OscillatorNode[]; lfo: OscillatorNode | null }[] = [];

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClick(type: "key" | "space" | "enter" | "backspace") {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Core mechanical strike
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === "space") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.09);
      
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, now);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === "enter") {
      // Metallic clack
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.start(now);
      osc.stop(now + 0.22);

      // Typewriter Carriage Return Bell (Ding!)
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bell.frequency.setValueAtTime(1350, now);
      bellGain.gain.setValueAtTime(0.04, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bell.start(now);
      bell.stop(now + 0.35);
    } else if (type === "backspace") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
      
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(700, now);
      
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Normal character clack
      const pitches = [260, 280, 290, 310, 335];
      const freq = pitches[Math.floor(Math.random() * pitches.length)];
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq - 100, now + 0.06);
      
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(550 + Math.random() * 150, now);
      filter.Q.setValueAtTime(4, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      
      osc.start(now);
      osc.stop(now + 0.07);
      
      // High frequency switch click click transient
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      click.frequency.setValueAtTime(1900, now);
      clickGain.gain.setValueAtTime(0.02, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      click.start(now);
      click.stop(now + 0.015);
    }
  }

  startAmbient(moodLevel: number) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    // Prevent re-triggering if it is already running for the exact same mood
    if (this.currentMood === moodLevel && this.ambientGain) {
      return;
    }

    this.currentMood = moodLevel;
    const now = this.ctx.currentTime;

    // Fade out previous ambient if playing
    this.stopAmbient(2.0);

    // Create gain & filter
    const ambientGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, now);
    filter.Q.setValueAtTime(1.2, now);

    // Slow LFO to modulate filter frequency (organic breathing movement)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.04, now); // 25s cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(100, now); // +/- 100Hz modulation

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    this.lfo = lfo;

    ambientGain.connect(this.ctx.destination);
    filter.connect(ambientGain);

    // Pick warm chords based on average mood
    let freqs = [110.00, 164.81, 261.63, 392.00]; // Reflective (A minor 7th)
    if (moodLevel >= 4.2) {
      freqs = [87.31, 130.81, 220.00, 329.63]; // Growth (F maj 7/9)
    } else if (moodLevel >= 3.3) {
      freqs = [98.00, 146.83, 246.94, 369.99]; // Balanced (G maj 7)
    } else if (moodLevel >= 2.5) {
      freqs = [110.00, 164.81, 261.63, 392.00]; // Deep (A min 7)
    } else {
      freqs = [73.42, 110.00, 174.61, 261.63]; // Heavy (D min 7)
    }

    const oscs: OscillatorNode[] = [];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      // Add subtle detune for warm chorus effect
      osc.detune.setValueAtTime((Math.random() - 0.5) * 12, now);
      
      osc.connect(filter);
      osc.start(now);
      oscs.push(osc);
    });

    this.oscillators = oscs;
    this.ambientGain = ambientGain;
    
    // Smooth fade in (using 0.12 for ambient volume so it is clearly audible)
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(0.12, now + 2.5);
  }

  stopAmbient(fadeTime = 1.0) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    
    const prevGain = this.ambientGain;
    const prevOscs = this.oscillators;
    const prevLfo = this.lfo;

    // Cleanly cancel any ongoing ramps before fading out
    try {
      prevGain.gain.cancelScheduledValues(now);
      prevGain.gain.setValueAtTime(prevGain.gain.value || 0.12, now);
      prevGain.gain.linearRampToValueAtTime(0, now + fadeTime);
    } catch (e) {
      // Fallback
      try { prevGain.gain.linearRampToValueAtTime(0, now + fadeTime); } catch (err) {}
    }

    const voiceEntry = { gainNode: prevGain, oscs: prevOscs, lfo: prevLfo };
    this.fadingVoices.push(voiceEntry);

    setTimeout(() => {
      try {
        voiceEntry.oscs.forEach(osc => {
          try { osc.stop(); } catch (e) {}
          try { osc.disconnect(); } catch (e) {}
        });
        if (voiceEntry.lfo) {
          try { voiceEntry.lfo.stop(); } catch (e) {}
          try { voiceEntry.lfo.disconnect(); } catch (e) {}
        }
        try { voiceEntry.gainNode.disconnect(); } catch (e) {}
        
        // Remove from fading list
        this.fadingVoices = this.fadingVoices.filter(v => v !== voiceEntry);
      } catch (err) {
        // Safe catch
      }
    }, fadeTime * 1000 + 100);

    this.ambientGain = null;
    this.oscillators = [];
    this.lfo = null;
  }
}

// Initial Mock Data
const initialCommits = [
  {
    id: "c1",
    hash: "81fd2e5",
    title: "learned to trust myself again",
    description: "Felt the pressure of making the wrong decision for weeks. Today, I made my choice and stood by it. The air feels lighter.",
    mood_level: 4, // Hopeful
    emotional_tags: ["growth", "clarity", "trust"],
    created_at: "2026-05-28T14:32:00Z",
    xp: 150
  },
  {
    id: "c2",
    hash: "a4c28f9",
    title: "archived a fading childhood circle",
    description: "Quietly acknowledged that the distance is real now. No anger, just the natural drift of life. Beautiful memories, but it's time to let them rest.",
    mood_level: 2, // Melancholic
    emotional_tags: ["relationships", "acceptance", "reflection"],
    created_at: "2026-05-25T21:05:00Z",
    xp: 120
  },
  {
    id: "c3",
    hash: "2e5d7a1",
    title: "first deep code block integration",
    description: "Spent 9 hours lost in architecture. It is not about writing code; it is about building a space that feels like a clean home. Felt that rare flow state.",
    mood_level: 5, // Excited / Fulfilled
    emotional_tags: ["creation", "discipline", "flow"],
    created_at: "2026-05-20T18:45:00Z",
    xp: 200
  }
];

const initialMemories = [
  {
    id: "m1",
    title: "Stepping into the Version of Me",
    description: "Initialized the very first secure repository block. Decided to document life not as a timeline of achievements, but as an evolution of self.",
    category: "Milestone",
    event_date: "2026-05-30",
    mood: "Reflective"
  },
  {
    id: "m2",
    title: "The Silent Workspace Era",
    description: "Designed a clean space where ambient typing sounds and glass panels replace standard dopamine buttons.",
    category: "Routine",
    event_date: "2026-05-29",
    mood: "Focused"
  },
  {
    id: "m3",
    title: "Letting Go of Project X",
    description: "Officially archived a codebase I spent six months on. It wasn't working, and recognizing that is a win.",
    category: "Career",
    event_date: "2026-05-15",
    mood: "Decisive"
  }
];

const initialRelationships = [
  { id: "r1", name: "Aria (Sister)", status: "Active", emotional_impact: 4, last_interaction: "2026-05-29" },
  { id: "r2", name: "Devon (Mentor)", status: "Active", emotional_impact: 3, last_interaction: "2026-05-24" },
  { id: "r3", name: "The Old Crew", status: "Faded", emotional_impact: -1, last_interaction: "2026-02-10" },
  { id: "r4", name: "Marcus", status: "Lost Connection", emotional_impact: -3, last_interaction: "2025-11-08" }
];

export default function Page() {
  // Navigation & View State
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"log" | "timeline" | "relationships" | "editor">("log");
  
  // Audio Synthesizer State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const synthRef = useRef<KeyboardSynth | null>(null);

  // Live App States
  const [commits, setCommits] = useState(initialCommits);
  const [memories, setMemories] = useState(initialMemories);
  const [relationships, setRelationships] = useState(initialRelationships);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(["First Commit"]);

  // Relationship Form States
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [relName, setRelName] = useState("");
  const [relStatus, setRelStatus] = useState("Active");
  const [relImpact, setRelImpact] = useState<number>(3);
  const [relSubmitLoading, setRelSubmitLoading] = useState(false);
  
  // Character Metrics (Reactive to Commits)
  const [stats, setStats] = useState({
    level: 2,
    xp: 470,
    xpNext: 1000,
    confidence: 65,
    discipline: 72,
    happiness: 58,
    creativity: 80,
    social_energy: 45,
    emotional_stability: 68
  });

  // Supabase Auth and Sync States
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const supabaseClient = useRef(createClient());

  // Profile and Avatar Customizer States
  const [displayName, setDisplayName] = useState("Muhamad Sidik");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80"
  );
  const [profileUsername, setProfileUsername] = useState("MyusiZ3");
  const [profileBio, setProfileBio] = useState("Aspiring Game Dev | App Dev");
  const [profilePronouns, setProfilePronouns] = useState("he/him");
  const [profileLocation, setProfileLocation] = useState("West Java, Bandung, Indonesia");
  const [profileWebsiteUrl, setProfileWebsiteUrl] = useState("https://creative-portfolio-theta-rosy.vercel.app/");
  const [profileLinkedin, setProfileLinkedin] = useState("muhamad-sidik-a6757b25b");
  const [profileInstagram, setProfileInstagram] = useState("imyusi_");
  const [profileReadme, setProfileReadme] = useState<string>("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string>("");
  const [tempBio, setTempBio] = useState("");
  const [tempPronouns, setTempPronouns] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempWebsiteUrl, setTempWebsiteUrl] = useState("");
  const [tempLinkedin, setTempLinkedin] = useState("");
  const [tempInstagram, setTempInstagram] = useState("");
  const [tempReadme, setTempReadme] = useState<string>("");
  
  const [profileModalTab, setProfileModalTab] = useState<"general" | "readme">("general");
  const [readmePreviewMode, setReadmePreviewMode] = useState(false);
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Commit editing states
  const [editingCommitId, setEditingCommitId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMood, setEditMood] = useState<number>(3);
  const [editTags, setEditTags] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Function to load all user data from Supabase
  const loadUserData = async (userId: string) => {
    setDbLoading(true);
    try {
      const dbCommits = await fetchCommits(userId);
      if (dbCommits && dbCommits.length > 0) {
        setCommits(dbCommits);
      } else {
        setCommits(initialCommits);
      }

      const dbMemories = await fetchMemories(userId);
      if (dbMemories && dbMemories.length > 0) {
        setMemories(dbMemories);
      } else {
        setMemories(initialMemories);
      }

      const dbRelationships = await fetchRelationships(userId);
      if (dbRelationships && dbRelationships.length > 0) {
        setRelationships(dbRelationships);
      } else {
        setRelationships(initialRelationships);
      }

      const dbStats = await fetchCharacterStats(userId);
      if (dbStats) {
        setStats({
          level: dbStats.level,
          xp: dbStats.xp,
          xpNext: 1000,
          confidence: dbStats.confidence,
          discipline: dbStats.discipline,
          happiness: dbStats.happiness,
          creativity: dbStats.creativity,
          social_energy: dbStats.social_energy,
          emotional_stability: dbStats.emotional_stability
        });
      }

      const dbAchievements = await fetchUserAchievements(userId);
      if (dbAchievements && dbAchievements.length > 0) {
        const unlockedTitles = dbAchievements.map((ua: any) => ua.achievements?.title).filter(Boolean);
        setUnlockedAchievements(unlockedTitles);
      } else {
        setUnlockedAchievements(["First Commit"]);
      }

      // Try to fetch profile
      try {
        const dbProfile = await fetchProfile(userId);
        if (dbProfile) {
          if (dbProfile.display_name) setDisplayName(dbProfile.display_name);
          if (dbProfile.avatar_url) setAvatarUrl(dbProfile.avatar_url);
          if (dbProfile.username) setProfileUsername(dbProfile.username);
          if (dbProfile.bio) setProfileBio(dbProfile.bio);
          if (dbProfile.pronouns) setProfilePronouns(dbProfile.pronouns);
          if (dbProfile.location) setProfileLocation(dbProfile.location);
          if (dbProfile.website_url) setProfileWebsiteUrl(dbProfile.website_url);
          if (dbProfile.readme) setProfileReadme(dbProfile.readme);
          
          if (dbProfile.social_links) {
            const socials = typeof dbProfile.social_links === 'string'
              ? JSON.parse(dbProfile.social_links)
              : dbProfile.social_links;
            if (socials.linkedin) setProfileLinkedin(socials.linkedin);
            if (socials.instagram) setProfileInstagram(socials.instagram);
          }
        }
      } catch (err) {
        console.warn("Extended profile columns not found or database sync failed, using fallbacks:", err);
      }
    } catch (e) {
      console.error("Failed to load user data from Supabase:", e);
    } finally {
      setDbLoading(false);
    }
  };

  // Check active session on mount
  useEffect(() => {
    async function checkUser() {
      try {
        const u = await getSessionUser();
        if (u) {
          setUser(u);
          await loadUserData(u.id);
        } else {
          // Guest mode: load from localStorage
          const localName = localStorage.getItem("vom_guest_display_name");
          const localAvatar = localStorage.getItem("vom_guest_avatar_url");
          const localUsername = localStorage.getItem("vom_guest_username");
          const localBio = localStorage.getItem("vom_guest_bio");
          const localPronouns = localStorage.getItem("vom_guest_pronouns");
          const localLocation = localStorage.getItem("vom_guest_location");
          const localWebsite = localStorage.getItem("vom_guest_website");
          const localLinkedin = localStorage.getItem("vom_guest_linkedin");
          const localInstagram = localStorage.getItem("vom_guest_instagram");
          const localReadme = localStorage.getItem("vom_guest_readme");

          if (localName) setDisplayName(localName);
          if (localAvatar) setAvatarUrl(localAvatar);
          if (localUsername) setProfileUsername(localUsername);
          if (localBio) setProfileBio(localBio);
          if (localPronouns) setProfilePronouns(localPronouns);
          if (localLocation) setProfileLocation(localLocation);
          if (localWebsite) setProfileWebsiteUrl(localWebsite);
          if (localLinkedin) setProfileLinkedin(localLinkedin);
          if (localInstagram) setProfileInstagram(localInstagram);
          if (localReadme) setProfileReadme(localReadme);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    }
    checkUser();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const { data, error } = await supabaseClient.current.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await loadUserData(data.user.id);
          setShowAuthModal(false);
          enterWorkspace();
        }
      } else {
        const { data, error } = await supabaseClient.current.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          setAuthError("Verification email sent! You can now log in.");
          setAuthMode("login");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseClient.current.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setCommits(initialCommits);
    setMemories(initialMemories);
    setRelationships(initialRelationships);
    setUnlockedAchievements(["First Commit"]);
    setStats({
      level: 2,
      xp: 470,
      xpNext: 1000,
      confidence: 65,
      discipline: 72,
      happiness: 58,
      creativity: 80,
      social_energy: 45,
      emotional_stability: 68
    });
    
    // Reset to local guest data
    const localName = localStorage.getItem("vom_guest_display_name") || "Muhamad Sidik";
    const localAvatar = localStorage.getItem("vom_guest_avatar_url") || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80";
    const localUsername = localStorage.getItem("vom_guest_username") || "MyusiZ3";
    const localBio = localStorage.getItem("vom_guest_bio") || "Aspiring Game Dev | App Dev";
    const localPronouns = localStorage.getItem("vom_guest_pronouns") || "he/him";
    const localLocation = localStorage.getItem("vom_guest_location") || "West Java, Bandung, Indonesia";
    const localWebsite = localStorage.getItem("vom_guest_website") || "https://creative-portfolio-theta-rosy.vercel.app/";
    const localLinkedin = localStorage.getItem("vom_guest_linkedin") || "muhamad-sidik-a6757b25b";
    const localInstagram = localStorage.getItem("vom_guest_instagram") || "imyusi_";
    const localReadme = localStorage.getItem("vom_guest_readme") || "";

    setDisplayName(localName);
    setAvatarUrl(localAvatar);
    setProfileUsername(localUsername);
    setProfileBio(localBio);
    setProfilePronouns(localPronouns);
    setProfileLocation(localLocation);
    setProfileWebsiteUrl(localWebsite);
    setProfileLinkedin(localLinkedin);
    setProfileInstagram(localInstagram);
    setProfileReadme(localReadme);

    setViewMode("landing");
  };

  // Profile Customizer Actions
  const openProfileModal = (tab: "general" | "readme" = "general") => {
    setTempDisplayName(displayName);
    setTempUsername(profileUsername);
    setTempAvatarUrl(avatarUrl || "");
    setTempBio(profileBio);
    setTempPronouns(profilePronouns);
    setTempLocation(profileLocation);
    setTempWebsiteUrl(profileWebsiteUrl);
    setTempLinkedin(profileLinkedin);
    setTempInstagram(profileInstagram);
    setTempReadme(profileReadme);
    setProfileModalTab(tab);
    setReadmePreviewMode(false);
    
    setProfileError("");
    setProfileSuccess("");
    setShowProfileModal(true);
    if (soundEnabled && synthRef.current) {
      synthRef.current.playClick("enter");
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setTempAvatarUrl(base64);
      setProfileSuccess("Local file loaded. Click Save to upload & synchronize.");
      if (soundEnabled && synthRef.current) {
        synthRef.current.playClick("key");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      let finalAvatarUrl = tempAvatarUrl;

      // If user is authenticated, sync to Supabase
      if (user) {
        // Try uploading to Storage bucket first if it is a new base64 data URL
        if (tempAvatarUrl.startsWith("data:image")) {
          try {
            const res = await fetch(tempAvatarUrl);
            const blob = await res.blob();
            const file = new File([blob], "avatar.png", { type: "image/png" });
            const storageUrl = await uploadAvatarFile(user.id, file);
            if (storageUrl) {
              finalAvatarUrl = storageUrl;
            }
          } catch (storageErr) {
            console.warn("Storage upload failed, fallback to storing base64 URL directly:", storageErr);
          }
        }

        // Update profile record in Supabase database
        try {
          await updateProfile(user.id, {
            display_name: tempDisplayName,
            avatar_url: finalAvatarUrl,
            username: tempUsername.toLowerCase().trim(),
            bio: tempBio,
            pronouns: tempPronouns,
            location: tempLocation,
            website_url: tempWebsiteUrl,
            readme: tempReadme,
            social_links: {
              linkedin: tempLinkedin,
              instagram: tempInstagram
            }
          });
        } catch (dbErr: any) {
          console.warn("Extended profiles update failed, falling back to core columns:", dbErr);
          // Fallback update to standard columns which exist
          await updateProfile(user.id, {
            display_name: tempDisplayName,
            avatar_url: finalAvatarUrl,
            username: tempUsername.toLowerCase().trim()
          });
          setProfileSuccess("Core saved. Note: database does not support bio/links yet (saved locally).");
        }
      } else {
        // Guest mode: save all fields to localStorage
        localStorage.setItem("vom_guest_display_name", tempDisplayName);
        localStorage.setItem("vom_guest_avatar_url", finalAvatarUrl);
        localStorage.setItem("vom_guest_username", tempUsername.toLowerCase().trim());
        localStorage.setItem("vom_guest_bio", tempBio);
        localStorage.setItem("vom_guest_pronouns", tempPronouns);
        localStorage.setItem("vom_guest_location", tempLocation);
        localStorage.setItem("vom_guest_website", tempWebsiteUrl);
        localStorage.setItem("vom_guest_linkedin", tempLinkedin);
        localStorage.setItem("vom_guest_instagram", tempInstagram);
        localStorage.setItem("vom_guest_readme", tempReadme);
      }

      // Update local states in real time
      setDisplayName(tempDisplayName);
      setAvatarUrl(finalAvatarUrl || null);
      setProfileUsername(tempUsername.toLowerCase().trim() || "guest");
      setProfileBio(tempBio);
      setProfilePronouns(tempPronouns);
      setProfileLocation(tempLocation);
      setProfileWebsiteUrl(tempWebsiteUrl);
      setProfileLinkedin(tempLinkedin);
      setProfileInstagram(tempInstagram);
      setProfileReadme(tempReadme);

      if (!profileSuccess.includes("locally")) {
        setProfileSuccess("Core identity synchronized successfully.");
      }

      if (soundEnabled && synthRef.current) {
        synthRef.current.playClick("enter");
      }

      setTimeout(() => {
        setShowProfileModal(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setProfileError(err.message || "Failed to update profile core.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Editor Form States
  const [editorTitle, setEditorTitle] = useState("");
  const [editorDesc, setEditorDesc] = useState("");
  const [editorMood, setEditorMood] = useState<number>(3);
  const [editorTags, setEditorTags] = useState("");

  // Timeline Category Filter
  const [timelineFilter, setTimelineFilter] = useState("All");

  // Flash Effect on Commit
  const [commitFlash, setCommitFlash] = useState(false);

  // Initialize Audio Synth
  useEffect(() => {
    synthRef.current = new KeyboardSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stopAmbient(0.5);
      }
    };
  }, []);

  // Handle Ambient Soundscape transitions based on states
  useEffect(() => {
    if (!synthRef.current) return;
    if (viewMode === "dashboard" && ambientEnabled) {
      const moods = commits.map(c => c.mood_level);
      const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 3;
      synthRef.current.startAmbient(avgMood);
    } else {
      synthRef.current.stopAmbient(1.5);
    }
  }, [ambientEnabled, commits, viewMode]);

  // Compute Aura Gradient based on average mood
  const getAuraStyles = () => {
    const moods = commits.map(c => c.mood_level);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 3;

    if (avgMood >= 4.2) {
      // Bright Growth Aura (Green & Gold)
      return {
        gradient: "from-growth via-memory-gold to-reflection-blue",
        breathingRate: "12s",
        description: "Luminous & Vibrant",
        moodClass: "text-growth"
      };
    } else if (avgMood >= 3.3) {
      // Reflective Aura (Blue & Purple)
      return {
        gradient: "from-reflection-blue via-connection-purple to-memory-gold",
        breathingRate: "16s",
        description: "Balanced & Contemplative",
        moodClass: "text-reflection-blue"
      };
    } else if (avgMood >= 2.5) {
      // Deep Purple / Melancholy Aura
      return {
        gradient: "from-connection-purple via-elevated-surface to-loss-crimson",
        breathingRate: "20s",
        description: "Introspective & Deep",
        moodClass: "text-connection-purple"
      };
    } else {
      // Healing Crimson Aura
      return {
        gradient: "from-loss-crimson via-elevated-surface to-memory-gold",
        breathingRate: "24s",
        description: "Heavy & Searching",
        moodClass: "text-loss-crimson"
      };
    }
  };

  const aura = getAuraStyles();

  // Play keystroke sound
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!soundEnabled || !synthRef.current) return;
    
    synthRef.current.init();

    if (e.key === "Enter") {
      synthRef.current.playClick("enter");
    } else if (e.key === " ") {
      synthRef.current.playClick("space");
    } else if (e.key === "Backspace") {
      synthRef.current.playClick("backspace");
    } else if (e.key.length === 1) {
      synthRef.current.playClick("key");
    }
  };

  // Submit new commit
  const handleCommitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim()) return;

    // Play enter clack for execution sound
    if (soundEnabled && synthRef.current) {
      synthRef.current.init();
      synthRef.current.playClick("enter");
    }

    // Trigger visual commit flash
    setCommitFlash(true);
    setTimeout(() => setCommitFlash(false), 800);

    // Formulate tag array
    const tagsArray = editorTags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const xpEarned = 150 + Math.floor(Math.random() * 80);
    const randomHash = Math.random().toString(16).substring(2, 9);
    
    // Calculate new stats locally first
    const newXp = stats.xp + xpEarned;
    const leveledUp = newXp >= stats.xpNext;
    const nextStats = {
      level: leveledUp ? stats.level + 1 : stats.level,
      xp: leveledUp ? newXp - stats.xpNext : newXp,
      confidence: Math.min(100, stats.confidence + (editorMood >= 4 ? 4 : -1)),
      discipline: Math.min(100, stats.discipline + 5),
      happiness: Math.min(100, Math.max(0, stats.happiness + (editorMood - 3) * 6)),
      creativity: Math.min(100, stats.creativity + 3),
      social_energy: stats.social_energy,
      emotional_stability: Math.min(100, stats.emotional_stability + 2)
    };

    if (user) {
      // Sync to Supabase
      try {
        const savedCommit = await insertCommit(user.id, {
          title: editorTitle,
          description: editorDesc || "No description provided.",
          mood_level: editorMood,
          emotional_tags: tagsArray.length > 0 ? tagsArray : ["reflection"]
        });

        const newCommit = {
          id: savedCommit.id,
          hash: savedCommit.hash,
          title: savedCommit.title,
          description: savedCommit.description,
          mood_level: savedCommit.mood_level,
          emotional_tags: savedCommit.emotional_tags,
          created_at: savedCommit.created_at,
          xp: xpEarned
        };
        setCommits(prev => [newCommit, ...prev]);

        // Auto-save Memory to Supabase
        const savedMemory = await insertMemory(user.id, {
          title: editorTitle,
          description: editorDesc || "Log commit description.",
          category: editorMood >= 4 ? "Milestone" : "Routine",
          event_date: new Date().toISOString().split("T")[0],
          mood: editorMood === 5 ? "Ecstatic" : editorMood === 4 ? "Peaceful" : editorMood === 3 ? "Reflective" : editorMood === 2 ? "Melancholic" : "Heavy"
        });

        const newMemory = {
          id: savedMemory.id,
          title: savedMemory.title,
          description: savedMemory.description,
          category: savedMemory.category,
          event_date: savedMemory.event_date,
          mood: savedMemory.mood
        };
        setMemories(prev => [newMemory, ...prev]);

        // Update stats in Supabase
        await updateCharacterStats(user.id, nextStats);
        setStats({
          ...nextStats,
          xpNext: 1000
        });

        // Check achievements
        await checkAndUnlockAchievements(user.id, [newCommit, ...commits], nextStats);

      } catch (err) {
        console.error("Failed to save to Supabase, reverting to local fallback", err);
        // Local state fallback inside catch block
        const newCommit = {
          id: `c_${Date.now()}`,
          hash: randomHash,
          title: editorTitle,
          description: editorDesc || "No description provided.",
          mood_level: editorMood,
          emotional_tags: tagsArray.length > 0 ? tagsArray : ["reflection"],
          created_at: new Date().toISOString(),
          xp: xpEarned
        };
        setCommits(prev => [newCommit, ...prev]);

        const newMemory = {
          id: `m_${Date.now()}`,
          title: editorTitle,
          description: editorDesc || "Log commit description.",
          category: editorMood >= 4 ? "Milestone" : "Routine",
          event_date: new Date().toISOString().split("T")[0],
          mood: editorMood === 5 ? "Ecstatic" : editorMood === 4 ? "Peaceful" : editorMood === 3 ? "Reflective" : editorMood === 2 ? "Melancholic" : "Heavy"
        };
        setMemories(prev => [newMemory, ...prev]);

        setStats({
          ...nextStats,
          xpNext: 1000
        });

        checkAndUnlockAchievementsLocal([newCommit, ...commits], nextStats);
      }
    } else {
      // Local Guest fallback
      const newCommit = {
        id: `c_${Date.now()}`,
        hash: randomHash,
        title: editorTitle,
        description: editorDesc || "No description provided.",
        mood_level: editorMood,
        emotional_tags: tagsArray.length > 0 ? tagsArray : ["reflection"],
        created_at: new Date().toISOString(),
        xp: xpEarned
      };
      setCommits(prev => [newCommit, ...prev]);

      const newMemory = {
        id: `m_${Date.now()}`,
        title: editorTitle,
        description: editorDesc || "Log commit description.",
        category: editorMood >= 4 ? "Milestone" : "Routine",
        event_date: new Date().toISOString().split("T")[0],
        mood: editorMood === 5 ? "Ecstatic" : editorMood === 4 ? "Peaceful" : editorMood === 3 ? "Reflective" : editorMood === 2 ? "Melancholic" : "Heavy"
      };
      setMemories(prev => [newMemory, ...prev]);

      setStats({
        ...nextStats,
        xpNext: 1000
      });

      checkAndUnlockAchievementsLocal([newCommit, ...commits], nextStats);
    }

    // Reset Fields
    setEditorTitle("");
    setEditorDesc("");
    setEditorTags("");
    setEditorMood(3);

    // Return to log tab
    setActiveTab("log");
  };

  // Start editing commit
  const startEditCommit = (commit: any) => {
    setEditingCommitId(commit.id);
    setEditTitle(commit.title);
    setEditDesc(commit.description);
    setEditMood(commit.mood_level);
    setEditTags(commit.emotional_tags ? commit.emotional_tags.join(", ") : "");
  };

  // Save edited commit
  const handleSaveCommit = async (commitId: string) => {
    setEditSaving(true);
    const tagsArray = editTags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    try {
      if (user) {
        await updateCommit(user.id, commitId, {
          title: editTitle,
          description: editDesc,
          mood_level: editMood,
          emotional_tags: tagsArray.length > 0 ? tagsArray : ["reflection"]
        });
      }

      // Update state in real-time
      setCommits(prev =>
        prev.map(c =>
          c.id === commitId
            ? {
                ...c,
                title: editTitle,
                description: editDesc,
                mood_level: editMood,
                emotional_tags: tagsArray.length > 0 ? tagsArray : ["reflection"]
              }
            : c
        )
      );

      // Play enter synth sound
      if (soundEnabled && synthRef.current) {
        synthRef.current.playClick("enter");
      }

      setEditingCommitId(null);
    } catch (err) {
      console.error("Failed to update commit:", err);
      alert("Failed to update commit. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete commit
  const handleDeleteCommit = async (commitId: string) => {
    if (!confirm("Are you sure you want to delete this commit from your timeline? This action is permanent.")) {
      return;
    }

    try {
      if (user) {
        await deleteCommit(user.id, commitId);
      }

      // Update state
      setCommits(prev => prev.filter(c => c.id !== commitId));

      // Play delete/loss sound
      if (soundEnabled && synthRef.current) {
        synthRef.current.playClick("backspace");
      }
    } catch (err) {
      console.error("Failed to delete commit:", err);
      alert("Failed to delete commit. Please try again.");
    }
  };

  // Submit new relationship
  const handleRelationshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relName.trim()) return;

    if (soundEnabled && synthRef.current) {
      synthRef.current.init();
      synthRef.current.playClick("enter");
    }

    setRelSubmitLoading(true);
    const newRelData = {
      name: relName,
      status: relStatus,
      emotional_impact: relImpact,
      last_interaction: new Date().toISOString().split("T")[0]
    };

    if (user) {
      try {
        const savedRel = await insertRelationship(user.id, newRelData);
        const newRel = {
          id: savedRel.id,
          name: savedRel.name,
          status: savedRel.status,
          emotional_impact: savedRel.emotional_impact,
          last_interaction: savedRel.last_interaction
        };
        setRelationships(prev => [newRel, ...prev]);
        setShowAddRelation(false);
        setRelName("");
        setRelStatus("Active");
        setRelImpact(3);
      } catch (err) {
        console.error("Failed to save relationship to Supabase, falling back to local storage", err);
        // Fallback to local
        const localRel = {
          id: `r_${Date.now()}`,
          ...newRelData
        };
        setRelationships(prev => [localRel, ...prev]);
        setShowAddRelation(false);
        setRelName("");
        setRelStatus("Active");
        setRelImpact(3);
      } finally {
        setRelSubmitLoading(false);
      }
    } else {
      // Guest local
      const localRel = {
        id: `r_${Date.now()}`,
        ...newRelData
      };
      setRelationships(prev => [localRel, ...prev]);
      setShowAddRelation(false);
      setRelName("");
      setRelStatus("Active");
      setRelImpact(3);
      setRelSubmitLoading(false);
    }
  };

  // Helper to auto-unlock achievements
  const checkAndUnlockAchievements = async (userId: string, currentCommits: any[], currentStats: any) => {
    const newUnlocked: string[] = [];
    
    // 1. Discipline Master
    if (currentStats.discipline >= 80 && !unlockedAchievements.includes("Discipline Master")) {
      newUnlocked.push("Discipline Master");
    }
    
    // 2. Luminous Heart
    if (currentStats.happiness >= 90 && !unlockedAchievements.includes("Luminous Heart")) {
      newUnlocked.push("Luminous Heart");
    }
    
    // 3. Emotional Explorer
    const moods = new Set(currentCommits.map(c => c.mood_level));
    if (moods.size >= 5 && !unlockedAchievements.includes("Emotional Explorer")) {
      newUnlocked.push("Emotional Explorer");
    }

    for (const title of newUnlocked) {
      try {
        await unlockAchievement(userId, title);
        setUnlockedAchievements(prev => [...prev, title]);
      } catch (e) {
        console.error(`Failed to unlock achievement ${title}:`, e);
      }
    }
  };

  const checkAndUnlockAchievementsLocal = (currentCommits: any[], currentStats: any) => {
    const newUnlocked: string[] = [];
    if (currentStats.discipline >= 80 && !unlockedAchievements.includes("Discipline Master")) {
      newUnlocked.push("Discipline Master");
    }
    if (currentStats.happiness >= 90 && !unlockedAchievements.includes("Luminous Heart")) {
      newUnlocked.push("Luminous Heart");
    }
    const moods = new Set(currentCommits.map(c => c.mood_level));
    if (moods.size >= 5 && !unlockedAchievements.includes("Emotional Explorer")) {
      newUnlocked.push("Emotional Explorer");
    }
    if (newUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocked]);
    }
  };

  // Transition to dashboard with gesture sound activation
  const enterWorkspace = () => {
    if (synthRef.current) {
      synthRef.current.init();
      if (soundEnabled) synthRef.current.playClick("enter");
    }
    setViewMode("dashboard");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      
      {/* BACKGROUND ATMOSPHERIC GRADIENTS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Shifting Aura Ambient Orb */}
        <div 
          className={`absolute top-1/4 -left-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br ${aura.gradient} rounded-full aura-orb-base transition-all duration-1000`} 
          style={{ animationDuration: aura.breathingRate }}
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(var(--color-elevated-surface) 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* FLASH SCREEN EFFECT FOR LIFE COMMITS */}
      <div 
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-700 ease-out ${
          commitFlash ? "opacity-[0.06]" : "opacity-0"
        }`}
      />

      {/* HEADER */}
      <header className="relative z-10 w-full px-6 py-6 md:px-12 flex justify-between items-center border-b border-white/[0.03] backdrop-blur-md">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode("landing")}>
          <div className="w-9 h-9 rounded-xs border border-text-secondary/15 flex items-center justify-center bg-memory-surface/50 shadow-inner">
            <span className="font-mono text-growth text-xs font-bold font-mono">VM</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-text-primary">Version of Me</span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setAmbientEnabled(!ambientEnabled)} 
            className="text-text-muted hover:text-text-primary transition-colors flex items-center space-x-2 text-xs font-mono"
            title={ambientEnabled ? "Mute ambient pad" : "Unmute ambient pad"}
          >
            <Sparkles size={14} className={ambientEnabled ? "text-memory-gold animate-pulse" : "text-text-disabled"} />
            <span className={ambientEnabled ? "text-text-primary" : "text-text-disabled"}>
              {ambientEnabled ? "AMBIENT ACTIVE" : "AMBIENT OFF"}
            </span>
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-text-muted hover:text-text-primary transition-colors flex items-center space-x-2 text-xs font-mono"
            title={soundEnabled ? "Mute typing sound" : "Unmute typing sound"}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} className="text-growth" />
                <span className="hidden md:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX size={14} className="text-text-disabled" />
                <span className="hidden md:inline text-text-disabled">MUTED</span>
              </>
            )}
          </button>

          {/* Real-time profile identity indicator */}
          <div 
            onClick={() => openProfileModal()} 
            className="flex items-center space-x-2 border-l border-white/5 pl-4 cursor-pointer hover:opacity-80 transition-opacity"
            title="Configure Profile"
          >
            <div className="relative w-6 h-6 rounded-xs overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif italic text-[10px] text-gradient-gold">
                  {displayName.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-mono text-[9px] text-text-secondary truncate max-w-[80px] hidden sm:inline-block">
              {displayName}
            </span>
          </div>

          {user ? (
            <button 
              onClick={handleLogout} 
              className="text-[10px] font-mono text-loss-crimson hover:text-text-primary transition-colors border border-loss-crimson/15 px-3 py-1.5 rounded-xs bg-loss-crimson/5 uppercase tracking-wider"
              title={`Logged in as ${user.email}`}
            >
              [ DISCONNECT SYNC ]
            </button>
          ) : (
            <button 
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }} 
              className="text-[10px] font-mono text-growth hover:text-text-primary transition-colors border border-growth/15 px-3 py-1.5 rounded-xs bg-growth/5 uppercase tracking-wider"
            >
              [ CONNECT CLOUD ]
            </button>
          )}
        </div>
      </header>

      {/* ========================================================== */}
      {/* 1. CINEMATIC LANDING VIEW                                  */}
      {/* ========================================================== */}
      {viewMode === "landing" && (
        <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-6 py-12 text-center max-w-5xl mx-auto">
          
          <div className="space-y-4 mb-6">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-growth inline-flex items-center space-x-2">
              <Sparkles size={12} className="animate-pulse mr-1" />
              THE PERSONAL DIGITAL ARCHIVE
            </span>
            <h1 className="font-serif text-6xl md:text-8xl tracking-tight text-text-primary font-normal leading-[1.05]">
              Your life, <br />
              <span className="italic text-gradient-gold">versioned.</span>
            </h1>
          </div>

          <p className="max-w-xl text-text-secondary text-base md:text-lg font-light leading-relaxed mb-12">
            A secure emotional sanctuary built to represent a human life as an evolving codebase. Log life commits, track your inner stats, and build your timeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button 
              onClick={enterWorkspace}
              className="glow-btn px-8 py-4 bg-text-primary text-deep-archive rounded-xs font-mono text-xs tracking-wider uppercase flex items-center space-x-3 hover:bg-growth hover:text-deep-archive transition-all shadow-lg hover:shadow-growth/15"
            >
              <span>{user ? "Enter Cloud Workspace" : "Enter Offline Guest Sandbox"}</span>
              <ArrowRight size={14} />
            </button>

            {!user && (
              <button 
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="px-8 py-4 border border-growth/20 text-growth hover:bg-growth/5 transition-all rounded-xs font-mono text-xs tracking-wider uppercase flex items-center space-x-2"
              >
                <Lock size={12} />
                <span>Sync Cloud Vault</span>
              </button>
            )}

            <a 
              href="#learn-more"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-4 border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all rounded-xs font-mono text-xs tracking-wider uppercase"
            >
              Read Philosophy
            </a>
          </div>

          {/* Active Profile README Block (Landing View) */}
          {profileReadme ? (
            <div className="w-full max-w-2xl mt-12 text-left animate-fade-in">
              <div className="glass-panel p-6 rounded-sm relative overflow-hidden flex flex-col shadow-lg border border-white/[0.04] space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                  <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase flex items-center gap-2">
                    <BookOpen size={12} className="text-growth animate-pulse" />
                    {profileUsername || (user ? user.email?.split('@')[0] : "guest")} / README.md
                  </span>
                  <button
                    onClick={() => openProfileModal("readme")}
                    className="font-mono text-[9px] text-text-muted hover:text-growth transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
                  >
                    <Edit2 size={10} />
                    [ EDIT ]
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed text-text-secondary font-sans markdown-content">
                  <MarkdownRenderer content={profileReadme} />
                </div>
              </div>
            </div>
          ) : (
            user && (
              <div className="w-full max-w-2xl mt-12 text-left animate-fade-in">
                <div className="glass-panel p-5 rounded-sm relative overflow-hidden flex items-center justify-between shadow-md border border-dashed border-white/10 hover:border-growth/30 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 text-left">
                    <BookOpen size={16} className="text-text-muted group-hover:text-growth transition-colors" />
                    <div>
                      <p className="font-mono text-[10px] text-text-primary uppercase tracking-wider font-bold">Discover the README profile feature</p>
                      <p className="text-[10px] text-text-secondary font-light font-sans mt-0.5">Create a premium GitHub-style markdown bio to showcase on your landing workspace.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openProfileModal("readme")}
                    className="font-mono text-[10px] text-text-muted hover:text-growth transition-colors shrink-0 px-3 py-1.5 bg-white/5 hover:bg-growth/15 rounded-xs border border-white/5 hover:border-growth/20"
                  >
                    [ INITIALIZE ]
                  </button>
                </div>
              </div>
            )
          )}

          {/* Decorative Specs Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full border-t border-white/[0.04] pt-8 font-mono text-left">
            <div className="p-4 rounded-xs bg-memory-surface/10 border border-white/[0.02]">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Architecture</span>
              <span className="text-xs text-text-primary block flex items-center">
                <Database size={12} className="mr-1.5 text-reflection-blue" />
                Supabase PostgreSQL
              </span>
            </div>
            <div className="p-4 rounded-xs bg-memory-surface/10 border border-white/[0.02]">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Interface Grade</span>
              <span className="text-xs text-text-primary block flex items-center">
                <Shield size={12} className="mr-1.5 text-growth" />
                Editorial Dark Glass
              </span>
            </div>
            <div className="p-4 rounded-xs bg-memory-surface/10 border border-white/[0.02]">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Acoustic Feedback</span>
              <span className="text-xs text-text-primary block flex items-center">
                <Volume2 size={12} className="mr-1.5 text-connection-purple" />
                Tactile Audio Synth
              </span>
            </div>
            <div className="p-4 rounded-xs bg-memory-surface/10 border border-white/[0.02]">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Data Custody</span>
              <span className="text-xs text-text-primary block flex items-center">
                <Lock size={12} className="mr-1.5 text-memory-gold" />
                Row-Level Secure
              </span>
            </div>
          </div>

          {/* Philosophy Section */}
          <section id="learn-more" className="w-full mt-32 border-t border-white/[0.05] pt-24 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted block mb-4">THE RE-IMAGINED LOGGING</span>
                <h2 className="font-serif text-4xl md:text-5xl leading-tight text-text-primary mb-6">
                  You are not a task board. <br />
                  You are a <span className="italic text-gradient-purple">living archive.</span>
                </h2>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 font-light">
                  Standard tracking apps reduce human experience to sterile checkboxes, metrics, and streaks. We believe life is more elegant.
                </p>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed font-light">
                  By tracking life as code commits—each with its hash, mood, emotional context, and attributes—we build a detailed narrative that grows alongside you, represented by a responsive glowing aura.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-sm relative overflow-hidden border border-white/[0.05]">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <span className="font-mono text-xs text-growth uppercase tracking-wider block">commit_preview.sh</span>
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-loss-crimson/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-memory-gold/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-growth/40" />
                  </div>
                </div>
                
                <div className="font-mono text-xs space-y-4">
                  <div className="text-text-muted">
                    $ git log --oneline --graph --color
                  </div>
                  <div className="space-y-2 border-l border-white/10 pl-4 py-1">
                    <div>
                      <span className="text-growth font-bold">* commit 81fd2e5</span>{" "}
                      <span className="text-text-secondary">- learned to trust myself again</span>
                    </div>
                    <div className="text-text-disabled text-[10px] pl-4">
                      Author: You &lt;soul@archive&gt; | Mood: Hopeful
                    </div>
                    <div className="text-text-muted pl-4">
                      Attributes: +Confidence, +Discipline, +150XP
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-l border-white/10 pl-4 py-1">
                    <div>
                      <span className="text-connection-purple font-bold">* commit a4c28f9</span>{" "}
                      <span className="text-text-secondary">- archived a fading childhood circle</span>
                    </div>
                    <div className="text-text-disabled text-[10px] pl-4">
                      Author: You &lt;soul@archive&gt; | Mood: Melancholic
                    </div>
                    <div className="text-text-muted pl-4">
                      Attributes: -SocialEnergy, +EmotionalStability
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-text-muted">
                    <span>AURA STATE: CONTEMPLATIVE</span>
                    <span className="text-growth">LEVEL 02 [|||||.....]</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ========================================================== */}
      {/* 2. DYNAMIC WORKSPACE DASHBOARD VIEW                        */}
      {/* ========================================================== */}
      {viewMode === "dashboard" && (
        <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: DYNAMIC AURA & DOCK STATUS PANEL (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* 1. Premium GitHub Profile Identity Card */}
            <div className="glass-panel p-6 rounded-md relative overflow-hidden flex flex-col shadow-lg border border-white/[0.04] space-y-4">
              {/* Header Decorator */}
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">
                  [ SECURE_IDENTITY_CARD ]
                </span>
                <button 
                  onClick={() => openProfileModal()}
                  className="text-text-muted hover:text-text-primary transition-all p-1 hover:bg-white/5 rounded-xs flex items-center space-x-1.5"
                  title="Customize Identity"
                >
                  <Edit2 size={11} className="text-growth" />
                  <span className="font-mono text-[9px] tracking-wider uppercase">EDIT</span>
                </button>
              </div>

              {/* Avatar & User Core Meta */}
              <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer shrink-0" onClick={() => openProfileModal()}>
                  {/* Glow Backdrop */}
                  <div className="absolute inset-0 bg-growth/20 rounded-xs filter blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Actual Avatar */}
                  <div className="relative w-16 h-16 rounded-xs border border-white/10 overflow-hidden bg-deep-archive/60 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif italic text-2xl text-gradient-gold">{displayName.charAt(0)}</span>
                    )}
                    
                    {/* Camera Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Camera size={16} className="text-white animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline space-x-1.5 flex-wrap">
                    <h2 className="font-serif text-base text-text-primary truncate font-bold leading-tight">
                      {displayName}
                    </h2>
                    {profilePronouns && (
                      <span className="font-mono text-[9px] text-text-muted px-1.5 py-0.2 bg-white/5 border border-white/5 rounded-xs">
                        {profilePronouns}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-growth truncate">
                    @{profileUsername}
                  </p>
                </div>
              </div>

              {/* Bio Block */}
              {profileBio && (
                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xs text-left">
                  <p className="font-sans text-xs font-light text-text-secondary leading-relaxed italic">
                    "{profileBio}"
                  </p>
                </div>
              )}

              {/* Metadata Grid (GitHub style) */}
              <div className="space-y-2 pt-2 border-t border-white/[0.03] font-mono text-[10px] text-text-secondary text-left">
                {profileLocation && (
                  <div className="flex items-center space-x-2.5">
                    <MapPin size={11} className="text-text-muted shrink-0" />
                    <span className="truncate">{profileLocation}</span>
                  </div>
                )}

                {profileWebsiteUrl && (
                  <div className="flex items-center space-x-2.5">
                    <Globe size={11} className="text-text-muted shrink-0" />
                    <a 
                      href={profileWebsiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-reflection-blue hover:underline truncate"
                    >
                      {profileWebsiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {/* Social Links Block */}
                {(profileLinkedin || profileInstagram) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                    {profileLinkedin && (
                      <div className="flex items-center space-x-1.5">
                        <Linkedin size={10} className="text-text-muted shrink-0" />
                        <a 
                          href={`https://linkedin.com/in/${profileLinkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-text-primary transition-colors text-[9px]"
                        >
                          in/{profileLinkedin}
                        </a>
                      </div>
                    )}
                    {profileInstagram && (
                      <div className="flex items-center space-x-1.5">
                        <Instagram size={10} className="text-text-muted shrink-0" />
                        <a 
                          href={`https://instagram.com/${profileInstagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-text-primary transition-colors text-[9px]"
                        >
                          @{profileInstagram}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Dynamic Aura Orb & Status Panel */}
            <div className="glass-panel p-6 rounded-md relative overflow-hidden flex flex-col items-center text-center shadow-lg border border-white/[0.04]">
              <span className="absolute top-4 left-4 font-mono text-[9px] text-text-muted tracking-widest uppercase">
                [ SECURE_CORE_AURA ]
              </span>
              
              <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />
                <span className="font-mono text-[9px] text-growth uppercase tracking-widest">LIVE</span>
              </div>

              {/* Dynamic Aura Orb Representation */}
              <div className="relative w-48 h-48 my-8 flex items-center justify-center">
                {/* Glowing Aura Outer */}
                <div className={`absolute w-36 h-36 bg-gradient-to-tr ${aura.gradient} rounded-full filter blur-[40px] opacity-75 animate-pulse`} />
                
                {/* Core Sphere */}
                <div className="relative w-28 h-28 rounded-full bg-deep-archive border border-white/10 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md">
                  <span className="font-serif italic text-3xl text-gradient-gold">V</span>
                  <span className="font-mono text-[10px] text-text-muted mt-1">Level {stats.level}</span>
                </div>
              </div>

              {/* Character State Specs */}
              <div className="w-full space-y-4 pt-4 border-t border-white/[0.04]">
                <div>
                  <h3 className="font-serif text-xl text-text-primary capitalize">{aura.description} Aura</h3>
                  <p className="text-[10px] font-mono text-text-muted tracking-wider uppercase mt-1">
                    Current archive resonance: <span className={aura.moodClass}>active</span>
                  </p>
                </div>

                {/* Level Progress Bar */}
                <div className="space-y-1.5 text-left font-mono">
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>ARCHIVE INDEX</span>
                    <span>{stats.xp} / {stats.xpNext} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-memory-surface border border-white/5 rounded-xs overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-growth to-reflection-blue transition-all duration-500 ease-out" 
                      style={{ width: `${(stats.xp / stats.xpNext) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Character Stat Grid (Self Attributes) */}
            <div className="glass-panel p-6 rounded-md shadow-lg border border-white/[0.04] space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                  [ SOUL_METRICS_DUMP ]
                </span>
                <Activity size={12} className="text-growth" />
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                {/* Stat row: Confidence */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">CONFIDENCE</span>
                    <span className="text-growth">{stats.confidence}%</span>
                  </div>
                  <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden">
                    <div className="h-full bg-growth transition-all duration-500" style={{ width: `${stats.confidence}%` }} />
                  </div>
                </div>

                {/* Stat row: Discipline */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">DISCIPLINE</span>
                    <span className="text-memory-gold">{stats.discipline}%</span>
                  </div>
                  <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden">
                    <div className="h-full bg-memory-gold transition-all duration-500" style={{ width: `${stats.discipline}%` }} />
                  </div>
                </div>

                {/* Stat row: Happiness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">HAPPINESS</span>
                    <span className="text-reflection-blue">{stats.happiness}%</span>
                  </div>
                  <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden">
                    <div className="h-full bg-reflection-blue transition-all duration-500" style={{ width: `${stats.happiness}%` }} />
                  </div>
                </div>

                {/* Stat row: Creativity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">CREATIVITY</span>
                    <span className="text-connection-purple">{stats.creativity}%</span>
                  </div>
                  <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden">
                    <div className="h-full bg-connection-purple transition-all duration-500" style={{ width: `${stats.creativity}%` }} />
                  </div>
                </div>

                {/* Stat row: Stability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">STABILITY</span>
                    <span className="text-text-primary">{stats.emotional_stability}%</span>
                  </div>
                  <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden">
                    <div className="h-full bg-text-secondary transition-all duration-500" style={{ width: `${stats.emotional_stability}%` }} />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TABS NAVIGATION & CORE WORKSPACE MODULES (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* Dock Menu Switcher */}
            <div className="glass-panel p-2 rounded-sm border border-white/[0.04] flex items-center justify-between w-full font-mono text-[11px] overflow-x-auto">
              <div className="flex space-x-1 w-full">
                <button
                  onClick={() => setActiveTab("log")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xs transition-all w-full md:w-auto justify-center ${
                    activeTab === "log" 
                      ? "bg-elevated-surface text-growth border border-white/5" 
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <GitCommit size={12} />
                  <span>[ 01_log ]</span>
                </button>

                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xs transition-all w-full md:w-auto justify-center ${
                    activeTab === "timeline" 
                      ? "bg-elevated-surface text-memory-gold border border-white/5" 
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Calendar size={12} />
                  <span>[ 02_timeline ]</span>
                </button>

                <button
                  onClick={() => setActiveTab("relationships")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xs transition-all w-full md:w-auto justify-center ${
                    activeTab === "relationships" 
                      ? "bg-elevated-surface text-connection-purple border border-white/5" 
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Users size={12} />
                  <span>[ 03_social ]</span>
                </button>

                <button
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xs transition-all w-full md:w-auto justify-center ${
                    activeTab === "editor" 
                      ? "bg-elevated-surface text-reflection-blue border border-white/5" 
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <BookOpen size={12} />
                  <span>[ 04_commit ]</span>
                </button>
              </div>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="flex-grow min-h-[500px]">
              
              {/* ======================================================== */}
              {/* TAB 01: LIFE COMMITS (GIT STYLE HISTORY)                 */}
              {/* ======================================================== */}
              {activeTab === "log" && (
                <div className="space-y-6">
                  {/* Tab header */}
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      $ git log --oneline --emotional-attributes
                    </span>
                    <span className="font-mono text-[10px] text-text-disabled uppercase">
                      Total commits: {commits.length}
                    </span>
                  </div>

                  {/* Premium Profile README Block (GitHub Style) */}
                  {profileReadme ? (
                    <div className="glass-panel p-6 rounded-sm relative overflow-hidden flex flex-col shadow-lg border border-white/[0.04] space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                        <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase flex items-center gap-2">
                          <BookOpen size={12} className="text-growth animate-pulse" />
                          {profileUsername || "guest"} / README.md
                        </span>
                        <button
                          onClick={() => openProfileModal("readme")}
                          className="font-mono text-[9px] text-text-muted hover:text-growth transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
                        >
                          <Edit2 size={10} />
                          [ EDIT ]
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none text-xs leading-relaxed text-text-secondary font-sans markdown-content">
                        <MarkdownRenderer content={profileReadme} />
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-5 rounded-sm relative overflow-hidden flex items-center justify-between shadow-md border border-dashed border-white/10 hover:border-growth/30 transition-all duration-300 group">
                      <div className="flex items-center space-x-3 text-left">
                        <BookOpen size={16} className="text-text-muted group-hover:text-growth transition-colors" />
                        <div>
                          <p className="font-mono text-[10px] text-text-primary uppercase tracking-wider font-bold">Discover the README profile feature</p>
                          <p className="text-[10px] text-text-secondary font-light font-sans mt-0.5">Create a premium GitHub-style markdown bio to showcase on your workspace profile dashboard.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openProfileModal("readme")}
                        className="font-mono text-[10px] text-text-muted hover:text-growth transition-colors shrink-0 px-3 py-1.5 bg-white/5 hover:bg-growth/15 rounded-xs border border-white/5 hover:border-growth/20"
                      >
                        [ INITIALIZE ]
                      </button>
                    </div>
                  )}

                  {/* Commits Git List */}
                  <div className="relative pl-6 space-y-6">
                    {/* The continuous vertical connector line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 commit-timeline-line opacity-30" />

                    {commits.map((c) => {
                      // Mood styling mapping
                      const getMoodAccent = (mood: number) => {
                        switch(mood) {
                          case 5: return { bg: "bg-growth/10", border: "border-growth/20", text: "text-growth", label: "Elated" };
                          case 4: return { bg: "bg-reflection-blue/10", border: "border-reflection-blue/20", text: "text-reflection-blue", label: "Peaceful" };
                          case 3: return { bg: "bg-memory-gold/10", border: "border-memory-gold/20", text: "text-memory-gold", label: "Balanced" };
                          case 2: return { bg: "bg-connection-purple/10", border: "border-connection-purple/20", text: "text-connection-purple", label: "Somber" };
                          default: return { bg: "bg-loss-crimson/10", border: "border-loss-crimson/20", text: "text-loss-crimson", label: "Heavy" };
                        }
                      };

                      const moodMap = getMoodAccent(c.mood_level);

                      return (
                        <div key={c.id} className="relative group">
                          
                          {/* Timeline node */}
                          <div className={`absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border border-deep-archive transition-all duration-300 bg-elevated-surface group-hover:scale-125 group-hover:bg-growth`} />

                          {/* Commit Card */}
                          <div className="glass-card p-5 rounded-sm shadow-md flex flex-col space-y-3 relative overflow-hidden">
                            {editingCommitId === c.id ? (
                              <div className="space-y-4 text-left font-mono text-xs pt-1">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-text-muted uppercase tracking-wider block">Title</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-1.5 focus:border-growth focus:outline-none text-text-primary text-xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] text-text-muted uppercase tracking-wider block">Description</label>
                                  <textarea
                                    rows={3}
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-1.5 focus:border-growth focus:outline-none text-text-primary text-xs font-sans font-light resize-none leading-relaxed"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-text-muted uppercase tracking-wider block">Mood Impact</label>
                                    <div className="flex space-x-1">
                                      {[1, 2, 3, 4, 5].map((level) => {
                                        const moods = ["Heavy", "Somber", "Balanced", "Peaceful", "Elated"];
                                        const isActive = editMood === level;
                                        return (
                                          <button
                                            key={level}
                                            type="button"
                                            onClick={() => setEditMood(level)}
                                            title={moods[level - 1]}
                                            className={`w-7 h-7 rounded-xs border flex items-center justify-center font-bold text-xs transition-all ${
                                              isActive
                                                ? "bg-growth/20 border-growth text-growth scale-105"
                                                : "bg-deep-archive border-white/5 text-text-muted hover:text-text-primary"
                                            }`}
                                          >
                                            {level}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] text-text-muted uppercase tracking-wider block">Emotional Tags (comma separated)</label>
                                    <input
                                      type="text"
                                      value={editTags}
                                      onChange={(e) => setEditTags(e.target.value)}
                                      placeholder="e.g. routine, victory, stress"
                                      className="w-full bg-deep-archive border border-white/10 rounded-xs px-3 py-1.5 focus:border-growth focus:outline-none text-text-primary text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-white/[0.03]">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommitId(null)}
                                    className="px-3 py-1.5 text-text-muted hover:text-text-primary transition-colors text-[10px] uppercase font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCommit(c.id)}
                                    disabled={editSaving}
                                    className="px-4 py-1.5 bg-growth text-deep-archive rounded-xs font-bold text-[10px] uppercase hover:bg-growth-hover transition-colors disabled:opacity-50 flex items-center"
                                  >
                                    {editSaving ? "Saving..." : "Save Commit"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                  <div className="space-y-1 text-left">
                                    <span className="font-mono text-[10px] text-text-disabled mr-2">
                                      commit <span className="text-growth/80">{c.hash}</span>
                                    </span>
                                    <h3 className="font-serif text-lg text-text-primary capitalize leading-tight">
                                      {c.title}
                                    </h3>
                                  </div>

                                  <div className="flex items-center space-x-3 shrink-0">
                                    <span className={`font-mono text-[9px] border px-2 py-0.5 rounded-xs ${moodMap.bg} ${moodMap.border} ${moodMap.text}`}>
                                      {moodMap.label}
                                    </span>
                                    <span className="font-mono text-[9px] text-text-disabled">
                                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    
                                    {/* Action Buttons on Hover */}
                                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={() => startEditCommit(c)}
                                        className="text-text-muted hover:text-growth transition-colors p-1"
                                        title="Edit Commit"
                                      >
                                        <Edit2 size={10} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCommit(c.id)}
                                        className="text-text-muted hover:text-loss-crimson transition-colors p-1"
                                        title="Delete Commit"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="w-3 h-3"
                                        >
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-text-secondary text-xs font-light leading-relaxed text-left">
                                  {c.description}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.02]">
                                  {/* Tags */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {c.emotional_tags.map(tag => (
                                      <span key={tag} className="font-mono text-[9px] text-text-muted hover:text-text-primary transition-colors">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>

                                  {/* XP rewards */}
                                  <span className="font-mono text-[10px] text-growth flex items-center font-bold">
                                    <Zap size={10} className="mr-1" />
                                    +{c.xp} XP
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 02: INTERACTIVE TIMELINE ERA (MEMORIES)              */}
              {/* ======================================================== */}
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/[0.03] pb-3 gap-3">
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      $ filter --timeline-nodes
                    </span>
                    
                    {/* Category Filter buttons */}
                    <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
                      {["All", "Milestone", "Career", "Routine"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setTimelineFilter(cat)}
                          className={`px-2.5 py-1 rounded-xs transition-all ${
                            timelineFilter === cat 
                              ? "bg-memory-gold/10 text-memory-gold border border-memory-gold/20" 
                              : "text-text-muted border border-white/5 hover:text-text-primary"
                          }`}
                        >
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empty state handling */}
                  {memories.filter(m => timelineFilter === "All" || m.category === timelineFilter).length === 0 ? (
                    <div className="py-24 text-center glass-panel rounded-sm border border-white/[0.03]">
                      <span className="font-serif italic text-lg text-text-muted block">
                        "This chapter hasn't been written yet."
                      </span>
                      <span className="font-mono text-[10px] text-text-disabled mt-1 block">
                        Try logging a memory with the {timelineFilter} category tag.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {memories
                        .filter(m => timelineFilter === "All" || m.category === timelineFilter)
                        .map((m) => (
                          <div key={m.id} className="glass-card p-5 rounded-sm flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center font-mono text-[9px] text-text-muted">
                                <span className="flex items-center">
                                  <Calendar size={10} className="mr-1 text-memory-gold" />
                                  {new Date(m.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className={`uppercase px-2 py-0.5 border rounded-xs ${
                                  m.category === "Milestone" 
                                    ? "text-memory-gold border-memory-gold/20 bg-memory-gold/5" 
                                    : "text-reflection-blue border-reflection-blue/20 bg-reflection-blue/5"
                                }`}>
                                  {m.category}
                                </span>
                              </div>

                              <h3 className="font-serif text-lg text-text-primary leading-snug">{m.title}</h3>
                              <p className="text-text-secondary text-xs font-light leading-relaxed">{m.description}</p>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/[0.02] font-mono text-[10px] text-text-disabled">
                              <span>Mood index: {m.mood}</span>
                              <span className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">Explore details →</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 03: SOCIAL GRAPH (RELATIONSHIPS MAP)                 */}
              {/* ======================================================== */}
              {activeTab === "relationships" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      $ relations --emotional-impact-map
                    </span>
                    <button 
                      onClick={() => {
                        if (soundEnabled && synthRef.current) synthRef.current.playClick("enter");
                        setShowAddRelation(!showAddRelation);
                      }}
                      className="font-mono text-[10px] text-text-muted hover:text-white transition-colors bg-white/[0.03] hover:bg-white/[0.08] px-2.5 py-1 rounded-xs border border-white/[0.05]"
                    >
                      {showAddRelation ? "CLOSE FORM" : "+ ADD CONNECTION"}
                    </button>
                  </div>

                  {/* Add Connection Form */}
                  {showAddRelation && (
                    <form 
                      onSubmit={handleRelationshipSubmit} 
                      className="glass-card p-5 rounded-sm space-y-4 border border-white/[0.08] animate-fade-in"
                    >
                      <h4 className="font-serif text-base text-text-primary">Establish Connection</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-mono text-[10px] text-text-secondary uppercase">Connection Name</label>
                          <input 
                            type="text" 
                            value={relName}
                            onChange={(e) => setRelName(e.target.value)}
                            placeholder="e.g. Mentor, Partner, Self"
                            required
                            className="w-full bg-white/[0.02] border border-white/[0.08] px-3 py-2 rounded-xs font-mono text-xs text-text-primary focus:outline-none focus:border-white/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[10px] text-text-secondary uppercase">Status Mode</label>
                          <select 
                            value={relStatus}
                            onChange={(e) => setRelStatus(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/[0.08] px-3 py-2 rounded-xs font-mono text-xs text-text-primary focus:outline-none focus:border-white/20"
                          >
                            <option value="Active" className="bg-black text-white">Active (Nurturing / Resonating)</option>
                            <option value="Faded" className="bg-black text-white">Faded (Distant / Nostalgic)</option>
                            <option value="Conflict" className="bg-black text-white">Conflict (Strained / Instructive)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="font-mono text-[10px] text-text-secondary uppercase">Emotional Resonance (-5 to +5)</label>
                          <span className={`font-mono text-xs ${relImpact >= 0 ? "text-growth" : "text-loss-crimson"}`}>
                            {relImpact >= 0 ? `+${relImpact}` : relImpact}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="-5" 
                          max="5"
                          value={relImpact}
                          onChange={(e) => setRelImpact(parseInt(e.target.value))}
                          className="w-full accent-growth"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-2">
                        <button 
                          type="button"
                          onClick={() => {
                            if (soundEnabled && synthRef.current) synthRef.current.playClick("backspace");
                            setShowAddRelation(false);
                          }}
                          className="font-mono text-[10px] text-text-muted hover:text-text-primary px-3 py-1.5 transition-colors uppercase"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={relSubmitLoading}
                          className="font-mono text-[10px] bg-white text-black hover:bg-neutral-200 px-4 py-1.5 rounded-xs transition-colors uppercase disabled:opacity-50"
                        >
                          {relSubmitLoading ? "Saving..." : "Lock Connection"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relationships.map((r) => {
                      const getStatusColor = (status: string) => {
                        switch(status) {
                          case "Active": return "text-growth bg-growth/5 border-growth/20";
                          case "Faded": return "text-memory-gold bg-memory-gold/5 border-memory-gold/20";
                          default: return "text-loss-crimson bg-loss-crimson/5 border-loss-crimson/20";
                        }
                      };

                      return (
                        <div key={r.id} className="glass-card p-5 rounded-sm flex flex-col justify-between space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-serif text-lg text-text-primary capitalize">{r.name}</h3>
                              <span className="font-mono text-[9px] text-text-disabled">
                                Last met: {new Date(r.last_interaction).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                            <span className={`font-mono text-[9px] border px-2 py-0.5 rounded-xs ${getStatusColor(r.status)}`}>
                              {r.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/[0.02]">
                            <div className="flex justify-between items-center font-mono text-[10px]">
                              <span className="text-text-secondary">EMOTIONAL IMPACT</span>
                              <span className={r.emotional_impact >= 0 ? "text-growth" : "text-loss-crimson"}>
                                {r.emotional_impact >= 0 ? `+${r.emotional_impact}` : r.emotional_impact} Resonance
                              </span>
                            </div>
                            <div className="w-full h-1 bg-memory-surface rounded-xs overflow-hidden flex">
                              <div 
                                className={`h-full transition-all ${r.emotional_impact >= 0 ? "bg-growth" : "bg-loss-crimson"}`}
                                style={{ width: `${Math.abs(r.emotional_impact) * 20}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Achievements Section */}
                  <div className="flex justify-between items-center border-b border-white/[0.03] pt-6 pb-3">
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      $ achievements --system-status
                    </span>
                    <span className="font-mono text-[10px] text-text-disabled uppercase">
                      Unlocked: {unlockedAchievements.length} / 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "First Commit",
                        description: "Initialized your journey in the system.",
                        xp: 200,
                        icon: <Award className="w-5 h-5 text-growth" />
                      },
                      {
                        title: "Discipline Master",
                        description: "Reached 80% discipline score through focused commits.",
                        xp: 500,
                        icon: <Shield className="w-5 h-5 text-reflection-blue" />
                      },
                      {
                        title: "Luminous Heart",
                        description: "Attained a peak state of happiness (90%+).",
                        xp: 600,
                        icon: <Heart className="w-5 h-5 text-loss-crimson" />
                      },
                      {
                        title: "Emotional Explorer",
                        description: "Logged reflection commits in 5 distinct emotional states.",
                        xp: 400,
                        icon: <Sparkles className="w-5 h-5 text-memory-gold" />
                      }
                    ].map((ach) => {
                      const isUnlocked = unlockedAchievements.includes(ach.title);
                      return (
                        <div 
                          key={ach.title} 
                          className={`glass-card p-5 rounded-sm flex items-start space-x-4 transition-all duration-300 relative overflow-hidden ${
                            isUnlocked 
                              ? "border-growth/20 bg-growth/[0.02]" 
                              : "opacity-40 border-white/[0.03] bg-white/[0.005]"
                          }`}
                        >
                          {/* Premium Glowing aura for unlocked ones */}
                          {isUnlocked && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-growth/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                          )}
                          
                          <div className={`p-3 rounded-full ${
                            isUnlocked ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white/[0.01] border border-transparent"
                          }`}>
                            {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-text-disabled" />}
                          </div>
                          
                          <div className="space-y-1 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-serif text-base text-text-primary">{ach.title}</h4>
                              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-xs border ${
                                isUnlocked 
                                  ? "text-growth border-growth/20 bg-growth/5" 
                                  : "text-text-disabled border-white/[0.03] bg-white/[0.01]"
                              }`}>
                                {isUnlocked ? `+${ach.xp} XP` : "LOCKED"}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed font-sans">{ach.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 04: DISTRACTION-FREE TYPEWRITER WRITING PORTAL      */}
              {/* ======================================================== */}
              {activeTab === "editor" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      $ cat &gt;&gt; emotional_reflection.txt
                    </span>
                    <span className="font-mono text-[9px] text-growth flex items-center bg-growth/5 border border-growth/10 px-2 py-0.5 rounded-xs animate-pulse">
                      <Volume2 size={10} className="mr-1.5" />
                      TACTILE AUDIO: ONLINE
                    </span>
                  </div>

                  {/* Clean Paper Editor Container */}
                  <form onSubmit={handleCommitSubmit} className="editor-paper p-6 md:p-8 rounded-sm shadow-2xl border border-white/5 space-y-6">
                    {/* Title Field */}
                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                        Commit Summary *
                      </label>
                      <input 
                        type="text"
                        required
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                        placeholder="learned to trust myself again..."
                        className="w-full bg-transparent border-b border-white/10 py-2.5 focus:border-growth focus:outline-none font-serif text-xl tracking-wide placeholder-text-disabled text-text-primary transition-colors"
                      />
                    </div>

                    {/* Description Paragraph Editor */}
                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                        Detailed Reflection (Type here for sensory sound feedback)
                      </label>
                      <textarea
                        rows={5}
                        value={editorDesc}
                        onChange={(e) => setEditorDesc(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                        placeholder="What shifted inside you today? What challenges arose, and what was recognized? The typing sound adapts to your speed..."
                        className="w-full bg-transparent border border-white/5 rounded-xs p-4 focus:border-growth focus:outline-none font-sans text-sm font-light leading-relaxed placeholder-text-disabled text-text-secondary bg-deep-archive/40 transition-colors resize-none"
                      />
                    </div>

                    {/* Mood & Tag Selection row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Mood Selector */}
                      <div className="space-y-2 text-left">
                        <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                          Emotional Mood Level: {editorMood} / 5
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const moodColors = ["bg-loss-crimson", "bg-connection-purple", "bg-memory-gold", "bg-reflection-blue", "bg-growth"];
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setEditorMood(level)}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs transition-all ${
                                  editorMood === level
                                    ? `${moodColors[level - 1]} text-deep-archive border-white scale-110 shadow-lg`
                                    : "border-white/10 hover:border-white/30 text-text-secondary bg-memory-surface"
                                }`}
                              >
                                {level}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Emotional Tags Field */}
                      <div className="space-y-1 text-left">
                        <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                          Emotional Tags (comma-separated)
                        </label>
                        <input 
                          type="text"
                          value={editorTags}
                          onChange={(e) => setEditorTags(e.target.value)}
                          onKeyDown={handleEditorKeyDown}
                          placeholder="growth, clarity, relationships"
                          className="w-full bg-transparent border-b border-white/10 py-2 focus:border-growth focus:outline-none font-mono text-xs text-text-secondary placeholder-text-disabled transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="font-mono text-[9px] text-text-disabled">
                        * Required for life index commit
                      </span>
                      <button
                        type="submit"
                        className="glow-btn px-6 py-3 bg-growth text-deep-archive rounded-xs font-mono text-xs tracking-wider uppercase flex items-center space-x-2 hover:bg-growth/90 transition-all cursor-pointer font-bold"
                      >
                        <GitCommit size={14} />
                        <span>git commit -m "archive self"</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

        </main>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 w-full px-6 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center border-t border-white/[0.03] backdrop-blur-md font-mono text-[9px] text-text-disabled gap-4">
        <div>
          <span>© {new Date().getFullYear()} Version of Me. Your life, versioned.</span>
        </div>
        
        <div className="flex space-x-6">
          <span>SECURED LOCK SHUTDOWN: ACTIVE</span>
          <span>POSTGRES RLS VERIFIED</span>
          <span className="text-growth">BUILD: v1.0.0-PROTOTYPE</span>
        </div>
      </footer>

      {/* 3. PREMIUM AUTH MODAL (GLASSMORPHISM) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-archive/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 rounded-sm border border-white/10 relative overflow-hidden shadow-2xl">
            {/* Ambient decorative glowing spots */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-connection-purple/20 rounded-full filter blur-xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-growth/10 rounded-full filter blur-xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                [ AUTH_CORE_GATEWAY ]
              </span>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError("");
                }}
                className="text-text-muted hover:text-text-primary font-mono text-xs"
              >
                [ ESC ]
              </button>
            </div>

            <h2 className="font-serif text-3xl text-text-primary mb-2 text-left">
              {authMode === "login" ? "Sync with Cloud" : "Create Cloud Vault"}
            </h2>
            <p className="text-xs text-text-secondary font-light leading-relaxed mb-6 font-sans text-left">
              {authMode === "login" 
                ? "Enter your secure credentials to retrieve your emotional database state and life logs."
                : "Initialize a secure remote PostgreSQL database for persistent, multi-device tracking."
              }
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                  Identity (Email Address)
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                  Access Key (Password)
                </label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                />
              </div>

              {authError && (
                <div className={`p-3 rounded-xs border text-[11px] leading-relaxed ${
                  authError.includes("Verification email") || authError.includes("Check your email")
                    ? "bg-growth/5 border-growth/20 text-growth" 
                    : "bg-loss-crimson/5 border-loss-crimson/20 text-loss-crimson"
                }`}>
                  {authError}
                </div>
              )}

              <div className="pt-4 flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="glow-btn w-full py-3 bg-text-primary text-deep-archive rounded-xs font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 hover:bg-growth hover:text-deep-archive transition-all disabled:opacity-50"
                >
                  {authLoading ? (
                    <span>Executing Sync...</span>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>{authMode === "login" ? "Decrypt & Initialize" : "Provision Cloud Vault"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setAuthError("");
                  }}
                  className="text-center text-[10px] text-text-muted hover:text-text-primary transition-colors py-1 cursor-pointer"
                >
                  {authMode === "login" 
                    ? "NEED AN ACCOUNT? SECURE A NEW VAULT" 
                    : "ALREADY HAVE A VAULT? DECRYPT EXISTING"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PREMIUM PROFILE CUSTOMIZER MODAL (GLASSMORPHISM) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-archive/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 md:p-8 rounded-sm border border-white/10 relative overflow-hidden shadow-2xl my-8">
            {/* Ambient decorative glowing spots */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-growth/10 rounded-full filter blur-xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-reflection-blue/10 rounded-full filter blur-xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                [ PROFILE_CUSTOMIZER_INTERFACE ]
              </span>
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileError("");
                  setProfileSuccess("");
                }}
                className="text-text-muted hover:text-text-primary font-mono text-xs"
              >
                [ ESC ]
              </button>
            </div>

            <h2 className="font-serif text-3xl text-text-primary mb-1 text-left">
              Customize Identity
            </h2>
            <p className="text-xs text-text-secondary font-light leading-relaxed mb-6 font-sans text-left">
              Synchronize your personal metadata across your secure Postgres vault and profile identity card.
            </p>

            <form onSubmit={handleProfileSave} className="space-y-5 text-left">
              {/* Modal Tab Switcher */}
              <div className="flex border-b border-white/5 mb-5 font-mono text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setProfileModalTab("general")}
                  className={`pb-3 px-4 transition-all border-b-2 font-bold ${
                    profileModalTab === "general"
                      ? "border-growth text-growth"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  [ 01_general_settings ]
                </button>
                <button
                  type="button"
                  onClick={() => setProfileModalTab("readme")}
                  className={`pb-3 px-4 transition-all border-b-2 font-bold ${
                    profileModalTab === "readme"
                      ? "border-growth text-growth"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  [ 02_readme_profile ]
                </button>
              </div>

              {profileModalTab === "general" && (
                <>
                  {/* Avatar Upload Block */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.01] border border-white/[0.03] p-4 rounded-xs">
                    <div className="relative group cursor-pointer shrink-0">
                      <div className="absolute inset-0 bg-growth/20 rounded-xs filter blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-20 h-20 rounded-xs border border-white/10 overflow-hidden bg-deep-archive/60 flex items-center justify-center">
                        {tempAvatarUrl ? (
                          <img src={tempAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif italic text-3xl text-gradient-gold">
                            {tempDisplayName ? tempDisplayName.charAt(0) : "V"}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <Camera size={20} className="text-white animate-pulse" />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer animate-pulse"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                        Identity Portrait (Avatar)
                      </span>
                      <p className="text-xs text-text-secondary font-light leading-relaxed font-sans">
                        Click portrait to choose a new file. Recommended: square image, under 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Identity Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                        Display Name
                      </label>
                      <input 
                        type="text"
                        required
                        value={tempDisplayName}
                        onChange={(e) => setTempDisplayName(e.target.value)}
                        placeholder="Muhamad Sidik"
                        className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                        Username / Handle
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-text-muted">@</span>
                        <input 
                          type="text"
                          required
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          placeholder="myusiz3"
                          className="w-full bg-deep-archive/60 border border-white/10 rounded-xs pl-8 pr-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                        Pronouns
                      </label>
                      <input 
                        type="text"
                        value={tempPronouns}
                        onChange={(e) => setTempPronouns(e.target.value)}
                        placeholder="e.g. he/him, she/her, they/them"
                        className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                        Location
                      </label>
                      <input 
                        type="text"
                        value={tempLocation}
                        onChange={(e) => setTempLocation(e.target.value)}
                        placeholder="e.g. Bandung, Indonesia"
                        className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-1 font-mono text-xs">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest block">
                      Bio / Status Message
                    </label>
                    <textarea
                      rows={2}
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2.5 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors font-sans resize-none text-sm font-light leading-relaxed"
                    />
                  </div>

                  {/* Social Links Block */}
                  <div className="border-t border-white/5 pt-4 space-y-3 font-mono text-xs">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest block">
                      Social Network Integrations
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-text-secondary uppercase block">
                          Website URL
                        </label>
                        <input 
                          type="url"
                          value={tempWebsiteUrl}
                          onChange={(e) => setTempWebsiteUrl(e.target.value)}
                          placeholder="https://yourpage.com"
                          className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-text-secondary uppercase block">
                          LinkedIn Username
                        </label>
                        <input 
                          type="text"
                          value={tempLinkedin}
                          onChange={(e) => setTempLinkedin(e.target.value)}
                          placeholder="linkedin-username"
                          className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-text-secondary uppercase block">
                          Instagram Handle
                        </label>
                        <input 
                          type="text"
                          value={tempInstagram}
                          onChange={(e) => setTempInstagram(e.target.value)}
                          placeholder="instagram_handle"
                          className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-3 py-2 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {profileModalTab === "readme" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] px-4 py-2.5 rounded-xs">
                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={12} className="text-growth animate-pulse" />
                      markdown readme profile
                    </span>
                    <div className="flex items-center space-x-2 font-mono text-[9px]">
                      <button
                        type="button"
                        onClick={() => setReadmePreviewMode(false)}
                        className={`px-2 py-1 rounded-xs transition-all ${
                          !readmePreviewMode
                            ? "bg-growth/15 text-growth border border-growth/20 font-bold"
                            : "text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        [ EDIT ]
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadmePreviewMode(true)}
                        className={`px-2 py-1 rounded-xs transition-all ${
                          readmePreviewMode
                            ? "bg-growth/15 text-growth border border-growth/20 font-bold"
                            : "text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        [ PREVIEW ]
                      </button>
                    </div>
                  </div>

                  {readmePreviewMode ? (
                    <div className="glass-panel p-5 rounded-xs border border-white/5 h-[300px] min-h-[300px] max-h-[300px] overflow-y-auto prose prose-invert text-xs leading-relaxed text-left text-text-secondary font-sans markdown-content custom-scrollbar">
                      {tempReadme ? (
                        <MarkdownRenderer content={tempReadme} />
                      ) : (
                        <span className="italic text-text-disabled">Nothing to preview. Go to the Edit tab to write your bio.</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={10}
                        value={tempReadme}
                        onChange={(e) => setTempReadme(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                        placeholder={`# Hello World! 🚀\n\nWelcome to my profile. This supports standard GitHub markdown.\n\n## 🛠️ My Core Stack\n- TypeScript / Next.js\n- Supabase / PostgreSQL\n\n## 📈 Life Commits\n- Working on VersionOfMe\n- Embracing daily discipline`}
                        className="w-full bg-deep-archive/60 border border-white/10 rounded-xs px-4 py-3 focus:border-growth focus:outline-none text-text-primary placeholder-text-disabled transition-colors font-mono text-xs leading-relaxed resize-none h-[300px] min-h-[300px] max-h-[300px] overflow-y-auto custom-scrollbar"
                      />
                      <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
                        <span>Characters: {tempReadme.length}</span>
                        <span className="text-[9px] text-growth/60">💡 Tip: Use standard markdown headings, bullets, and emojis.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Indicator Alerts */}
              {profileError && (
                <div className="p-3 bg-loss-crimson/5 border border-loss-crimson/20 rounded-xs text-[11px] leading-relaxed text-loss-crimson font-mono">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-growth/5 border border-growth/20 rounded-xs text-[11px] leading-relaxed text-growth font-mono">
                  {profileSuccess}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  className="px-4 py-2.5 text-text-muted hover:text-text-primary transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="glow-btn px-6 py-2.5 bg-text-primary text-deep-archive rounded-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 hover:bg-growth hover:text-deep-archive transition-all disabled:opacity-50"
                >
                  {profileSaving ? (
                    <span>Synchronizing...</span>
                  ) : (
                    <>
                      <Database size={12} />
                      <span>Sync Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
