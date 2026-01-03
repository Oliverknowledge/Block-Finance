import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function fetchWalletHolding(
  walletid: string,
  ticker: string
): Promise<{ availableqty: number; avgcost: number } | null> {
  const { data, error } = await supabase
    .from('tblwalletassets')
    .select('availableqty, avgcost')
    .eq('walletid', walletid)
    .eq('ticker', ticker)
    .single();

  if (error) return null;
  return data;
}
