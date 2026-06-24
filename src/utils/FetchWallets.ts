import { createClient, type User } from '@supabase/supabase-js'
import { type wallet } from '../types/Wallet';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);


export default async function fetchWallets(
  user: User | null
  //Promise that returns an array of wallets
): Promise<wallet[]> {
  if (!user) return [];

  const { data, error } = await supabase
    .from('tblwallets')
    .select('walletid, name')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
  
  return data ?? [];
}
