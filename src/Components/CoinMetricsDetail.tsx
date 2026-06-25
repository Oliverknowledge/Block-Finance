import { AlertCircle } from 'lucide-react';
import type { ExtendedCoinMetrics } from '../hooks/useFetchExtendedCoinMetrics';

type CoinMetricsDetailProps = {
  metrics: ExtendedCoinMetrics;
};

const CoinMetricsDetail = ({ metrics }: CoinMetricsDetailProps) => {
  const formatPrice = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 8 : 2,
    });

  const formatCompact = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const MetricRow = ({
    label,
    value,
    subtext,
    isPositive,
  }: {
    label: string;
    value: string | number;
    subtext?: string;
    isPositive?: boolean;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-b-0">
      <p className="text-sm text-[var(--muted-text-color)]">{label}</p>
      <div className="text-right">
        <p
          className={`font-medium ${
            isPositive === true
              ? 'text-emerald-400'
              : isPositive === false
              ? 'text-red-400'
              : 'text-[var(--text-color)]'
          }`}
        >
          {value}
        </p>
        {subtext && <p className="text-xs text-[var(--muted-text-color)]">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Price Overview */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Price Overview</h3>
        <div>
          <MetricRow
            label="Current Price"
            value={`$${formatPrice(metrics.price)}`}
            isPositive={metrics.change24h >= 0}
          />
          <MetricRow
            label="24h Change"
            value={`${metrics.change24h >= 0 ? '+' : ''}${metrics.change24h.toFixed(2)}%`}
            isPositive={metrics.change24h >= 0}
          />
          <MetricRow
            label="7d Change"
            value={`${metrics.change7d >= 0 ? '+' : ''}${metrics.change7d.toFixed(2)}%`}
            isPositive={metrics.change7d >= 0}
          />
          <MetricRow
            label="30d Change"
            value={`${metrics.change30d >= 0 ? '+' : ''}${metrics.change30d.toFixed(2)}%`}
            isPositive={metrics.change30d >= 0}
          />
          {metrics.change1y !== null && (
            <MetricRow
              label="1y Change"
              value={`${metrics.change1y >= 0 ? '+' : ''}${metrics.change1y.toFixed(2)}%`}
              isPositive={metrics.change1y >= 0}
            />
          )}
        </div>
      </div>

      {/* Market Data */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Market Data</h3>
        <div>
          {metrics.marketCapRank && (
            <MetricRow label="Market Cap Rank" value={`#${metrics.marketCapRank}`} />
          )}
          <MetricRow label="Market Cap" value={formatCompact(metrics.marketCap)} />
          <MetricRow
            label="Market Cap Change (24h)"
            value={`${metrics.marketCapChangePercent24h >= 0 ? '+' : ''}${metrics.marketCapChangePercent24h.toFixed(2)}%`}
            isPositive={metrics.marketCapChangePercent24h >= 0}
          />
          {metrics.fullyDilutedValuation && (
            <MetricRow label="FDV" value={formatCompact(metrics.fullyDilutedValuation)} />
          )}
          <MetricRow label="24h Volume" value={formatCompact(metrics.volume24h)} />
          <MetricRow
            label="Volume / Market Cap"
            value={`${metrics.volumeToMarketCapRatio.toFixed(2)}%`}
            subtext={
              metrics.volumeToMarketCapRatio > 5
                ? 'High liquidity'
                : metrics.volumeToMarketCapRatio > 1
                ? 'Moderate liquidity'
                : 'Low liquidity'
            }
          />
        </div>
      </div>

      {/* Supply Information */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Supply</h3>
        <div>
          <MetricRow
            label="Circulating Supply"
            value={metrics.circulatingSupply.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          />
          {metrics.totalSupply && (
            <MetricRow
              label="Total Supply"
              value={metrics.totalSupply.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            />
          )}
          {metrics.maxSupply && (
            <MetricRow
              label="Max Supply"
              value={metrics.maxSupply.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            />
          )}
        </div>
      </div>

      {/* All-Time Highs and Lows */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Historical Extremes</h3>
        <div>
          <MetricRow
            label="All-Time High (ATH)"
            value={`$${formatPrice(metrics.ath)}`}
            subtext={`${metrics.athChangePercent >= 0 ? '+' : ''}${metrics.athChangePercent.toFixed(2)}% from ATH`}
            isPositive={metrics.athChangePercent >= 0}
          />
          <MetricRow
            label="All-Time Low (ATL)"
            value={`$${formatPrice(metrics.atl)}`}
            subtext={`${metrics.atlChangePercent >= 0 ? '+' : ''}${metrics.atlChangePercent.toFixed(2)}% from ATL`}
            isPositive={metrics.atlChangePercent >= 0}
          />
          {metrics.priceVolatility30d !== null && (
            <MetricRow
              label="Price Volatility (30d)"
              value={`${metrics.priceVolatility30d.toFixed(2)}%`}
              subtext={
                metrics.priceVolatility30d > 5
                  ? 'High volatility'
                  : metrics.priceVolatility30d > 2
                  ? 'Moderate volatility'
                  : 'Low volatility'
              }
            />
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-blue-500/5 p-6 border-blue-500/20">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Risk Indicators</p>
            <ul className="text-xs text-[var(--muted-text-color)] space-y-1">
              {metrics.volumeToMarketCapRatio < 1 && (
                <li>• Low trading volume relative to market cap - higher slippage risk</li>
              )}
              {metrics.priceVolatility30d && metrics.priceVolatility30d > 10 && (
                <li>• High price volatility - expect significant price swings</li>
              )}
              {metrics.marketCapRank && metrics.marketCapRank > 100 && (
                <li>• Lower market cap rank - smaller asset with higher risk</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinMetricsDetail;
