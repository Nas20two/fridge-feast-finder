// Supabase client - uses env vars from Vercel
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iffaunhpiuspwozdalbs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmF1bmhwaXVzcHdvemRhbGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Njc2MTgsImV4cCI6MjA4ODE0MzYxOH0.z0PyInCXC2ZvipEfWe5zwDekSAheURv6S3mJmBBLtAs';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
