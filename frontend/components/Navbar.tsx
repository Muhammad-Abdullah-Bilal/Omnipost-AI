'use client';

import React from 'react';
import { Sparkles, Bookmark, Share2 } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  savedCount: number;
}

export default function Navbar({ onOpenHistory, savedCount }: NavbarProps) {
  return (
    <header className="h-14 sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 shrink-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-base font-bold text-white tracking-tight">
              OmniPost
            </h1>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
              Multi-Platform Social Agent
            </span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved Posts</span>
            {savedCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
