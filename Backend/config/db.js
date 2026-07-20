const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

let supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in your environment variables.");
}

// Clean up trailing /rest/v1/ if present in the URL, as the Supabase client appends it automatically
if (supabaseUrl && supabaseUrl.includes('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  realtime: {
    transport: ws
  }
});

module.exports = supabase;


