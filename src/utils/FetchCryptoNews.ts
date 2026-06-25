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
    const authToken = import.meta.env.VITE_CRYPTOPANIC_API || '';
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${authToken}&currencies=${newsCode.toLowerCase()}&page=1`;

    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        const results = Array.isArray(json?.results) ? json.results : [];
        type CryptoPanicItem = {
          id: string;
          title: string;
          url: string;
          body?: string;
          published_at: string;
          source?: {domain: string};
        };
        const newsItems: NewsItem[] = results.slice(0, 6).map((item: CryptoPanicItem) => ({
          article_id: item.id,
          title: item.title,
          link: item.url,
          description: item.body?.substring(0, 160) ?? null,
          content: item.body ?? null,
          pubDate: item.published_at,
          image_url: null,
          source_id: item.source?.domain ?? 'unknown',
        }));
        setData(newsItems);
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
