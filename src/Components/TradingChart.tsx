import {
  createChart,
  ColorType,
  CandlestickSeries,
  type CandlestickData,
  type UTCTimestamp,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { fetchCandleData } from "../utils/FetchCandleData";
import { useTheme } from "../hooks/useTheme";
interface CandleStickChartProps{
  coin: string
}
export const CandleStickChart:React.FC<CandleStickChartProps> = ({coin}) => {
    
  const { isDark } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const oldestTimeRef = useRef<UTCTimestamp | null>(null);
  const isLoadingRef = useRef(false);
  
  const [data, setData] = useState<CandlestickData<UTCTimestamp>[]>([]);
  

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: { 
        background: { type: ColorType.Solid, color: isDark ? "black" : "white" }, 
        textColor: isDark ? "#d1d4dc" : "#191919" 
      },
      grid: {
        vertLines: { color: isDark ? "#2B2B43" : "#e1e3eb" },
        horzLines: { color: isDark ? "#2B2B43" : "#e1e3eb" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      borderVisible: false,
    });
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []); 

  
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      layout: { 
        background: { type: ColorType.Solid, color: isDark ? "black" : "white" }, 
        textColor: isDark ? "#d1d4dc" : "#191919" 
      },
      grid: {
        vertLines: { color: isDark ? "#2B2B43" : "#e1e3eb" },
        horzLines: { color: isDark ? "#2B2B43" : "#e1e3eb" },
      },
    });
  }, [isDark]);

  useEffect(() => {
    fetchCandleData(coin).then(candles => {
      setData(candles);
      oldestTimeRef.current = candles[0].time;
      seriesRef.current?.setData(candles);

      if (chartRef.current) {
        const chart: IChartApi = chartRef.current;
        chart.timeScale().fitContent();
      }
    });
  }, [coin]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!data.length) return;

      const latestTime = data[data.length - 1].time;
      const newCandles = await fetchCandleData(coin, "1h", 10);

      newCandles.forEach(c => {
        if (c.time > latestTime) {
          seriesRef.current?.update(c);
          setData(prev => [...prev, c]);
        }
      });
    }, 10_000);

    return () => clearInterval(interval);
  }, [data, isDark, coin]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    let isMounted = true;

    chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (!range || oldestTimeRef.current === null || isLoadingRef.current) return;

      if (range.from <= oldestTimeRef.current + 1) {
        isLoadingRef.current = true;
        fetchCandleData("BTCUSDT", "1h", 500, oldestTimeRef.current * 1000).then(oldCandles => {
          if (!isMounted) return;
          
          oldCandles.reverse().forEach(c => seriesRef.current?.update(c));
          if (oldCandles.length) oldestTimeRef.current = oldCandles[0].time;
          setData(prev => [...oldCandles, ...prev]);
          isLoadingRef.current = false;
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />;
}