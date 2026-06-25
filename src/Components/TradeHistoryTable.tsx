import { ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import type { Trade } from '../utils/FetchTradeHistory';

type TradeHistoryTableProps = {
  trades: Trade[];
  selectedFilter: 'all' | 'buy' | 'sell';
  onFilterChange: (filter: 'all' | 'buy' | 'sell') => void;
};

const TradeHistoryTable = ({
  trades,
  selectedFilter,
  onFilterChange,
}: TradeHistoryTableProps) => {
  const filteredTrades = trades.filter((trade) => {
    if (selectedFilter === 'all') return true;
    return trade.side.toLowerCase() === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Trade History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-[var(--muted-surface-color)] text-[var(--muted-text-color)] hover:bg-[var(--border-color)]'
            }`}
          >
            <Filter size={14} />
            All
          </button>
          <button
            onClick={() => onFilterChange('buy')}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'buy'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-[var(--muted-surface-color)] text-[var(--muted-text-color)] hover:bg-[var(--border-color)]'
            }`}
          >
            <ArrowDownLeft size={14} />
            Buys
          </button>
          <button
            onClick={() => onFilterChange('sell')}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'sell'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-[var(--muted-surface-color)] text-[var(--muted-text-color)] hover:bg-[var(--border-color)]'
            }`}
          >
            <ArrowUpRight size={14} />
            Sells
          </button>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted-text-color)]">No trades found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-4 py-3 text-[var(--muted-text-color)]">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted-text-color)]">
                  Asset
                </th>
                <th className="text-right px-4 py-3 text-[var(--muted-text-color)]">
                  Quantity
                </th>
                <th className="text-right px-4 py-3 text-[var(--muted-text-color)]">
                  Price
                </th>
                <th className="text-right px-4 py-3 text-[var(--muted-text-color)]">
                  Total Value
                </th>
                <th className="text-right px-4 py-3 text-[var(--muted-text-color)]">
                  Fee
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted-text-color)]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, index) => (
                <tr
                  key={`${trade.tradeid}-${index}`}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--muted-surface-color)]/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                        trade.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {trade.side === 'BUY' ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                      {trade.side}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{trade.ticker}</td>
                  <td className="text-right px-4 py-3">
                    {formatPrice(trade.quantity)}
                  </td>
                  <td className="text-right px-4 py-3">
                    ${formatPrice(trade.price)}
                  </td>
                  <td className="text-right px-4 py-3 font-medium">
                    ${formatPrice(trade.usdvalue)}
                  </td>
                  <td className="text-right px-4 py-3 text-red-400">
                    -${formatPrice(trade.fee)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-text-color)]">
                    {formatDate(trade.createdate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-[var(--muted-text-color)]">
        Showing {filteredTrades.length} of {trades.length} trades
      </div>
    </div>
  );
};

export default TradeHistoryTable;
