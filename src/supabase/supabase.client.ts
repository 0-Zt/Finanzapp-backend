// src/supabase/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://db.ewaqcyyfmpxbqfccandj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NYNovQ4RnAh5f1AZQJitRQ__5TxLkBX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
