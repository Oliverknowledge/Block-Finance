import { supabase } from '../lib/supabaseClient';

const XP_PER_TRADE = 10;
const XP_PER_WALLET = 50;
const WALLET_STARTING_USDT = 100000;
const key = (value: unknown) => String(value ?? '').trim().toLowerCase();

export type LeaderboardUser = {
  userId: string;
  username: string | null;
  email: string | null;
  xpAllTime: number | null;
  xp7d: number;
  portfolioAllTime: number;
  portfolio7d: number;
  portfolioAllTimeWalletName: string;
  portfolio7dWalletName: string;
};

export type LeaderboardRow = LeaderboardUser & {
  score: number;
  rank: number;
};

export const buildLeaderboardRows = (
  leaderboardUsers: LeaderboardUser[],
  selectedMetric: 'xp' | 'PnL',
  selectedTimeframe: '7d' | 'all-time',
) => {
  // This list will hold users with one common score field,
  // so UI rendering can use the same table for XP and Portfolio modes.
  const rankedRows: LeaderboardRow[] = [];

  // Step 1: pick the correct score for each user based on the active filters.
  // - XP + 7D        -> xp7d
  // - XP + All-time  -> xpAllTime
  // - Portfolio + 7D -> portfolio7d
  // - Portfolio + All-time -> portfolioAllTime
  for (let i = 0; i < leaderboardUsers.length; i += 1) {
    const leaderboardUser = leaderboardUsers[i];
    let selectedScore = 0;

    if (selectedMetric === 'xp') {
      if (selectedTimeframe === '7d') {
        selectedScore = leaderboardUser.xp7d|| 0;
      } else {
        selectedScore = leaderboardUser.xpAllTime || 0;
      }
    } else if (selectedTimeframe === '7d') {
      selectedScore = leaderboardUser.portfolio7d|| 0;
    } else {
      selectedScore = leaderboardUser.portfolioAllTime || 0;
    }

    // Keep all original user fields and attach the computed score used for ranking.
    rankedRows.push({
      ...leaderboardUser,
      score: selectedScore,
      rank: 0,
    });
  }

  // Step 2: sort highest score first.
  // If two users have the same score, sort by username alphabetically for stable order.
  rankedRows.sort((leftRow, rightRow) => {
    if (rightRow.score !== leftRow.score) {
      return rightRow.score - leftRow.score;
    }
    return String(leftRow.username).localeCompare(String(rightRow.username));
  });

  // Step 3: assign rank numbers after sorting (1-based rank).
  for (let i = 0; i < rankedRows.length; i += 1) {
    rankedRows[i].rank = i + 1;
  }

  // Final output consumed by Leaderboard.tsx.
  return rankedRows;
};

type DbUserRow = {
  id: unknown;
  username: unknown;
  email: unknown;
  xp: unknown;
};

type DbWalletRow = {
  walletid: unknown;
  user_id: unknown;
  name: unknown;
  createdate: unknown;
};

type DbAssetRow = {
  walletid: unknown;
  ticker: unknown;
  availableqty: unknown;
};

type DbStakeRow = {
  walletid: unknown;
  quantity: unknown;
  rewardsaccrued: unknown;
  status: unknown;
  createdat: unknown;
};

type DbTradeRow = {
  walletid: unknown;
  ticker: unknown;
  side: unknown;
  quantity: unknown;
  usdvalue: unknown;
  fee: unknown;
  createdate: unknown;
};

type WalletInfo = Record<string, { userId: string; walletName: string }>;
type HoldingsByWallet = Record<string, Record<string, number>>;

