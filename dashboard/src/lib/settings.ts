import { supabase } from './supabase';

export interface SettingConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  category: 'google' | 'ai' | 'scraper';
  sensitive: boolean;
}

export const SETTING_DEFINITIONS: SettingConfig[] = [
  {
    key: 'google_places_api_key_1',
    label: 'Google Places API Key 1',
    description: 'Primary API key for Google Places. Used for lead search. Rotates to Key 2 when quota is hit.',
    placeholder: 'AIzaSy...',
    category: 'google',
    sensitive: true,
  },
  {
    key: 'google_places_api_key_2',
    label: 'Google Places API Key 2',
    description: 'Backup API key. The scraper switches to this when Key 1 hits its daily quota.',
    placeholder: 'AIzaSy...',
    category: 'google',
    sensitive: true,
  },
  {
    key: 'gemini_api_key',
    label: 'Gemini API Key',
    description: 'Used for AI-generated cold email drafts and pitch angle suggestions.',
    placeholder: 'AIzaSy...',
    category: 'ai',
    sensitive: true,
  },
  {
    key: 'gemini_model',
    label: 'Gemini Model',
    description: 'Which Gemini model to use. Recommended: gemini-2.5-flash for best quota/quality balance.',
    placeholder: 'gemini-2.5-flash',
    category: 'ai',
    sensitive: false,
  },
  {
    key: 'scraper_delay_min',
    label: 'Min Delay (ms)',
    description: 'Minimum delay between page visits to avoid rate limiting.',
    placeholder: '2000',
    category: 'scraper',
    sensitive: false,
  },
  {
    key: 'scraper_delay_max',
    label: 'Max Delay (ms)',
    description: 'Maximum delay between page visits. Actual delay is randomized between min and max.',
    placeholder: '5000',
    category: 'scraper',
    sensitive: false,
  },
  {
    key: 'scraper_max_results',
    label: 'Max Results per Search',
    description: 'Maximum number of leads to collect per search query.',
    placeholder: '100',
    category: 'scraper',
    sensitive: false,
  },
  {
    key: 'user_name',
    label: 'Your Name',
    description: 'Used in AI-generated email drafts as the sender name.',
    placeholder: 'Hatim',
    category: 'ai',
    sensitive: false,
  },
  {
    key: 'user_title',
    label: 'Your Title / Service',
    description: 'What you offer. Used in AI email drafts. E.g. "Web Developer", "App Development Agency".',
    placeholder: 'Full-Stack Developer',
    category: 'ai',
    sensitive: false,
  },
  {
    key: 'user_email',
    label: 'Your Email',
    description: 'Your contact email, included in AI email drafts.',
    placeholder: 'you@example.com',
    category: 'ai',
    sensitive: false,
  },
  {
    key: 'user_website',
    label: 'Your Portfolio URL',
    description: 'Your website/portfolio link, included in AI email drafts.',
    placeholder: 'https://yoursite.com',
    category: 'ai',
    sensitive: false,
  },
];

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('ms_settings')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('ms_settings')
    .select('key, value')
    .in('key', keys);

  const result: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    result[row.key] = row.value;
  });
  return result;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('ms_settings')
    .select('key, value');

  const result: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    result[row.key] = row.value;
  });
  return result;
}

export async function setSetting(key: string, value: string, description?: string): Promise<boolean> {
  const { error } = await supabase
    .from('ms_settings')
    .upsert(
      { key, value, description: description || SETTING_DEFINITIONS.find((s) => s.key === key)?.description || '' },
      { onConflict: 'key' }
    );
  return !error;
}

export async function deleteSetting(key: string): Promise<boolean> {
  const { error } = await supabase.from('ms_settings').delete().eq('key', key);
  return !error;
}
