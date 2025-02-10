// src/supabase/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu_clave_anonima';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
