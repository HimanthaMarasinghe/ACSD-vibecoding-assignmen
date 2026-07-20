import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Mock fallback logic
export const isMockMode = !supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url';

let supabase = null;

if (!isMockMode) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized.');
} else {
  console.log('Running in MOCK mode. Supabase credentials not found or using defaults.');
}

export { supabase };
