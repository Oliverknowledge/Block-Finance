import { createClient, type User } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function fetchXp(user: User | null): Promise<number> {
  if (!user) return 0;

  const { data, error } = await supabase
    .from('tblusers')
    .select('xp')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error checking onboarding status:', error);
    return 0;
  }
  
  return data.xp;
}
