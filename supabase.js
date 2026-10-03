const SUPABASE_URL = "https://eyechrzinuslpnkesakb.supabase.co";

// Paste your Supabase Publishable Key between the quotes
const SUPABASE_KEY = "sb_publishable_Df-Fa8zcmrC8rTYb3EH-Fg_-dpQqIXw";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);