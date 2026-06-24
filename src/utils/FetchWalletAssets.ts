import { createClient } from '@supabase/supabase-js';

export type WalletAssetPosition = {
  walletid: number;
  ticker: string;
  availableqty: number;
  avgcost: number;
  stakedqty: number;
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

export default async function fetchWalletAssets(walletId: string | number): Promise<WalletAssetPosition[]> {
  const normalizedWalletId = Number(walletId);
  if (!Number.isFinite(normalizedWalletId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('tblwalletassets')
    .select('walletid,ticker,availableqty,avgcost,StakedQty')
    .eq('walletid', normalizedWalletId);

  if (error) {
    console.error('Error fetching wallet assets:', error);
    return [];
  }

  return (data ?? []).map((asset) => ({
    walletid: Number(asset.walletid ?? normalizedWalletId),
    ticker: String(asset.ticker ?? '').toUpperCase(),
    availableqty: Number(asset.availableqty ?? 0),
    avgcost: Number(asset.avgcost ?? 0),
    stakedqty: Number(asset.StakedQty ?? 0),
  }));
}

