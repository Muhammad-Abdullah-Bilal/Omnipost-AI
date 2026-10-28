'use client';

import React, { useState } from 'react';
import { X, Trash2, ExternalLink, Calendar, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Post } from '../app/types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onDeletePost: (postId: number) => Promise<void>;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  posts,
  onSelectPost,
  onDeletePost
}: HistoryDrawerProps) {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredPosts = posts.filter((p) => {
    const matchesPlatform = platformFilter === 'all' || p.platform.toLowerCase() === platformFilter;
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter;
    return matchesPlatform && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Saved Posts & History</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400">
                {posts.length} total
              </span>
            </h2>
            <p className="text-xs text-slate-400">Persisted in PostgreSQL (Neon Serverless)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap gap-2 text-xs">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Drafts</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              No saved posts found matching the current filters.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize font-semibold text-xs text-indigo-400">
                      {post.platform}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      post.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : post.status === 'scheduled'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="font-medium text-sm text-slate-200 line-clamp-1">
                  Topic: {post.topic}
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{post.word_count} words</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectPost(post);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-md bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-xs font-medium"
                    >
                      Load in Editor
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
