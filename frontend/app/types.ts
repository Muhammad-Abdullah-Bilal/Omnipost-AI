export interface Post {
  id: number;
  session_id?: number;
  platform: 'linkedin' | 'facebook' | 'instagram' | string;
  topic: string;
  tone: string;
  content: string;
  hook?: string;
  hashtags?: string;
  media_suggestion?: string;
  character_count: number;
  word_count: number;
  status: 'draft' | 'approved' | 'scheduled' | 'rejected' | string;
  rating?: number | null;
  user_feedback?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface GenerationRequest {
  topic: string;
  tone: string;
  creativity: number;
  uniqueness_level: string;
  platforms: string[];
  enable_web_research: boolean;
  include_hashtags: boolean;
  include_emojis: boolean;
  include_media_suggestions: boolean;
  model?: string;
  custom_instructions?: string;
}

export interface GenerationResult {
  session_id: number;
  research_summary?: string;
  posts: Post[];
}
