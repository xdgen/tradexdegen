import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnkcorzbfzmktnobrzvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua2NvcnpiZnpta3Rub2JyenZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MDE1MjMsImV4cCI6MjA0NTk3NzUyM30.whPvjCzKYv0j9_h5KyC8J3lAtTp8mk4ZovmauhZEt74';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
