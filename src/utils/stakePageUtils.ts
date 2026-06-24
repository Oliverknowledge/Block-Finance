import type { User } from '@supabase/supabase-js';
import type { wallet } from '../types/Wallet';
import fetchWalletUSDTBalance from './FetchWalletUSDTBalance';

export const fetchStakeWalletData = async (user: User | null, preferredWalletId = '') => {
  if (!user) {
    return {
      nextWallets: [] as wallet[],
      selectedWalletId: '',
    };
  }

  const nextWallets = await fetchWalletUSDTBalance(user);

  let selectedWalletId = '';
  if (preferredWalletId) {
    for (const walletItem of nextWallets) {
      if (String(walletItem.walletid) === preferredWalletId) {
        selectedWalletId = preferredWalletId;
      }
    }
  }

  if (selectedWalletId === '' && nextWallets.length > 0) {
    selectedWalletId = String(nextWallets[0].walletid);
  }

  return { nextWallets, selectedWalletId };
};
