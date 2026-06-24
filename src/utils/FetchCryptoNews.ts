import { useEffect, useState } from "react";
import { coinNameToTicker } from "../data/tickers";

type NewsItem = {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;
};

export function useFetchCryptoNews(coinName?: string) {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinName) {
      setData([]);
      return;
    }

    const newsCode = coinNameToTicker[coinName.toLowerCase()];
    if (!newsCode) {
      setError(`No news code found for coin: ${coinName}`);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    const apiKey = import.meta.env.VITE_NEWSDATA_API;
    const url = `https://newsdata.io/api/1/crypto?apikey=${apiKey}&coin=${newsCode.toLowerCase()}`;

    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        const results = Array.isArray(json?.results) ? json.results : [];
        setData(results.slice(0, 6) as NewsItem[]);
      })
      .catch((err) => {
        console.error("News Fetch Error:", err);
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [coinName]);

  return { data, loading, error };
}
