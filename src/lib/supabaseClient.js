
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxedjfcxvphqaosnofji.supabase.co';
const supabaseKey = 'sb_publishable_Y5iBGKl16PQIl8uGZp7Q0A_znemWajb'; // Using user provided key

export const supabase = createClient(supabaseUrl, supabaseKey);
