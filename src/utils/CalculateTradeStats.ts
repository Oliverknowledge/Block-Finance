import type { Trade } from './FetchTradeHistory';

export type TradeStats = {
  totalTrades: number;
  totalBuys: number;
  totalSells: number;
  winRate: number;
  profitableTrades: number;
  losingTrades: number;
  totalFees: number;
  averageFeePerTrade: number;
  totalVolume: number;
  averageTradeSize: number;
  bestTrade: {
    ticker: string;
    side: 'BUY' | 'SELL' | null;
    pnl: number;
    date: string;
  } | null;
  worstTrade: {
    ticker: string;
    side: 'BUY' | 'SELL';
    pnl: number;
    date: string;
  } | null;
  tickerPerformance: Record<string, {
    quantity: number;
    totalSpent: number;
    currentValue: number;
    unrealizedPnL: number;
  }>;
};

export function calculateTradeStats(trades: Trade[], currentPrices: Record<string, number>): TradeStats {
  const stats: TradeStats = {
    totalTrades: trades.length,
    totalBuys: 0,
    totalSells: 0,
    winRate: 0,
    profitableTrades: 0,
    losingTrades: 0,
    totalFees: 0,
    averageFeePerTrade: 0,
    totalVolume: 0,
    averageTradeSize: 0,
    bestTrade: null,
    worstTrade: null,
    tickerPerformance: {},
  };

  if (trades.length === 0) {
    return stats;
  }

  let bestPnL = -Infinity;
  let worstPnL = Infinity;
  let bestTradeData: Trade | null = null;
  let worstTradeData: Trade | null = null;

  // Track holdings per ticker
  const holdings: Record<string, { quantity: number; avgCost: number }> = {};
  const allPnLs: number[] = [];

  for (const trade of trades) {
    // Count trades
    if (trade.side === 'BUY') {
      stats.totalBuys += 1;
    } else {
      stats.totalSells += 1;
    }

    // Accumulate fees
    stats.totalFees += trade.fee;

    // Accumulate volume
    stats.totalVolume += trade.usdvalue;

    // Initialize ticker performance if needed
    if (!stats.tickerPerformance[trade.ticker]) {
      stats.tickerPerformance[trade.ticker] = {
        quantity: 0,
        totalSpent: 0,
        currentValue: 0,
        unrealizedPnL: 0,
      };
    }

    // Update holdings tracking
    if (!holdings[trade.ticker]) {
      holdings[trade.ticker] = { quantity: 0, avgCost: 0 };
    }

    if (trade.side === 'BUY') {
      const totalCost = holdings[trade.ticker].quantity * holdings[trade.ticker].avgCost + trade.usdvalue;
      const totalQty = holdings[trade.ticker].quantity + trade.quantity;
      holdings[trade.ticker].avgCost = totalQty > 0 ? totalCost / totalQty : 0;
      holdings[trade.ticker].quantity += trade.quantity;
      stats.tickerPerformance[trade.ticker].totalSpent += trade.usdvalue;
    } else {
      holdings[trade.ticker].quantity -= trade.quantity;
      const pnl = trade.usdvalue - trade.quantity * holdings[trade.ticker].avgCost;
      allPnLs.push(pnl);

      if (pnl > bestPnL) {
        bestPnL = pnl;
        bestTradeData = trade;
      }
      if (pnl < worstPnL) {
        worstPnL = pnl;
        worstTradeData = trade;
      }

      if (pnl > 0) {
        stats.profitableTrades += 1;
      } else if (pnl < 0) {
        stats.losingTrades += 1;
      }
    }
  }

  // Calculate ticker performance with current prices
  for (const [ticker, holding] of Object.entries(holdings)) {
    if (holding.quantity > 0) {
      const currentPrice = currentPrices[ticker] || 0;
      const currentValue = holding.quantity * currentPrice;
      stats.tickerPerformance[ticker].quantity = holding.quantity;
      stats.tickerPerformance[ticker].currentValue = currentValue;
      stats.tickerPerformance[ticker].unrealizedPnL =
        currentValue - (holding.avgCost * holding.quantity);
    }
  }

  // Calculate win rate
  if (allPnLs.length > 0) {
    stats.winRate = (stats.profitableTrades / allPnLs.length) * 100;
  }

  // Average fee per trade
  if (stats.totalTrades > 0) {
    stats.averageFeePerTrade = stats.totalFees / stats.totalTrades;
  }

  // Average trade size
  if (stats.totalTrades > 0) {
    stats.averageTradeSize = stats.totalVolume / stats.totalTrades;
  }

  // Best and worst trades
  if (bestTradeData) {
    stats.bestTrade = {
      ticker: bestTradeData.ticker,
      side: bestTradeData.side,
      pnl: bestPnL,
      date: bestTradeData.createdate,
    };
  }

  if (worstTradeData) {
    stats.worstTrade = {
      ticker: worstTradeData.ticker,
      side: worstTradeData.side,
      pnl: worstPnL,
      date: worstTradeData.createdate,
    };
  }

  return stats;
}
