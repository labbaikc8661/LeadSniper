import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Supabase client (always from .env — needed to bootstrap)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gets a config value. Priority: .env → Supabase ms_settings table.
 * This means you (the dev) can use .env for convenience,
 * and anyone else cloning the repo uses the Settings UI.
 */
export async function getConfig(key) {
  // Map of .env variable names to settings keys
  const envMap = {
    google_places_api_key_1: 'GOOGLE_PLACES_API_KEY_1',
    google_places_api_key_2: 'GOOGLE_PLACES_API_KEY_2',
    gemini_api_key: 'GEMINI_API_KEY',
    gemini_model: 'GEMINI_MODEL',
    scraper_delay_min: 'SCRAPER_DELAY_MIN',
    scraper_delay_max: 'SCRAPER_DELAY_MAX',
    scraper_max_results: 'SCRAPER_MAX_RESULTS',
    user_name: 'USER_NAME',
    user_title: 'USER_TITLE',
    user_email: 'USER_EMAIL',
    user_website: 'USER_WEBSITE',
  };

  // Check .env first
  const envKey = envMap[key];
  if (envKey && process.env[envKey]) {
    return process.env[envKey];
  }

  // Fall back to Supabase settings
  const { data } = await supabase
    .from('ms_settings')
    .select('value')
    .eq('key', key)
    .single();

  return data?.value || null;
}

/**
 * Get all needed config at once for performance
 */
export async function getAllConfig() {
  const keys = [
    'google_places_api_key_1',
    'google_places_api_key_2',
    'gemini_api_key',
    'gemini_model',
    'scraper_delay_min',
    'scraper_delay_max',
    'scraper_max_results',
    'user_name',
    'user_title',
    'user_email',
    'user_website',
  ];

  const config = {};
  for (const key of keys) {
    config[key] = await getConfig(key);
  }

  // Defaults
  config.gemini_model = config.gemini_model || 'gemini-2.5-flash';
  config.scraper_delay_min = parseInt(config.scraper_delay_min) || 2000;
  config.scraper_delay_max = parseInt(config.scraper_delay_max) || 5000;
  config.scraper_max_results = parseInt(config.scraper_max_results) || 100;

  return config;
}
