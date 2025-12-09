import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tool = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  website: string;
  developer: string;
  pricing_tag: string;
  platforms: string[];
  tags: string[];
  screenshots: string[];
  logo: string | null;
  rating: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  logo_display: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
};

export type Toolkit = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  created_by: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags: string[];
  author_id: string | null;
  published: boolean;
  image_url: string | null;   // <-- NEW
  audio_url: string | null;   // <-- NEW
  created_at: string;
  updated_at: string;
};
export type Submission = {
  id: string;
  payload: any;
  status: string;
  submitted_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};
