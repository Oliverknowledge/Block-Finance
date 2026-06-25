import { useEffect, useState } from 'react';

export const useCurrentPrices = (tickers: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      if (tickers.length === 0) return;

      try {
        const priceMap: Record<string, number> = {};

        for (const ticker of tickers) {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${ticker.toLowerCase()}&vs_currencies=usd`,
              { signal: AbortSignal.timeout(5000) }
            );

            if (!response.ok) continue;

            const data = (await response.json()) as Record<string, Record<string, number>>;
            const coinId = ticker.toLowerCase();

            if (data[coinId]) {
              priceMap[ticker] = data[coinId].usd || 0;
            }
          } catch {
            // Continue with next ticker if one fails
          }
        }

        setPrices(priceMap);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, [tickers]);

  return prices;
};

export default useCurrentPrices;
