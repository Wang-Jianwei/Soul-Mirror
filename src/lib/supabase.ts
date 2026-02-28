import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yphwrevbscukfovsdzjx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaHdyZXZic2N1a2ZvdnNkemp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzk2NDksImV4cCI6MjA4Nzc1NTY0OX0.NxxqgmD5jt0e8QGdW_Y0yg5At3HJhi8D3C2K9ycmbOc';

export const supabase = createClient(supabaseUrl, supabaseKey);
