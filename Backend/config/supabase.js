import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

let supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

// Clean up trailing /rest/v1/ if present in the URL
if (supabaseUrl && supabaseUrl.includes('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
}

let supabase = null;

  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      },
      realtime: {
        transport: ws
      }
    });
    console.log('Supabase client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }

export { supabase };
