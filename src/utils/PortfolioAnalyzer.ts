import type { Trade } from '../utils/FetchTradeHistory';

export type PortfolioAnalysis = {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercent: number;
  positions: PositionAnalysis[];
  riskScore: number; // 1-10 scale
  diversification: number; // 0-100%
  largestPosition: PositionAnalysis | null;
};

export type PositionAnalysis = {
  ticker: string;
  quantity: number;
  costBasis: number;
  currentValue: number;
  unrealizedPnL: number;
  returnPercent: number;
  portfolioWeight: number;
  riskLevel: 'low' | 'medium' | 'high';
};

export function analyzePortfolio(
  trades: Trade[],
  currentPrices: Record<string, number>
): PortfolioAnalysis {
  const positions: Record<string, PositionAnalysis> = {};
  let totalInvested = 0;
  let currentValue = 0;

  // Reconstruct holdings from trades
  const holdings: Record<
    string,
    { quantity: number; totalCost: number; tradeCount: number }
  > = {};

  for (const trade of trades) {
    if (!holdings[trade.ticker]) {
      holdings[trade.ticker] = { quantity: 0, totalCost: 0, tradeCount: 0 };
    }

    if (trade.side === 'BUY') {
      holdings[trade.ticker].quantity += trade.quantity;
      holdings[trade.ticker].totalCost += trade.usdvalue + trade.fee;
    } else {
      holdings[trade.ticker].quantity -= trade.quantity;
      holdings[trade.ticker].totalCost -= (trade.usdvalue - trade.fee);
    }
    holdings[trade.ticker].tradeCount += 1;
  }

  // Calculate position details
  for (const [ticker, holding] of Object.entries(holdings)) {
    if (holding.quantity > 0) {
      const avgCost = holding.totalCost / holding.quantity;
      const currentPrice = currentPrices[ticker] || 0;
      const currentVal = holding.quantity * currentPrice;
      const costBasis = holding.quantity * avgCost;
      const unrealizedPnL = currentVal - costBasis;
      const returnPercent = avgCost > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

      // Determine risk level based on volatility and concentration
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      if (returnPercent < -20 || holding.tradeCount > 10) {
        riskLevel = 'high';
      } else if (returnPercent > 50) {
        riskLevel = 'low';
      }

      positions[ticker] = {
        ticker,
        quantity: holding.quantity,
        costBasis,
        currentValue: currentVal,
        unrealizedPnL,
        returnPercent,
        portfolioWeight: 0, // Will be calculated after total
        riskLevel,
      };

      totalInvested += costBasis;
      currentValue += currentVal;
    }
  }

  // Calculate portfolio weights and find largest position
  let largestPosition: PositionAnalysis | null = null;
  let maxWeight = 0;

  for (const position of Object.values(positions)) {
    position.portfolioWeight =
      totalInvested > 0 ? (position.currentValue / currentValue) * 100 : 0;
    if (position.portfolioWeight > maxWeight) {
      maxWeight = position.portfolioWeight;
      largestPosition = position;
    }
  }

  // Calculate diversification score (0-100, higher is more diverse)
  // Using Herfindahl index
  let herfindahlIndex = 0;
  for (const position of Object.values(positions)) {
    const weight = position.portfolioWeight / 100;
    herfindahlIndex += weight * weight;
  }
  const diversification = Math.max(
    0,
    Math.min(100, (1 - herfindahlIndex) * 100)
  );

  // Calculate risk score (1-10)
  let riskScore = 5;
  const negativePositions = Object.values(positions).filter(
    (p) => p.unrealizedPnL < 0
  ).length;
  const highRiskPositions = Object.values(positions).filter(
    (p) => p.riskLevel === 'high'
  ).length;

  riskScore += negativePositions * 0.5;
  riskScore += highRiskPositions * 1;
  riskScore += (1 - diversification / 100) * 2;
  riskScore = Math.min(10, Math.max(1, riskScore));

  const totalReturn = currentValue - totalInvested;
  const returnPercent =
    totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalReturn,
    returnPercent,
    positions: Object.values(positions),
    riskScore: Math.round(riskScore * 10) / 10,
    diversification: Math.round(diversification),
    largestPosition,
  };
}
