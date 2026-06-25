import { TrendingUp, TrendingDown, BarChart3, Percent } from 'lucide-react';
import type { TradeStats } from '../utils/CalculateTradeStats';

type TradePerformanceMetricsProps = {
  stats: TradeStats;
};

const TradePerformanceMetrics = ({ stats }: TradePerformanceMetricsProps) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPercent = (value: number) =>
    value.toFixed(2);

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    variant = 'default',
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    variant?: 'default' | 'positive' | 'negative';
  }) => {
    const variantStyles = {
      default: 'text-[var(--text-color)]',
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    };

    return (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-[var(--muted-text-color)] text-xs uppercase tracking-wide">
            {label}
          </div>
          <div className="text-[var(--muted-text-color)]">{Icon}</div>
        </div>
        <div className={`text-xl md:text-2xl font-semibold ${variantStyles[variant]}`}>
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-[var(--muted-text-color)] mt-1">
            {subtext}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 size={18} />}
          label="Total Trades"
          value={stats.totalTrades}
          subtext={`${stats.totalBuys} buys, ${stats.totalSells} sells`}
        />

        <MetricCard
          icon={<Percent size={18} />}
          label="Win Rate"
          value={`${formatPercent(stats.winRate)}%`}
          subtext={`${stats.profitableTrades} profitable, ${stats.losingTrades} losses`}
          variant={stats.winRate >= 50 ? 'positive' : stats.winRate > 0 ? 'default' : 'negative'}
        />

        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Total Volume"
          value={`$${formatCurrency(stats.totalVolume)}`}
          subtext={`Avg: $${formatCurrency(stats.averageTradeSize)}`}
        />

        <MetricCard
          icon={<TrendingDown size={18} />}
          label="Total Fees"
          value={`$${formatCurrency(stats.totalFees)}`}
          subtext={`Avg per trade: $${formatCurrency(stats.averageFeePerTrade)}`}
          variant="negative"
        />
      </div>

      {(stats.bestTrade || stats.worstTrade) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.bestTrade && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-emerald-400" />
                <h3 className="text-sm uppercase tracking-wide text-[var(--muted-text-color)]">
                  Best Trade
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-[var(--muted-text-color)]">{stats.bestTrade.ticker}</span>
                  {' - '}
                  <span
                    className={
                      stats.bestTrade.side === 'SELL'
                        ? 'text-orange-400'
                        : 'text-emerald-400'
                    }
                  >
                    {stats.bestTrade.side}
                  </span>
                </p>
                <p className="text-emerald-400 font-semibold">
                  +${formatCurrency(stats.bestTrade.pnl)}
                </p>
                <p className="text-xs text-[var(--muted-text-color)]">
                  {new Date(stats.bestTrade.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {stats.worstTrade && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={18} className="text-red-400" />
                <h3 className="text-sm uppercase tracking-wide text-[var(--muted-text-color)]">
                  Worst Trade
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-[var(--muted-text-color)]">{stats.worstTrade.ticker}</span>
                  {' - '}
                  <span
                    className={
                      stats.worstTrade.side === 'SELL'
                        ? 'text-orange-400'
                        : 'text-emerald-400'
                    }
                  >
                    {stats.worstTrade.side}
                  </span>
                </p>
                <p className="text-red-400 font-semibold">
                  ${formatCurrency(stats.worstTrade.pnl)}
                </p>
                <p className="text-xs text-[var(--muted-text-color)]">
                  {new Date(stats.worstTrade.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradePerformanceMetrics;
