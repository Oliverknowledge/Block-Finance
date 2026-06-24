import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { fetchCandleData } from '../utils/FetchCandleData';
import { useTheme } from '../hooks/useTheme';

type ChartMode = 'line' | 'candlestick';

interface TradingViewChartProps {
  coin: string;
  mode?: ChartMode;
  onMarketDataChange?: (marketData: {
    lastPrice: number | null;
    change24h: number | null;
  }) => void;
}

const TradingViewChart = ({
  coin,
  mode = 'candlestick',
  onMarketDataChange,
}: TradingViewChartProps) => {
  const { isDark } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [candles, setCandles] = useState<CandlestickData<UTCTimestamp>[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#000000' : '#ffffff' },
        textColor: isDark ? '#e5e7eb' : '#1f1f1f',
      },
      grid: {
        vertLines: { color: isDark ? '#34343a' : '#e5e7eb' },
        horzLines: { color: isDark ? '#34343a' : '#e5e7eb' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    if (mode === 'candlestick') {
      candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderVisible: false,
      });
      lineSeriesRef.current = null;
    } else {
      lineSeriesRef.current = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
      });
      candleSeriesRef.current = null;
    }

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
    };
  }, [isDark, mode]);

  useEffect(() => {
    let mounted = true;

    const loadCandles = async () => {
      setCandles([]);
      const nextCandles = await fetchCandleData(coin);
      if (mounted) {
        setCandles(nextCandles);
      }
    };

    void loadCandles();

    return () => {
      mounted = false;
    };
  }, [coin]);

  useEffect(() => {
    if (candles.length === 0) {
      return;
    }

    if (mode === 'candlestick' && candleSeriesRef.current) {
      candleSeriesRef.current.setData(candles);
      chartRef.current?.timeScale().fitContent();
      return;
    }

    if (mode === 'line' && lineSeriesRef.current) {
      const lineData = candles.map((candle) => ({
        time: candle.time,
        value: candle.close,
      }));
      lineSeriesRef.current.setData(lineData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles, mode]);

  const latestChartPrice = candles.length > 0 ? candles[candles.length - 1].close : null;
  const price24hAgo = candles.length > 24 ? candles[candles.length - 25].close : null;
  const chartChange24h =
    latestChartPrice !== null &&
    price24hAgo !== null &&
    Number.isFinite(price24hAgo) &&
    price24hAgo > 0
      ? ((latestChartPrice - price24hAgo) / price24hAgo) * 100
      : null;

  useEffect(() => {
    if (!onMarketDataChange) {
      return;
    }

    onMarketDataChange({
      lastPrice: latestChartPrice,
      change24h: chartChange24h,
    });
  }, [chartChange24h, latestChartPrice, onMarketDataChange]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />;
};

export type { ChartMode };
export { TradingViewChart };