export default async function fetchLeaderboardData(): Promise<LeaderboardUser[]> {
  // Build a cutoff for "last 7 days" logic used in trades and wallet-created XP.
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const cutoffMs = now - sevenDaysMs;
  // Fetch all users
  const usersResponse = await supabase.from('tblusers').select('id,username,email,xp');
  if (usersResponse.error) {
    throw new Error(usersResponse.error.message);
  }
  //Fetch all wallets
  const walletsResponse = await supabase.from('tblwallets').select('walletid,user_id,name,createdate');
  if (walletsResponse.error) {
    throw new Error(walletsResponse.error.message);
  }
  // Fetch all assets
  const assetsResponse = await supabase.from('tblwalletassets').select('walletid,ticker,availableqty');
  if (assetsResponse.error) {
    throw new Error(assetsResponse.error.message);
  }
  //Fetch all stakes
  const stakesResponse = await supabase.from('tblstakes').select('walletid,quantity,rewardsaccrued,status,createdat');
  if (stakesResponse.error) {
    throw new Error(stakesResponse.error.message);
  }
  //Fetch all trades
  const tradesResponse = await supabase
    .from('tbltrades')
    .select('walletid,ticker,side,quantity,usdvalue,fee,createdate');
  if (tradesResponse.error) {
    throw new Error(tradesResponse.error.message);
  }

  // Normalize null responses to empty arrays so loops can run safely.
  const users = (usersResponse.data || []) as DbUserRow[];
  const wallets = (walletsResponse.data || []) as DbWalletRow[];
  const assets = (assetsResponse.data || []) as DbAssetRow[];
  const stakes = (stakesResponse.data || []) as DbStakeRow[];
  const allTrades = (tradesResponse.data || []) as DbTradeRow[];

  const trades: DbTradeRow[] = [];
  for (let i = 0; i < allTrades.length; i += 1) {
    const trade = allTrades[i];
    const createdMs = new Date(String(trade.createdate)).getTime();
    if (createdMs >= cutoffMs) {
      trades.push(trade);
    }
  }

  // walletInfo maps walletId -> owner user + display name.
  // currentHoldings maps walletId -> { ticker: qty } for "current" balances.
  const walletInfo: WalletInfo = {};
  const currentHoldings: HoldingsByWallet = {};

  // Build wallet lookup and initialize empty holdings buckets.
  for (let i = 0; i < wallets.length; i += 1) {
    const wallet = wallets[i];
    const walletId = String(wallet.walletid);
    const walletName = String(wallet.name || '').trim() || `Wallet ${walletId}`;

    walletInfo[walletId] = {
      userId: key(wallet.user_id),
      walletName,
    };

    currentHoldings[walletId] = {};
  }

  // Fill currentHoldings from wallet asset rows.
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    const walletId = String(asset.walletid);
    if (!walletInfo[walletId]) continue;
    const ticker = String(asset.ticker);
    const qty = Number(asset.availableqty) || 0;
    currentHoldings[walletId][ticker] = (Number(currentHoldings[walletId][ticker]) || 0) + qty;
  }
  
  // Create a separate snapshot for historical balances (7d ago estimate).
  // We reverse recent trades on this snapshot only.
  const historicalHoldings: HoldingsByWallet = structuredClone(currentHoldings);
  

  // Tracks trade count per user for XP(7d) calculation.
  const tradeCountByUser: Record<string, number> = {};

  // Reverse each recent trade to estimate balances at cutoff time.
  for (let i = 0; i < trades.length; i += 1) {
    // Read each trade row and locate the wallet it belongs to.
    const trade = trades[i];
    const walletId = String(trade.walletid);
    const info = walletInfo[walletId];
    if (!info) continue;

    // Ticker & user are the keys used to update holdings and XP counters.
    const ticker = String(trade.ticker || '').trim().toUpperCase();
    // Parse the trade values used in reverse math.
    const quantity = Number(trade.quantity) || 0;
    const usdValue = Number(trade.usdvalue) || 0;
    const fee = Number(trade.fee) || 0;
    const side = String(trade.side || '').trim().toUpperCase();

    if (historicalHoldings[walletId][ticker] === undefined) {
      historicalHoldings[walletId][ticker] = 0;
    }
    if (historicalHoldings[walletId].USDT === undefined) {
      historicalHoldings[walletId].USDT = 0;
    }

    // Reverse BUY trade:
    // remove bought asset from historical snapshot and add spent USDT back.
    if (side === 'BUY') {
      historicalHoldings[walletId][ticker] = historicalHoldings[walletId][ticker] - quantity;
      historicalHoldings[walletId].USDT  = historicalHoldings[walletId].USDT + usdValue + fee;
    }
    // Reverse SELL trade:
    // add sold asset back and remove received USDT.
    if (side === 'SELL') {
      historicalHoldings[walletId][ticker] = historicalHoldings[walletId][ticker]+ quantity;
      historicalHoldings[walletId].USDT = historicalHoldings[walletId].USDT - usdValue;
    }
    const userId = info.userId;

    // 7D XP uses number of trades, so increment once per trade row.
    tradeCountByUser[userId] = (Number(tradeCountByUser[userId]) || 0) + 1;
  }

  // Count how many wallets each user created in the last 7 days.
  const walletCreated7dByUser: Record<string, number> = {};
  for (let i = 0; i < wallets.length; i += 1) {
    const wallet = wallets[i];
    const createdMs = new Date(String(wallet.createdate)).getTime();
    if (createdMs < cutoffMs) continue;

    const userId = key(wallet.user_id);
    walletCreated7dByUser[userId] = (Number(walletCreated7dByUser[userId]) || 0) + 1;
  }

  // Stake totals are tracked separately from wallet assets.
  // We store a current and historical value per wallet.
  const currentStakeValueByWallet: Record<string, number> = {};
  const historicalStakeValueByWallet: Record<string, number> = {};

  for (let i = 0; i < stakes.length; i += 1) {
    const stake = stakes[i];
    const walletId = String(stake.walletid);

    // Only active stakes should contribute to current/historical portfolio value.
    const status = String(stake.status || '').toLowerCase();
    if (status !== 'active') {
      continue;
    }

    // Stake value = staked principal + rewards accrued.
    const stakeValue = (Number(stake.quantity) || 0) + (Number(stake.rewardsaccrued) || 0);

    // Current stake value for this wallet.
    currentStakeValueByWallet[walletId] = (Number(currentStakeValueByWallet[walletId]) || 0) + stakeValue;

    // If stake already existed before cutoff, include it in historical stake value.
    if (new Date(String(stake.createdat)).getTime() <= cutoffMs) {
      historicalStakeValueByWallet[walletId] = (Number(historicalStakeValueByWallet[walletId]) || 0) + stakeValue;
    }
  }

  // Price caches:
  // - currentPrices[ticker] is live price from Binance ticker endpoint.
  // - historicalPrices[ticker] is close price near cutoff from Binance klines.
  // Prices are fetched lazily when first needed and then reused.
  const currentPrices: Record<string, number> = {};
  const historicalPrices: Record<string, number> = {};
  // Group wallet-level performance under each user.
  const walletScoresByUser: Record<
    string,
    Array<{ walletName: string; portfolioAllTime: number; portfolio7d: number }>
  > = {};
  // For each wallet:
  // 1) value current holdings
  // 2) value historical holdings
  // 3) add stake values
  // 4) compute all-time and 7d portfolio scores
  for (const walletId in walletInfo) {
    const info = walletInfo[walletId];
    let currentAssetsValue = 0;
    const current = currentHoldings[walletId] || {};
    for (const ticker in current) {
      const qty = Number(current[ticker]);
      if (qty === 0) {
        continue;
      }
      // Add any USDT value.
      if (ticker === 'USDT'){
        currentAssetsValue += qty;
      } else {
        // First time we see this ticker, fetch and cache current price.
        if (currentPrices[ticker] === undefined) {
          const pair = ticker + 'USDT'
          try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      
            const data = await res.json();
            currentPrices[ticker] = Number((data as { price?: unknown })?.price) || 0;
          } catch {
            currentPrices[ticker] = 0;
          }
        }
        currentAssetsValue += qty * (Number(currentPrices[ticker]) || 0);
      }
    }
    //Repeat for historical
    let historicalAssetsValue = 0;
    const historical = historicalHoldings[walletId] || {};
    for (const ticker in historical) {
      const qty = Number(historical[ticker])
      
      if (ticker === 'USDT'){
        historicalAssetsValue += qty;
      } else {
        // First time we see this ticker historically, fetch and cache cutoff close.
        if (historicalPrices[ticker] === undefined) {
          const pair = ticker.endsWith('USDT') ? ticker : `${ticker}USDT`;
          try {
            const res = await fetch(
              `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1d&limit=1&endTime=${cutoffMs}`,
            );
            const data = await res.json();
            historicalPrices[ticker] = Number((data as unknown[])?.[0] && (data as unknown[][])[0]?.[4]) || 0;
          } catch {
            historicalPrices[ticker] = 0;
          }
        }
        historicalAssetsValue += qty * (historicalPrices[ticker]);
      }
    }

    // Add stake value to each side before computing portfolio metrics.
    const currentStakeValue = Number(currentStakeValueByWallet[walletId]) || 0;
    const historicalStakeValue = Number(historicalStakeValueByWallet[walletId]) || 0;

    const walletAllTimeValue = currentAssetsValue + currentStakeValue;
    const walletHistoricalValue = historicalAssetsValue + historicalStakeValue;

    // All-time compares against the wallet baseline.
    // 7d compares current value vs estimated value at cutoff.
    const portfolioAllTime = walletAllTimeValue - WALLET_STARTING_USDT;
    const portfolio7d = walletAllTimeValue - walletHistoricalValue;

    if (!walletScoresByUser[info.userId]) {
      walletScoresByUser[info.userId] = [];
    }

    walletScoresByUser[info.userId].push({
      walletName: info.walletName,
      portfolioAllTime,
      portfolio7d,
    });
  }
  // Build one final leaderboard payload row per user.
  const result: LeaderboardUser[] = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    const userId = key(user.id);
    const userWallets = walletScoresByUser[userId] || [];

    let bestAllTimeScore = 0;
    let best7dScore = 0;
    let bestAllTimeWalletName = '';
    let best7dWalletName = '';

    for (let j = 0; j < userWallets.length; j += 1) {
      const wallet = userWallets[j];
      const allTime = Number(wallet.portfolioAllTime) || 0;
      const sevenDay = Number(wallet.portfolio7d) || 0;

      if (j === 0 || allTime > bestAllTimeScore) {
        bestAllTimeScore = allTime;
        bestAllTimeWalletName = String(wallet.walletName || '');
      }

      if (j === 0 || sevenDay > best7dScore) {
        best7dScore = sevenDay;
        best7dWalletName = String(wallet.walletName || '');
      }
    }

    // 7d XP combines activity counts from trades and wallet creation.
    const trades7d = Number(tradeCountByUser[userId]) || 0;
    const wallets7d = Number(walletCreated7dByUser[userId]) || 0;
    const xp7d = trades7d * XP_PER_TRADE + wallets7d * XP_PER_WALLET;

    const username = user.username;

    result.push({
      userId,
      username: typeof username === 'string' ? username : username == null ? null : String(username),
      email: typeof user.email === 'string' ? user.email : user.email == null ? null : String(user.email),
      xpAllTime: typeof user.xp === 'number' ? user.xp : user.xp == null ? null : Number(user.xp) || 0,
      xp7d,
      portfolioAllTime: bestAllTimeScore,
      portfolio7d: best7dScore,
      portfolioAllTimeWalletName: bestAllTimeWalletName,
      portfolio7dWalletName: best7dWalletName,
    });
  }
  return result;
}
