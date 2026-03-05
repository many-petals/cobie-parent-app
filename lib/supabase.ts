import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://pjiycormccyjofxgkhzy.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjUzNTg5NDMxLTFiNzgtNGEyMC05N2FjLWU5NDIxZTExMzMwNiJ9.eyJwcm9qZWN0SWQiOiJwaml5Y29ybWNjeWpvZnhna2h6eSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1OTc2MDMwLCJleHAiOjIwODEzMzYwMzAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.P8uluFVpaEnutAZ7_TLyEoRVajvARU5vsPAoNsZTWdY';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };