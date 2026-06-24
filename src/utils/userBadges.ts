import type { User } from '@supabase/supabase-js';
import fetchXp from './fetchXP';
import fetchWallets from './FetchWallets';
import { supabase } from '../lib/supabaseClient';
import { badgeDefinitions } from '../data/BadgeDefinitions';

export default async function fetchUserBadgeProgress(user: User){
  //Fetch statistics
  const xp = await fetchXp(user);
  const wallets = await fetchWallets(user);

  let tradeCount = 0;
  for (const wallet of wallets) {
    //Validate wallet id
    if (!wallet.walletid) {
      continue;
    }
    const walletId = wallet.walletid
    const { count, error } = await supabase
      .from('tbltrades')
      .select('tradeid', { head: true, count: 'exact' })
      .eq('walletid', walletId);
    if (error) {
      console.error(`Error fetching trade count for wallet ${walletId}:`, error);
      continue;
    }
    tradeCount += count!;
  }
  const badges = []
  for (const badge of badgeDefinitions) {
    const unlocked = badge.isUnlocked(xp, tradeCount);

    badges.push({
      id: badge.id,
      symbol: badge.symbol,
      title: badge.title,
      description: badge.description,
      unlocked,
    });
  }
  return {
    badges,
    xp,
    tradeCount,
  };
}
