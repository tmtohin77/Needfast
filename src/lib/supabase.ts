import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egdyiabefxrmikpobllk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZHlpYWJlZnhybWlrcG9ibGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODMxNzgsImV4cCI6MjA4MDk1OTE3OH0.gzPzyNu-PR2eH7zdviUus93B7pM_eYW565qRg35ojUU';

// সাধারণ কনফিগারেশন (কোনো ফোর্স হেডার দরকার নেই, অথেন্টিকেশন দিয়েই সব হবে)
export const supabase = createClient(supabaseUrl, supabaseKey);