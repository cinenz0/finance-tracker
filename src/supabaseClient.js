import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zoiwivoqgehzrrlvefco.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaXdpdm9xZ2VoenJybHZlZmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NjI0NjAsImV4cCI6MjA4MDUzODQ2MH0.reyQjCzjrLCRexqEp7GmVlEIBTWDuYciXR_WejgnY4o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
