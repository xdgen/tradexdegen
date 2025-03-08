import { createClient } from '@supabase/supabase-js'

const supabaseUrl ="https://pthvfhekcrxzvowbczba.supabase.co"
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHZmaGVrY3J4enZvd2JjemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjIxOTgsImV4cCI6MjA1Njk5ODE5OH0.vI6l9wq3pypvAbf_Y2lgj1NVO7-7T9FU-T-fSkHnjnY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)