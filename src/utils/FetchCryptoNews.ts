import { useEffect, useState } from "react";
import { coinNameToTicker } from "../data/tickers";

interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_priority: number;
  source_url: string;
  source_icon: string | null;
  language: string;
  country: string[];
  category: string[];
  ai_tag: string | null;
  sentiment: string | null;
  sentiment_stats: string | null;
  ai_region: string | null;
  ai_org: string | null;
  ai_person: string | null;
  ai_place: string | null;
  ai_exchange: string | null;
  ai_company: string | null;
  ai_product: string | null;
  ai_quote: string | null;
}



export function useFetchCryptoNews(coinName?: string) {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //useEffect that is triggered each time the user searches for a new coin
  useEffect(() => {
    if (!coinName) {
      setData([]);
      return;
    }
    //Convert coin name to ticker 
    const newsCode = coinNameToTicker[coinName.toLowerCase()];
    if (!newsCode) {
      setError(`No news code found for coin: ${coinName}`);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    const apiKey = import.meta.env.VITE_NEWSDATA_API 
    // Free tier may not support from_date parameter, so we'll try without it first
    // If needed, you can add from_date for paid tiers
    const url = `https://newsdata.io/api/1/crypto?apikey=${apiKey}&coin=${newsCode.toLowerCase()}`;

    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        //Set data as the first 6
        setData(json.results.slice(0, 6));
       
      })
      //Catch the error
      .catch((err) => {
        console.error("News Fetch Error:", err);
        setError(err.message);
        setData([]);
      })
      //Set loading to false
      .finally(() => setLoading(false));
  }, [coinName]);
  //Return data, loading and error
  return { data, loading, error };
}
