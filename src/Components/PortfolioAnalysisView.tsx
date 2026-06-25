import { TrendingUp, Shield, BookOpen, AlertCircle } from 'lucide-react';
import type { PortfolioAnalysis } from '../utils/PortfolioAnalyzer';

type PortfolioAnalysisViewProps = {
  analysis: PortfolioAnalysis;
};

const PortfolioAnalysisView = ({ analysis }: PortfolioAnalysisViewProps) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-emerald-400';
    if (risk <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return 'Low Risk';
    if (risk <= 6) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-[var(--muted-text-color)] tracking-wider">
              Total Invested
            </p>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <p className="text-xl font-semibold">${formatCurrency(analysis.totalInvested)}</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-[var(--muted-text-color)] tracking-wider">
              Current Value
            </p>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-semibold">${formatCurrency(analysis.currentValue)}</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-[var(--muted-text-color)] tracking-wider">
              Total Return
            </p>
            <TrendingUp
              size={16}
              className={analysis.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
          </div>
          <p
            className={`text-xl font-semibold ${
              analysis.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            ${formatCurrency(analysis.totalReturn)} ({analysis.returnPercent.toFixed(2)}%)
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-[var(--muted-text-color)] tracking-wider">
              Risk Score
            </p>
            <Shield size={16} className={getRiskColor(analysis.riskScore)} />
          </div>
          <p className={`text-xl font-semibold ${getRiskColor(analysis.riskScore)}`}>
            {analysis.riskScore}/10
          </p>
          <p className={`text-xs ${getRiskColor(analysis.riskScore)}`}>
            {getRiskLabel(analysis.riskScore)}
          </p>
        </div>
      </div>

      {/* Diversification & Composition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Diversification Score
            </h3>
          </div>
          <div className="mb-3">
            <div className="h-3 rounded-full bg-[var(--muted-surface-color)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                style={{ width: `${analysis.diversification}%` }}
              />
            </div>
          </div>
          <p className="text-2xl font-semibold mb-1">{analysis.diversification}%</p>
          <p className="text-xs text-[var(--muted-text-color)]">
            {analysis.diversification > 70
              ? 'Well diversified portfolio'
              : analysis.diversification > 40
              ? 'Moderate diversification'
              : 'Low diversification - consider diversifying'}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Largest Position
            </h3>
          </div>
          {analysis.largestPosition ? (
            <div className="space-y-2">
              <p className="text-2xl font-semibold">{analysis.largestPosition.ticker}</p>
              <p className="text-sm text-[var(--muted-text-color)]">
                {analysis.largestPosition.portfolioWeight.toFixed(1)}% of portfolio
              </p>
              <div className="pt-2 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--muted-text-color)] mb-1">
                  {analysis.largestPosition.riskLevel === 'high'
                    ? '⚠️ High concentration risk'
                    : 'Reasonable position size'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[var(--muted-text-color)]">No positions</p>
          )}
        </div>
      </div>

      {/* Position Details */}
      {analysis.positions.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Position Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-3 py-2 text-[var(--muted-text-color)]">Asset</th>
                  <th className="text-right px-3 py-2 text-[var(--muted-text-color)]">
                    Quantity
                  </th>
                  <th className="text-right px-3 py-2 text-[var(--muted-text-color)]">
                    Value
                  </th>
                  <th className="text-right px-3 py-2 text-[var(--muted-text-color)]">
                    Return %
                  </th>
                  <th className="text-right px-3 py-2 text-[var(--muted-text-color)]">
                    Portfolio %
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.positions.map((position, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--muted-surface-color)]/30"
                  >
                    <td className="px-3 py-2 font-medium">{position.ticker}</td>
                    <td className="text-right px-3 py-2">
                      {position.quantity.toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                      })}
                    </td>
                    <td className="text-right px-3 py-2">
                      ${formatCurrency(position.currentValue)}
                    </td>
                    <td
                      className={`text-right px-3 py-2 font-medium ${
                        position.returnPercent >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {position.returnPercent >= 0 ? '+' : ''}
                      {position.returnPercent.toFixed(2)}%
                    </td>
                    <td className="text-right px-3 py-2">
                      {position.portfolioWeight.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
          Risk Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted-text-color)] mb-1">High Risk Positions</p>
            <p className="text-2xl font-semibold">
              {analysis.positions.filter((p) => p.riskLevel === 'high').length}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-text-color)] mb-1">Losing Positions</p>
            <p className="text-2xl font-semibold text-red-400">
              {analysis.positions.filter((p) => p.unrealizedPnL < 0).length}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-text-color)] mb-1">Total Positions</p>
            <p className="text-2xl font-semibold">{analysis.positions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysisView;
