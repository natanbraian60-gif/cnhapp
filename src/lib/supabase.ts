import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqylzmyvpmrsyjlnhimx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_eqmutpc_QVTgg2_9hxfo8Q_eGxrm-sR';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing. Check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    global: {
      fetch: (url: any, options: any) => fetch(url, options),
    },
  }
);
