import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("ERRO: Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY ausentes.");
    process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;