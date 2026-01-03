import { createClient, type User } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function IncrementXP(user: User | null, quantity: number): Promise<null> {
  if (!user) return null;

  const {error: xpError} = await supabase.rpc('incrementXP', {
    user_id: user.id,
    quantity: quantity
  });
  if (xpError) {
    console.error('Error checking onboarding status:', xpError);
  }
  return null;
}
