import { createClient } from '@supabase/supabase-js';

export type WalletStake = {
  stakeid: number;
  walletid: number;
  ticker: string;
  quantity: number;
  apy: number;
  status: 'active' | 'completed' | 'early_unstaked';
  rewardsaccrued: number;
  penalityapplied: number;
  createdat: string;
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function fetchWalletStakes(
  walletIds: Array<string | number>,
  status: WalletStake['status'],
): Promise<WalletStake[]> {
  if (walletIds.length === 0) {
    return [];
  }

  if (status){
  //Supabase fetch, order stakes in date of creation, where status is equal to the status from the frontend.
  const { data, error } = await supabase
    .from('tblstakes')
    .select('stakeid,walletid,ticker,quantity,apy,status,rewardsaccrued,penalityapplied,createdat')
    .in('walletid', walletIds)
    .eq('status', status)
    .order('createdat', { ascending: false });

  if (error) {
    console.error('Error fetching wallet stakes:', error);
    return [];
  }
  
  const stakes: WalletStake[] = [];
  for (const stake of data ) {
    //push the stakes to the stakes array and if a field doesn't exist push 0 or '' instead.
    stakes.push({
      stakeid: Number(stake.stakeid ?? 0),
      walletid: Number(stake.walletid ?? 0),
      ticker: String(stake.ticker ?? ''),
      quantity: Number(stake.quantity ?? 0),
      apy: Number(stake.apy ?? 0),
      status: (stake.status ?? 'active'),
      rewardsaccrued: Number(stake.rewardsaccrued ?? 0),
      penalityapplied: Number(stake.penalityapplied ?? 0),
      createdat: String(stake.createdat ?? ''),
    });
  }

  return stakes;
  }
  else {
    return []
  }
  }
