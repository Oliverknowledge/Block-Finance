import { createClient, type User } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function updateSkillLevel(user: User | null, skillLevel: string): Promise<boolean> {
  if (!user) return false;

    // Update the user's onboarded status to true
  let { error } = await supabase
    .from('tblusers')
    .update({ onboarded: true})
    .eq('id', user.id);
  if (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
  // Update the user's skill level
  ({ error } = await supabase
    .from('tblusers')
    .update({ userlevel: skillLevel}) 
    .eq('id', user.id)
    );
    if (error) {
        console.error('Error updating skill level:', error);
        return false;
        }
  return true;
}
