'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Globe, Sliders, CheckSquare, Square, 
  Send, RefreshCw, Layers, Check, Hash, Image as ImageIcon,
  Smile, Compass, Bot, Lightbulb, Loader2, CheckCircle2, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import HistoryDrawer from '../components/HistoryDrawer';
import { Post, GenerationRequest, GenerationResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const QUICK_TOPICS = [
  'How AI Agents automate workflows in 2026',
  'Scaling a SaaS startup to $1M ARR',
  'Why work-life balance starts with async work',
  'Announcing our latest product update'
];

const TONES = [
  'Professional & Insightful',
  'Authentic & Conversational',
  'Authoritative & Thought Leader',
  'Witty & Relatable',
  'Inspirational & Visionary'
];

const AGENT_STEPS = [
  {
    title: 'Scanning Real-Time Web Context',
    description: 'Gathering current facts, market sentiment, and verified trends...',
    icon: Globe,
    color: 'text-sky-400',
    progress: 20
  },
  {
    title: 'Architecting Platform-Specific Angles',
    description: 'Calibrating voice for LinkedIn thought leadership, Facebook discussion, and Instagram hooks...',
    icon: Bot,
    color: 'text-indigo-400',
    progress: 45
  },
  {
    title: 'Drafting Scroll-Stopping Hooks & Copy',
    description: 'Generating value-rich copy with optimal whitespace and paragraph rhythms...',
    icon: Sparkles,
    color: 'text-amber-400',
    progress: 70
  },
  {
    title: 'Synthesizing Companion Visual Concepts',
    description: 'Designing carousel slide briefs, infographics, and aesthetic media prompts...',
    icon: ImageIcon,
    color: 'text-purple-400',
    progress: 88
  },
  {
    title: 'Applying Algorithmic Compliance',
    description: 'Sanitizing hashtags, verifying spam rules, and finalizing clean formatting...',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    progress: 96
  }
];

const ALGORITHM_TIPS = [
  'LinkedIn algorithm rewards posts with 2-3 focused hashtags and career-relevant insights.',
  'Instagram carousels retain viewers 3x longer when the first slide acts as a high-contrast hook.',
  'Facebook prioritizes natural two-way community debates over one-way announcements.',
  'Generous line breaks increase mobile readability on LinkedIn by over 40%.'
];

export default function Home() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [currentPosts, setCurrentPosts] = useState<Post[]>([]);
  const [researchSummary, setResearchSummary] = useState<string>('');
  
  // Form State
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [creativity, setCreativity] = useState(0.7);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'facebook', 'instagram']);
  const [enableWebResearch, setEnableWebResearch] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load saved posts on mount
  useEffect(() => {
    fetchSavedPosts();
  }, []);

  // Cycle loader steps & pro-tips while loading
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 1600);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % ALGORITHM_TIPS.length);
    }, 3200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSavedPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/posts?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setSavedPosts(data);
      }
    } catch (e) {
      console.warn('Backend not yet reachable on port 8000', e);
    }
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      } else {
        showNotification('Select at least one target platform', 'error');
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showNotification('Please enter a topic or thought', 'error');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setResearchSummary('');

    try {
      const payload: GenerationRequest = {
        topic,
        tone,
        creativity,
        uniqueness_level: 'High',
        platforms: selectedPlatforms,
        enable_web_research: enableWebResearch,
        include_hashtags: includeHashtags,
        include_emojis: includeEmojis,
        include_media_suggestions: includeMedia,
        custom_instructions: customInstructions
      };

      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Generation failed: ${res.statusText}`);
      }

      const result: GenerationResult = await res.json();
      setCurrentPosts(result.posts);
      setResearchSummary(result.research_summary || '');
      showNotification('Posts crafted successfully!');
      fetchSavedPosts();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Generation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (postId: number, updates: Partial<Post>) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentPosts(prev => prev.map(p => p.id === postId ? updated : p));
        setSavedPosts(prev => prev.map(p => p.id === postId ? updated : p));
        showNotification('Post updated!');
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to update post', 'error');
    }
  };

  const handleRegeneratePost = async (postId: number, overrideTone?: string, instructions?: string) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: overrideTone, instructions })
      });
      if (res.ok) {
        const regenerated = await res.json();
        setCurrentPosts(prev => prev.map(p => p.id === postId ? regenerated : p));
        setSavedPosts(prev => prev.map(p => p.id === postId ? regenerated : p));
        showNotification('Regenerated!');
      }
    } catch (err) {
      console.error(err);
      showNotification('Regeneration failed', 'error');
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCurrentPosts(prev => prev.filter(p => p.id !== postId));
        setSavedPosts(prev => prev.filter(p => p.id !== postId));
        showNotification('Post deleted');
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to delete post', 'error');
    }
  };

  const filteredPosts = activePlatformTab === 'all'
    ? currentPosts
    : currentPosts.filter(p => p.platform.toLowerCase() === activePlatformTab);

  const CurrentStepIcon = AGENT_STEPS[loadingStep].icon;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedPosts.length}
      />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 ${
          notification.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 lg:overflow-hidden p-3 sm:p-4 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Form with PINNED BOTTOM BUTTON */}
        <div className="lg:col-span-5 lg:h-full flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md overflow-hidden">
          
          <form onSubmit={handleGenerate} className="h-full flex flex-col justify-between">
            
            {/* Scrollable upper section for parameters */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Post Strategy & Parameters
                  </h2>
                </div>
                {topic && (
                  <button
                    type="button"
                    onClick={() => setTopic('')}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Topic Input + Chips */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Topic or Core Idea
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  placeholder="e.g. Announcing our new AI code analysis feature that cuts bug triage by 50%..."
                  className="w-full h-16 bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                  required
                />
                {/* Quick suggestion chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  {QUICK_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-[10px] whitespace-nowrap bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded-md transition shrink-0"
                    >
                      + {t.slice(0, 24)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platforms: 3 compact buttons in one row */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Platforms
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'linkedin', label: 'LinkedIn' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'instagram', label: 'Instagram' }
                  ].map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{p.label}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <span className="w-3.5 h-3.5 block" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone & Creativity Grid (Side by Side) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tone */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Tone of Voice
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full h-8.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Creativity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-slate-400">Creativity</span>
                    <span className="font-mono text-indigo-400 font-bold">{creativity.toFixed(1)}</span>
                  </div>
                  <div className="h-8.5 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5">
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={creativity}
                      onChange={(e) => setCreativity(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Modules (Compact 2x2 Grid) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Enhancement Features
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={enableWebResearch}
                      onChange={(e) => setEnableWebResearch(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">Web Search</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeMedia}
                      onChange={(e) => setIncludeMedia(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">Visual Prompts</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">Hashtags</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeEmojis}
                      onChange={(e) => setIncludeEmojis(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <Smile className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">Emojis</span>
                  </label>
                </div>
              </div>

              {/* Custom Directives */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Custom Directives (Optional)
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on developer velocity, keep bulleted..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* PINNED BOTTOM GENERATE BUTTON (Always 100% visible) */}
            <div className="pt-2.5 border-t border-slate-800/80 shrink-0 mt-2 bg-slate-900/40">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition text-sm ${
                  isLoading
                    ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 animate-pulse cursor-wait'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-indigo-600/30 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>AI Agent Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Tailored Posts</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Output & Platform Native Views (7 cols) */}
        <div className="lg:col-span-7 lg:h-full flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md overflow-hidden relative">
          
          {/* Top Bar: Tabs & Live Research Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
            {/* Platform Filter Tabs */}
            <div className="flex items-center space-x-1">
              {['all', 'linkedin', 'facebook', 'instagram'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePlatformTab(tab)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    activePlatformTab === tab
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50'
                  }`}
                >
                  {tab === 'all' ? 'All Platforms' : tab}
                </button>
              ))}
            </div>

            {/* Dynamic Status / Research Pill */}
            {isLoading ? (
              <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-700/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Step {loadingStep + 1} of {AGENT_STEPS.length}</span>
              </span>
            ) : researchSummary ? (
              <span className="text-[11px] font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 max-w-[240px] truncate" title={researchSummary}>
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">Web Research Active</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                {currentPosts.length > 0 ? `${filteredPosts.length} drafts ready` : 'Ready to generate'}
              </span>
            )}
          </div>

          {/* Output Display Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pt-3 pr-1">
            
            {/* ENGAGING LIVE LOADER & AGENT PIPELINE ANIMATION */}
            {isLoading ? (
              <div className="h-full flex flex-col justify-between py-2 space-y-3 animate-in fade-in duration-300">
                
                {/* Active Agent Pipeline Progress Card */}
                <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl space-y-3 relative overflow-hidden">
                  {/* Subtle Top Glowing Progress Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                      style={{ width: `${AGENT_STEPS[loadingStep].progress}%` }}
                    />
                  </div>

                  {/* Header of Active Step */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-bounce">
                        <CurrentStepIcon className={`w-4 h-4 ${AGENT_STEPS[loadingStep].color}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-white tracking-wide">
                            {AGENT_STEPS[loadingStep].title}
                          </h3>
                          <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded">
                            {AGENT_STEPS[loadingStep].progress}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {AGENT_STEPS[loadingStep].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Stepper Indicators */}
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {AGENT_STEPS.map((s, idx) => (
                      <div 
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx <= loadingStep 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/50' 
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Shimmer Skeleton Cards Preview */}
                <div className="space-y-2.5 opacity-75">
                  {selectedPlatforms.slice(0, 2).map((plat, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                          <div className="w-16 h-2.5 bg-slate-800 rounded" />
                        </div>
                        <div className="w-12 h-2.5 bg-slate-800 rounded" />
                      </div>
                      <div className="w-full h-7 bg-slate-950/60 rounded border border-slate-800/50" />
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-800/60 rounded" />
                        <div className="w-4/5 h-2.5 bg-slate-800/60 rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Algorithm Pro Tip Ticker */}
                <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-2.5 flex items-center space-x-2.5 text-xs text-slate-300">
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 truncate text-[11px]">
                    <span className="font-semibold text-amber-300 mr-1.5">Algorithm Insight:</span>
                    <span className="italic text-slate-300">{ALGORITHM_TIPS[currentTipIndex]}</span>
                  </div>
                </div>
              </div>
            ) : currentPosts.length === 0 ? (
              /* EMPTY STATE */
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">No Drafts Generated Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Set your topic and parameters on the left, then click <strong>Generate Tailored Posts</strong> to produce platform-native drafts.
                  </p>
                </div>
              </div>
            ) : (
              /* POST CARDS VIEW */
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handleUpdatePost}
                  onRegenerate={handleRegeneratePost}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        posts={savedPosts}
        onSelectPost={(post) => {
          setCurrentPosts([post]);
          setActivePlatformTab(post.platform.toLowerCase());
        }}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
