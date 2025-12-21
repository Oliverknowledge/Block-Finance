import { useEffect, useState } from "react";

interface CoinMetrics {
  price: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  change24h: number;
  fullyDilutedValuation: number | null; 
}

export function useFetchCoinMetrics(coinId?: string) {
  // Update state to include the new metric
  const [data, setData] = useState<CoinMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) return;

    setLoading(true);
    setError(null);

    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`CoinGecko request failed with status: ${res.status}. Check coin ID.`);
        return res.json();
      })
      .then(json => {
        const marketData = json.market_data;

        setData({
          price: marketData.current_price.usd,
          marketCap: marketData.market_cap.usd,
          volume24h: marketData.total_volume.usd,
          circulatingSupply: marketData.circulating_supply,
          fullyDilutedValuation: marketData.fully_diluted_valuation?.usd ?? null, 
          totalSupply: marketData.total_supply ?? marketData.max_supply,
          change24h: marketData.price_change_percentage_24h,
        });
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [coinId]);

  return { data, loading, error };
}