import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserExperienceLevel = 'beginner' | 'advanced';

const mapUserLevel = (value: string | null | undefined): UserExperienceLevel => {
  const normalized = (value ?? '').toLowerCase();

  if (normalized === 'beginner') {
    return 'beginner';
  }

  if (normalized === 'intermediate' || normalized === 'advanced') {
    return 'advanced';
  }

  return 'beginner';
};

export default async function fetchUserLevel(user: User | null): Promise<UserExperienceLevel> {
  if (!user) {
    return 'beginner';
  }

  const { data, error } = await supabase
    .from('tblusers')
    .select('userlevel')
    .eq('id', user.id)
    .single();

  if (error) {
    return 'beginner';
  }

  return mapUserLevel(data?.userlevel);
}
