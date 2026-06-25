import { useEffect, useState } from 'react';

export interface ExtendedCoinMetrics {
  // Basic price data
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  change1y: number | null;
  
  // Market data
  marketCap: number;
  marketCapRank: number | null;
  fullyDilutedValuation: number | null;
  marketCapChangePercent24h: number;
  
  // Volume and liquidity
  volume24h: number;
  volumeToMarketCapRatio: number;
  
  // Supply data
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  
  // Historical highs/lows
  ath: number;
  athChangePercent: number;
  atl: number;
  atlChangePercent: number;
  
  // Volatility
  priceVolatility30d: number | null;
}

export function useFetchExtendedCoinMetrics(coinId?: string) {
  const [data, setData] = useState<ExtendedCoinMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) return;

    setLoading(true);
    setError(null);

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;

    fetch(url, { signal: AbortSignal.timeout(10000) })
      .then((res) => {
        if (!res.ok) throw new Error(`CoinGecko request failed with status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const marketData = json.market_data;
        const sparkline = json.market_data?.sparkline_7d?.price || [];

        // Calculate 7-day volatility from sparkline
        let volatility30d: number | null = null;
        if (sparkline.length > 0) {
          const returns = [];
          for (let i = 1; i < sparkline.length; i++) {
            returns.push(Math.log(sparkline[i] / sparkline[i - 1]));
          }
          if (returns.length > 0) {
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
            volatility30d = Math.sqrt(variance) * 100;
          }
        }

        const volumeToMarketCap =
          marketData.market_cap.usd && marketData.total_volume.usd
            ? (marketData.total_volume.usd / marketData.market_cap.usd) * 100
            : 0;

        setData({
          price: marketData.current_price.usd || 0,
          change24h: marketData.price_change_percentage_24h || 0,
          change7d: marketData.price_change_percentage_7d || 0,
          change30d: marketData.price_change_percentage_30d || 0,
          change1y: marketData.price_change_percentage_1y,
          
          marketCap: marketData.market_cap.usd || 0,
          marketCapRank: json.market_cap_rank,
          fullyDilutedValuation: marketData.fully_diluted_valuation?.usd || null,
          marketCapChangePercent24h: marketData.market_cap_change_percentage_24h || 0,
          
          volume24h: marketData.total_volume.usd || 0,
          volumeToMarketCapRatio: volumeToMarketCap,
          
          circulatingSupply: marketData.circulating_supply || 0,
          totalSupply: marketData.total_supply,
          maxSupply: marketData.max_supply,
          
          ath: marketData.ath.usd || 0,
          athChangePercent: marketData.ath_change_percentage.usd || 0,
          atl: marketData.atl.usd || 0,
          atlChangePercent: marketData.atl_change_percentage.usd || 0,
          
          priceVolatility30d: volatility30d,
        });
      })
      .catch((err) => {
        console.error('Fetch Error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [coinId]);

  return { data, loading, error };
}

export default useFetchExtendedCoinMetrics;
