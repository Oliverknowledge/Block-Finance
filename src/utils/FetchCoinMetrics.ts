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

    
    const url = `https://api.coincap.io/v2/assets/${coinId}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`CoinCap request failed with status: ${res.status}. Check coin ID.`);
        return res.json();
      })
      .then(json => {
        const asset = json.data;

        setData({
          price: parseFloat(asset.priceUsd),
          marketCap: parseFloat(asset.marketCapUsd) || 0,
          volume24h: parseFloat(asset.volumeUsd24Hr) || 0,
          circulatingSupply: parseFloat(asset.supply) || 0,
          fullyDilutedValuation: null,
          totalSupply: parseFloat(asset.maxSupply) || parseFloat(asset.supply) || null,
          change24h: parseFloat(asset.changePercent24Hr) || 0,
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