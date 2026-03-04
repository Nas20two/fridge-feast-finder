// Supabase client - NaSy Hub
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://xspsvvsxxnciqwqiellm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcHN2dnN4eG5jaXF3cWllbGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzI4NDgsImV4cCI6MjA4Njk0ODg0OH0.k3Ne7ZBMv_BwRMn_eyUbEwPONYe_fkJ2tSPqFHlSmr8';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
