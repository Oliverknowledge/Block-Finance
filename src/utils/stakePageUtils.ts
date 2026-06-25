import type { User } from '@supabase/supabase-js';
import type { wallet } from '../types/Wallet';
import type { WalletStake } from './FetchWalletStakes';
import fetchWalletUSDTBalance from './FetchWalletUSDTBalance';
import fetchWalletStakes from './FetchWalletStakes';
import { CHAINS } from '../lib/chainStakeData';
import { coinNameToTicker } from '../data/tickers';

export const fetchStakeWalletData = async (user: User | null, preferredWalletId = '') => {
  if (!user) {
    return {
      nextWallets: [] as wallet[],
      nextWalletStakes: [] as WalletStake[],
      selectedWalletId: '',
    };
  }

  const nextWallets = await fetchWalletUSDTBalance(user);
  const walletIds = nextWallets.map((w) => w.walletid);
  const nextWalletStakes = await fetchWalletStakes(walletIds, 'active');

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

  return { nextWallets, nextWalletStakes, selectedWalletId };
};

export const getStakeChainNameFromTicker = (ticker: string): string => {
  const chain = CHAINS.find(
    (c) => coinNameToTicker[c.name.toLowerCase()] === ticker || c.name.slice(0, 5).toUpperCase() === ticker,
  );
  return chain?.name || '';
};

export const getStakeLockupDaysFromTicker = (ticker: string): number => {
  const chain = CHAINS.find(
    (c) => coinNameToTicker[c.name.toLowerCase()] === ticker || c.name.slice(0, 5).toUpperCase() === ticker,
  );
  return chain?.staking.lockupDays ?? 0;
};

export const resolveStakeWalletId = (wallets: wallet[], preferredWalletId: string): string => {
  if (preferredWalletId && wallets.some((w) => String(w.walletid) === preferredWalletId)) {
    return preferredWalletId;
  }
  return wallets.length > 0 ? String(wallets[0].walletid) : '';
};
