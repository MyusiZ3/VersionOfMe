"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Database
} from "lucide-react";

// Web Audio API Typewriter Synthesizer class
class KeyboardSynth {
  ctx: AudioContext | null = null;

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
  const synthRef = useRef<KeyboardSynth | null>(null);

  // Live App States
  const [commits, setCommits] = useState(initialCommits);
  const [memories, setMemories] = useState(initialMemories);
  const [relationships, setRelationships] = useState(initialRelationships);
  
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
  }, []);

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
  const handleCommitSubmit = (e: React.FormEvent) => {
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

    // Formulate commit object
    const randomHash = Math.random().toString(16).substring(2, 9);
    const tagsArray = editorTags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const xpEarned = 150 + Math.floor(Math.random() * 80);
    
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

    // Update States
    setCommits([newCommit, ...commits]);

    // Add Memory node automatically
    const newMemory = {
      id: `m_${Date.now()}`,
      title: editorTitle,
      description: editorDesc || "Log commit description.",
      category: editorMood >= 4 ? "Milestone" : "Routine",
      event_date: new Date().toISOString().split("T")[0],
      mood: editorMood === 5 ? "Ecstatic" : editorMood === 4 ? "Peaceful" : editorMood === 3 ? "Reflective" : editorMood === 2 ? "Melancholic" : "Heavy"
    };
    setMemories([newMemory, ...memories]);

    // Recalculate stats
    setStats(prev => {
      const newXp = prev.xp + xpEarned;
      const leveledUp = newXp >= prev.xpNext;
      return {
        ...prev,
        level: leveledUp ? prev.level + 1 : prev.level,
        xp: leveledUp ? newXp - prev.xpNext : newXp,
        confidence: Math.min(100, prev.confidence + (editorMood >= 4 ? 4 : -1)),
        discipline: Math.min(100, prev.discipline + 5),
        happiness: Math.min(100, Math.max(0, prev.happiness + (editorMood - 3) * 6)),
        creativity: Math.min(100, prev.creativity + 3),
        emotional_stability: Math.min(100, prev.emotional_stability + 2)
      };
    });

    // Reset Fields
    setEditorTitle("");
    setEditorDesc("");
    setEditorTags("");
    setEditorMood(3);

    // Return to log tab
    setActiveTab("log");
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

          {viewMode === "dashboard" && (
            <button 
              onClick={() => setViewMode("landing")} 
              className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors border border-white/5 px-3 py-1.5 rounded-xs bg-memory-surface/20"
            >
              [ LOGOUT ]
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

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <button 
              onClick={enterWorkspace}
              className="glow-btn px-8 py-4 bg-text-primary text-deep-archive rounded-xs font-mono text-xs tracking-wider uppercase flex items-center space-x-3 hover:bg-growth hover:text-deep-archive transition-all shadow-lg hover:shadow-growth/15"
            >
              <span>Initialize Workspace</span>
              <ArrowRight size={14} />
            </button>

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
            
            {/* The Character / Aura Panel */}
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
                          <div className="glass-card p-5 rounded-sm shadow-md flex flex-col space-y-3">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                              <div className="space-y-1">
                                <span className="font-mono text-[10px] text-text-disabled mr-2">
                                  commit <span className="text-growth/80">{c.hash}</span>
                                </span>
                                <h3 className="font-serif text-lg text-text-primary capitalize leading-tight">
                                  {c.title}
                                </h3>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className={`font-mono text-[9px] border px-2 py-0.5 rounded-xs ${moodMap.bg} ${moodMap.border} ${moodMap.text}`}>
                                  {moodMap.label}
                                </span>
                                <span className="font-mono text-[9px] text-text-disabled">
                                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                            </div>

                            <p className="text-text-secondary text-xs font-light leading-relaxed">
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
                              <span className="font-mono text-[10px] text-growth flex items-center">
                                <Zap size={10} className="mr-1" />
                                +{c.xp} XP
                              </span>
                            </div>
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
                    <span className="font-mono text-[10px] text-text-disabled uppercase">
                      Active connections: {relationships.filter(r => r.status === "Active").length}
                    </span>
                  </div>

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

    </div>
  );
}
