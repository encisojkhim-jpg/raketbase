import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://isfmmluunlrcqggflbdi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PlnaHKdsVUkOLGCcbFDT5A_iYYmhX9D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
