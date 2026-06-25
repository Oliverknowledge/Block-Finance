
import {
    type CandlestickData,
    type UTCTimestamp,
  } from "lightweight-charts";
import { type BinanceCandle } from "../types/Binance";
import { coinNameToTicker } from "../data/tickers";

async function fetchFromBinance(ticker: string, interval: string, limit: number, endTime?: number): Promise<CandlestickData<UTCTimestamp>[] | null> {
  try {
    let url = `https://api.binance.com/api/v1/klines?symbol=${ticker}&interval=${interval}&limit=${limit}`;
    if (endTime) url += `&endTime=${endTime}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data: BinanceCandle[] = await res.json();
    return data.map(array => ({
      time: (array[0] / 1000) as UTCTimestamp,
      open: parseFloat(array[1]),
      high: parseFloat(array[2]),
      low: parseFloat(array[3]),
      close: parseFloat(array[4]),
    }));
  } catch (err) {
    console.warn("Binance API failed, trying fallback...", err);
    return null;
  }
}

async function fetchFromPolygon(coinName: string, interval: string, limit: number): Promise<CandlestickData<UTCTimestamp>[] | null> {
  try {
    const apiKey = import.meta.env.VITE_POLYGON_API || '';
    if (!apiKey) return null;
    
    const polygonInterval = interval === "1h" ? "hour" : interval === "1d" ? "day" : "minute";
    const url = `https://api.polygon.io/v2/aggs/ticker/C:${coinName.toUpperCase()}USD/range/1/${polygonInterval}?limit=${limit}&apiKey=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const json = await res.json();
    const results: Array<{t: number; o: number; h: number; l: number; c: number}> = json.results || [];
    
    return results.map((bar: {t: number; o: number; h: number; l: number; c: number}) => ({
      time: (bar.t / 1000) as UTCTimestamp,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
    }));
  } catch (err) {
    console.warn("Polygon API failed", err);
    return null;
  }
}

export async function fetchCandleData(
    name: string,
    interval = "1h",
    limit = 1000,
    endTime?: number
    //Type promise that returns in the format of an object with the candlestick data array
  ): Promise<CandlestickData<UTCTimestamp>[]> {
    //Use the object to retrieve the ticker and add the USDT ticker. 
    const ticker = coinNameToTicker[name] + "USDT"
    
    // Try Binance first (primary source)
    let candleData = await fetchFromBinance(ticker, interval, limit, endTime);
    
    // Fallback to Polygon.io if Binance fails
    if (!candleData) {
      candleData = await fetchFromPolygon(name, interval, limit);
    }
    
    // Return empty array if both fail
    return candleData || [];
}

  