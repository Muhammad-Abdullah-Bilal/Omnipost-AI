'use client';

import React, { useState } from 'react';
import { 
  Copy, Check, Edit2, RotateCw, CheckCircle2, Calendar, 
  Star, Image as ImageIcon, Sparkles, Hash
} from 'lucide-react';
import { Post } from '../app/types';

interface PostCardProps {
  post: Post;
  onUpdate: (postId: number, data: Partial<Post>) => Promise<void>;
  onRegenerate: (postId: number, tone?: string, instructions?: string) => Promise<void>;
}

export default function PostCard({ post, onUpdate, onRegenerate }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [userRating, setUserRating] = useState<number>(post.rating || 0);
  const [feedbackText, setFeedbackText] = useState(post.user_feedback || '');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Platform styling
  const platformConfig: Record<string, {
    name: string;
    borderTop: string;
    badgeBg: string;
    optimalRange: string;
    isOptimal: boolean;
  }> = {
    linkedin: {
      name: 'LinkedIn',
      borderTop: 'border-t-2 border-t-blue-500',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      optimalRange: '100 - 200 words',
      isOptimal: post.word_count >= 80 && post.word_count <= 220
    },
    facebook: {
      name: 'Facebook',
      borderTop: 'border-t-2 border-t-sky-500',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      optimalRange: '60 - 90 words',
      isOptimal: post.word_count >= 40 && post.word_count <= 110
    },
    instagram: {
      name: 'Instagram',
      borderTop: 'border-t-2 border-t-pink-500',
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      optimalRange: 'Hook + Visual + Tags',
      isOptimal: post.word_count <= 160
    }
  };

  const config = platformConfig[post.platform.toLowerCase()] || platformConfig.linkedin;

  const handleCopy = () => {
    const textToCopy = `${post.content}\n\n${post.hashtags || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await onUpdate(post.id, { content: editedContent });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await onUpdate(post.id, { status: newStatus });
  };

  const handleRate = async (rating: number) => {
    setUserRating(rating);
    await onUpdate(post.id, { rating });
  };

  const handleSaveFeedback = async () => {
    await onUpdate(post.id, { user_feedback: feedbackText, rating: userRating });
    setShowFeedbackModal(false);
  };

  const handleTriggerRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(post.id);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className={`bg-slate-900/70 border border-slate-800/80 ${config.borderTop} rounded-xl overflow-hidden shadow-lg transition-all flex flex-col`}>
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="font-semibold text-white text-xs tracking-wide">
            {config.name}
          </span>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
            {post.status}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Tone: {post.tone}
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition"
            title="Edit copy"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTriggerRegenerate}
            disabled={isRegenerating}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition"
            title="Regenerate draft"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3">
        {/* Scroll-stopping Hook */}
        {post.hook && (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-slate-200 leading-snug">
              <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider mr-1.5">Hook:</span>
              "{post.hook}"
            </p>
          </div>
        )}

        {/* Content */}
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 rounded text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-line text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
              {post.content}
            </div>
          )}
        </div>

        {/* Hashtags */}
        {post.hashtags && (
          <div className="flex flex-wrap gap-1 items-center">
            <Hash className="w-3 h-3 text-slate-500" />
            {post.hashtags.split(' ').filter(Boolean).map((tag, idx) => (
              <span key={idx} className="text-[11px] font-medium text-indigo-400 bg-indigo-950/30 border border-indigo-800/30 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Companion Visual Idea */}
        {post.media_suggestion && (
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-2.5 flex items-start space-x-2">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-indigo-300 mr-1">Visual Concept:</span>
              {post.media_suggestion}
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center justify-between text-xs">
        {/* Word count metric */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>{post.word_count} words</span>
          <span>•</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            config.isOptimal ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
          }`}>
            Target: {config.optimalRange}
          </span>
        </div>

        {/* Approve & Schedule */}
        <div className="flex items-center space-x-1.5">
          {/* Star rating */}
          <div className="flex items-center mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="text-slate-600 hover:text-amber-400 p-0.5"
                title={`Rate ${star} Stars`}
              >
                <Star
                  className={`w-3 h-3 ${
                    star <= userRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => handleStatusChange('approved')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              post.status === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {post.status === 'approved' ? 'Approved' : 'Approve'}
          </button>

          <button
            onClick={() => handleStatusChange('scheduled')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              post.status === 'scheduled'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {post.status === 'scheduled' ? 'Scheduled' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
