import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://jllqowbqwenlosjwktff.supabase.co';
const supabaseKey = 'sb_publishable_UcMZ-HKA0HH6DZ7z6c2hjw_D0oRd-JJ';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
