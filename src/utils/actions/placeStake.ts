import { createClient, type User } from '@supabase/supabase-js';
import generateId from '../GenerateId';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function placeStake(
  user: User | null,
  walletid: string,
  ticker: string,
  amountUSD: number,
  apy: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!user) {
    return { ok: false, error: 'You must be logged in to stake.' };
  }

  if (amountUSD <= 0) {
    return { ok: false, error: 'Enter a valid stake amount.' };
  }

  const normalizedWalletId = Number(walletid);

  // Get current USDT balance for this wallet.
  const usdBalanceRow = await supabase
    .from('tblwalletassets')
    .select('availableqty, StakedQty')
    .eq('walletid', normalizedWalletId)
    .eq('ticker', 'USDT')
    .single();

  if (usdBalanceRow.error || !usdBalanceRow.data) {
    return { ok: false, error: 'Unable to fetch wallet USDT balance.' };
  }
  //Convert to number
  const availableUSDT = Number(usdBalanceRow.data.availableqty ?? 0);
  const stakedUSDT = Number(usdBalanceRow.data.StakedQty ?? 0);

  if (availableUSDT < amountUSD) {
    return { ok: false, error: 'Insufficient USDT balance in this wallet.' };
  }

  const { error: updateWalletError } = await supabase
    .from('tblwalletassets')
    .update({
      availableqty: availableUSDT - amountUSD,
      StakedQty: stakedUSDT + amountUSD,
      updatedat: new Date(),
    })
    .eq('walletid', normalizedWalletId)
    .eq('ticker', 'USDT');

  if (updateWalletError) {
    return { ok: false, error: 'Failed to update wallet balance.' };
  }

  // Save a simple stake record.
  const stakeId = generateId();
  const { error: insertStakeError } = await supabase
    .from('tblstakes')
    .insert([
      {
        stakeid: stakeId,
        walletid: normalizedWalletId,
        ticker,
        quantity: amountUSD,
        apy,
        status: 'active',
        rewardsaccrued: 0,
        penalityapplied: 0,
        createdat: new Date().toISOString(),
      },
    ]);

  if (insertStakeError) {
    return { ok: false, error: 'Failed to save stake record.' };
  }

  return { ok: true };
}
