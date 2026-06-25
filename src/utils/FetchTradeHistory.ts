import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type Trade = {
  tradeid: string;
  walletid: number;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  usdvalue: number;
  price: number;
  fee: number;
  createdate: string;
};

export default async function fetchTradeHistory(
  walletId: string | number
): Promise<Trade[]> {
  if (!walletId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tbltrades')
      .select('tradeid,walletid,ticker,side,quantity,usdvalue,price,fee,createdate')
      .eq('walletid', walletId)
      .order('createdate', { ascending: false });

    if (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }

    return (data || []).map((trade) => ({
      tradeid: String(trade.tradeid ?? ''),
      walletid: Number(trade.walletid ?? 0),
      ticker: String(trade.ticker ?? ''),
      side: (String(trade.side ?? '').toUpperCase() as 'BUY' | 'SELL'),
      quantity: Number(trade.quantity ?? 0),
      usdvalue: Number(trade.usdvalue ?? 0),
      price: Number(trade.price ?? 0),
      fee: Number(trade.fee ?? 0),
      createdate: String(trade.createdate ?? ''),
    }));
  } catch (error) {
    console.error('Exception in fetchTradeHistory:', error);
    return [];
  }
}
