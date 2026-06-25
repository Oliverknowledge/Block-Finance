import { createClient } from '@supabase/supabase-js';



const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL! || null,
  import.meta.env.VITE_SUPABASE_ANON_KEY! || null
);

export default async function sellStake(
  stakeId: number,
  daysLeft: number,
){
  const { data: stakeRow, error: stakeError } = await supabase
    .from('tblstakes')
    .select('walletid,quantity')
    .eq('stakeid', stakeId)
    .single();

  if (stakeError || !stakeRow) {
    return { ok: false, error: 'Unable to fetch stake details.' };
  }

  const walletId = stakeRow.walletid;
  const stakeAmount = stakeRow.quantity;

  const { data: walletRow, error: walletError } = await supabase
    .from('tblwalletassets')
    .select('availableqty, StakedQty')
    .eq('walletid', walletId)
    .eq('ticker', 'USDT')
    .single();
  
  if (walletError || !walletRow) {
    return { ok: false, error: 'Unable to fetch wallet balances.' };
  }

  const availableUsd = walletRow.availableqty 
  const stakedUsd = walletRow.StakedQty ;

  const isEarlySell = daysLeft > 0;
  const feeRate = isEarlySell ? 0.1 : 0;
  const feeAmount = stakeAmount * feeRate;
  const amountBack = stakeAmount - feeAmount;

  const { error: walletUpdateError } = await supabase
    .from('tblwalletassets')
    .update({
      availableqty: availableUsd + amountBack,
      StakedQty: stakedUsd - stakeAmount,
      updatedat: new Date(),
    })
    .eq('walletid', walletId)
    .eq('ticker', 'USDT');

  if (walletUpdateError) {
    return { ok: false, error: 'Failed to release staked funds into wallet balance.' };
  }

  const { error: stakeUpdateError } = await supabase
    .from('tblstakes')
    .update({
      status: isEarlySell ? 'early_unstaked' : 'completed',
      penalityapplied: feeAmount,
    })
    .eq('stakeid', stakeId);

  if (stakeUpdateError) {
    return { ok: false, error: 'Failed to mark stake as sold.' };
  }

  return {
    ok: true,
    isEarlySell,
    feeAmount,
    amountBack,
  };
}
