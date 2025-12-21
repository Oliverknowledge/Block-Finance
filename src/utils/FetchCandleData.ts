
import {
    type CandlestickData,
    type UTCTimestamp,
  } from "lightweight-charts";
import { type BinanceCandle } from "../types/Binance";
import { coinNameToTicker } from "../data/tickers";
export async function fetchCandleData(
    name: string,
    interval = "1h",
    limit = 1000,
    endTime?: number
    //Type promise that returns in the format of an object with the candlestick data array
  ): Promise<CandlestickData<UTCTimestamp>[]> {
    //Use the object to retrieve the ticker and add the USDT ticker. 
    const ticker = coinNameToTicker[name] + "USDT"
    //set url with the appropriate parameters 
    let url = `https://api.binance.com/api/v1/klines?symbol=${ticker}&interval=${interval}&limit=${limit}`;
    if (endTime) url += `&endTime=${endTime}`;
    //fetch url
    
    const res = await fetch(url);
    const data: BinanceCandle[] = await res.json();
    //parseFloat converts the strings into floating point numbers and it maps through each array (binance candle) within the object
    return data.map(array => ({
      time: (array[0] / 1000) as UTCTimestamp,
      open: parseFloat(array[1]),
      high: parseFloat(array[2]),
      low: parseFloat(array[3]),
      close: parseFloat(array[4]),
    }));
}

  