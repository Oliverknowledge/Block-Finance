import { createClient, type User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function deleteWallet(
  user: User | null,
  walletid: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!user) {
    return { ok: false, error: 'You must be logged in to delete wallets.' };
  }

  const numericWalletId = Number(walletid);
  const walletFilter = Number.isFinite(numericWalletId) ? numericWalletId : walletid;

  const walletCheck = await supabase
    .from('tblwallets')
    .select('walletid')
    .eq('walletid', walletFilter)
    .eq('user_id', user.id)
    .maybeSingle();

  if (walletCheck.error) {
    return { ok: false, error: 'Unable to verify wallet ownership.' };
  }

  if (!walletCheck.data) {
    return { ok: false, error: 'Wallet not found.' };
  }

  const tradeDelete = await supabase.from('tbltrades').delete().eq('walletid', walletFilter);
  if (tradeDelete.error) {
    return { ok: false, error: 'Unable to delete wallet trades.' };
  }

  const stakeDelete = await supabase.from('tblstakes').delete().eq('walletid', walletFilter);
  if (stakeDelete.error) {
    return { ok: false, error: 'Unable to delete wallet stakes.' };
  }

  const assetDelete = await supabase.from('tblwalletassets').delete().eq('walletid', walletFilter);
  if (assetDelete.error) {
    return { ok: false, error: 'Unable to delete wallet assets.' };
  }

  const walletDelete = await supabase
    .from('tblwallets')
    .delete()
    .eq('walletid', walletFilter)
    .eq('user_id', user.id);

  if (walletDelete.error) {
    return { ok: false, error: 'Unable to delete wallet.' };
  }

  return { ok: true };
}
