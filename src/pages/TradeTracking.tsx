import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import fetchTradeHistory, { type Trade } from '../utils/FetchTradeHistory';
import { calculateTradeStats, type TradeStats } from '../utils/CalculateTradeStats';
import useCurrentPrices from '../hooks/useCurrentPrices';
import TradeHistoryTable from '../Components/TradeHistoryTable';
import TradePerformanceMetrics from '../Components/TradePerformanceMetrics';
import Button from '../Components/Button';

const TradeTracking = ({ walletId }: { walletId: string | number }) => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [stats, setStats] = useState<TradeStats | null>(null);

  // Get unique tickers from trades for price fetching
  const uniqueTickers = Array.from(new Set(trades.map((t) => t.ticker)));
  const currentPrices = useCurrentPrices(uniqueTickers);
  const isLoadingPrices = Object.keys(currentPrices).length < uniqueTickers.length;
  
  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      try {
        const tradeData = await fetchTradeHistory(walletId);
        setTrades(tradeData);
      } finally {
        setLoading(false);
      }
    };

    if (user && walletId) {
      loadTrades();
    }
  }, [walletId, user]);

  useEffect(() => {
    if (trades.length > 0 && Object.keys(currentPrices).length > 0) {
      const calculatedStats = calculateTradeStats(trades, currentPrices);
      setStats(calculatedStats);
    }
  }, [trades, currentPrices]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--muted-text-color)] border-t-blue-500 animate-spin" />
            <p className="text-[var(--muted-text-color)]">Loading trade data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trades.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
            <p className="text-[var(--muted-text-color)] mb-4">
              Start trading to build your trade history and performance metrics
            </p>
            <Button variant="primary" size="sm">
              Go to Trade
            </Button>
          </div>
        </div>
      ) : (
        <>
          {stats && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Performance Overview</h2>
              <TradePerformanceMetrics stats={stats} />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-4">Trade History</h2>
            <TradeHistoryTable
              trades={trades}
              selectedFilter={filter}
              onFilterChange={setFilter}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TradeTracking;
