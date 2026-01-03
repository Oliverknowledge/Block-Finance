import { createClient, type User } from '@supabase/supabase-js'
import { type wallet } from '../types/wallet.js';
import fetchWallets from './FetchWallets.js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);


export default async function fetchWalletUSDTBalance(
  user: User | null
  //Promise that returns an array of wallets
): Promise<wallet[]> {
    const wallets = await fetchWallets(user);
    if (!user) return wallets;
    for (const wallet of wallets) {
        const { data, error } = await supabase
            .from('tblwalletassets')
            .select('availableqty')
            .eq('walletid', wallet.walletid)
            .eq('ticker', 'USDT')
            .single();
        if (error) {
            console.error(`Error fetching USDT balance for wallet ${wallet.walletid}:`, error);
            wallet['usdt_balance'] = 0;
        } else {
            wallet['usdt_balance'] = data.availableqty;
        }
    }
    return wallets;
}
