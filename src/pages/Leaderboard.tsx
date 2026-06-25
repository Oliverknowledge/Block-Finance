import { useEffect, useState } from 'react';
import Button from '../Components/Button';
import { useAuth } from '../hooks/useAuth';
import fetchLeaderboardData, {
  buildLeaderboardRows,
  type LeaderboardRow,
  type LeaderboardUser,
} from '../utils/leaderboardUtils';

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

type Metric = 'xp' | 'PnL';
type Timeframe = '7d' | 'all-time';

const scoreLabel = (metric: Metric, timeframe: Timeframe) => {
  if (metric === 'xp') {
    return timeframe === '7d' ? 'XP (7D)' : 'XP (All-time)';
  }
  return timeframe === '7d' ? 'PnL (7D)' : 'PnL (All-time)';
};

const portfolioWalletName = (row: LeaderboardRow, timeframe: Timeframe) =>
  timeframe === '7d' ? row.portfolio7dWalletName : row.portfolioAllTimeWalletName;

const formatLeaderboardScore = (score: number, metric: Metric) => {
  if (metric === 'xp') {
    return Math.round(score).toLocaleString();
  }

  const formattedValue = `$${formatCurrency(Math.abs(score))}`;
  return score >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
};

const Leaderboard = () => {
  const { user } = useAuth();

  const [metric, setMetric] = useState<Metric>('PnL');
  const [timeframe, setTimeframe] = useState<Timeframe>('all-time');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');

    fetchLeaderboardData()
      .then((nextUsers) => {
        setUsers(nextUsers);
      })
      .catch((error) => {
        const fallback = error instanceof Error ? error.message : 'Unable to load leaderboard right now.';
        setErrorMessage(fallback);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rows = buildLeaderboardRows(users, metric, timeframe);
  const topRows = rows.slice(0, 10);
  const top3 = rows.slice(0, 3);
  const myRow = user ? rows.find((row) => row.userId === user.id) ?? null : null;
  const topPerformer = rows[0] ?? null;
  const totalPlayers = rows.length;
  const averageScore = totalPlayers
    ? rows.reduce((sum, row) => sum + row.score, 0) / totalPlayers
    : 0;

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-color)] shadow-soft">
            Leaderboard
          </div>
          <div className="space-y-2">
            <h1 className="page-title">Market Leaderboard</h1>
            <p className="text-body max-w-3xl text-sm md:text-base">
              Track the most active crypto traders and portfolio builders in real time. Filter by XP or portfolio performance, then compare 7-day and all-time rankings.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="leaderboard-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Leaderboard filters</p>
                <h2 className="mt-2 text-2xl font-semibold">View the latest rankings</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={metric === 'xp' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setMetric('xp')}
                >
                  XP
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={metric === 'PnL' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setMetric('PnL')}
                >
                  Portfolio
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={timeframe === '7d' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setTimeframe('7d')}
                >
                  7D
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={timeframe === 'all-time' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setTimeframe('all-time')}
                >
                  All-time
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Top score</p>
                <p className="mt-2 text-2xl font-semibold">{topPerformer ? formatLeaderboardScore(topPerformer.score, metric) : '—'}</p>
                <p className="mt-1 text-sm text-[var(--muted-text-color)]">Best performer this view</p>
              </div>
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Players</p>
                <p className="mt-2 text-2xl font-semibold">{totalPlayers}</p>
                <p className="mt-1 text-sm text-[var(--muted-text-color)]">Active leaderboard accounts</p>
              </div>
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Average score</p>
                <p className="mt-2 text-2xl font-semibold">{formatLeaderboardScore(averageScore, metric)}</p>
                <p className="mt-1 text-sm text-[var(--muted-text-color)]">Mean score for this leaderboard</p>
              </div>
            </div>
          </div>

          <div className="leaderboard-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Your standing</p>
            {myRow ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[2rem] bg-[var(--brand-soft)] p-4 shadow-soft">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-color)]">Rank</p>
                  <p className="mt-2 text-4xl font-semibold">#{myRow.rank}</p>
                  <p className="mt-1 text-sm text-[var(--muted-text-color)]">{myRow.username}</p>
                </div>
                <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-text-color)]">Current score</p>
                  <p className="mt-2 text-3xl font-semibold">{formatLeaderboardScore(myRow.score, metric)}</p>
                  {metric === 'PnL' && (
                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">Wallet: {portfolioWalletName(myRow, timeframe) || 'No wallet created'}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted-text-color)]">Sign in and start trading to appear in the leaderboard and unlock your full profile view.</p>
            )}
          </div>
        </section>

        <section className="leaderboard-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top 3 Podium</h2>
              <p className="text-sm text-[var(--muted-text-color)]">The strongest traders for this filter.</p>
            </div>
            <div className="hidden md:block text-sm text-[var(--muted-text-color)]">Swipe horizontally on mobile to see the whole board.</div>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {top3.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 text-center text-sm text-[var(--muted-text-color)] w-full">
                No leaderboard entries yet.
              </div>
            ) : (
              top3.map((row, index) => (
                <div key={row.userId} className="min-w-[12rem] flex-1 rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-text-color)]">#{row.rank}</p>
                      <p className="mt-2 text-xl font-semibold leading-tight">{row.username}</p>
                    </div>
                    <div className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-color)]">Top {index + 1}</div>
                  </div>
                  <div className="mt-4 rounded-3xl bg-[var(--muted-surface-color)] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-text-color)]">Score</p>
                    <p className="mt-2 text-2xl font-semibold">{formatLeaderboardScore(row.score, metric)}</p>
                  </div>
                  {metric === 'PnL' && (
                    <p className="mt-4 text-sm text-[var(--muted-text-color)]">Wallet: {portfolioWalletName(row, timeframe) || 'No wallet'}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="leaderboard-card p-5">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-xl font-semibold">Leaderboard table</h2>
              <p className="text-sm text-[var(--muted-text-color)]">The top 10 ranked players for your chosen view.</p>
            </div>
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted-text-color)]">{scoreLabel(metric, timeframe)}</div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl bg-[var(--muted-surface-color)] p-6 text-sm text-[var(--muted-text-color)]">Loading leaderboard...</div>
          ) : errorMessage !== '' ? (
            <div className="mt-6 rounded-3xl bg-[var(--surface-color)] p-6 text-sm text-red-600">{errorMessage}</div>
          ) : topRows.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-[var(--muted-surface-color)] p-6 text-sm text-[var(--muted-text-color)]">No leaderboard data yet.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.16em] text-[var(--muted-text-color)]">
                    <th className="py-3 pr-4">Rank</th>
                    <th className="py-3 pr-4">Player</th>
                    <th className="py-3 pr-4">Details</th>
                    <th className="py-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map((row) => {
                    const isCurrentUser = user?.id === row.userId;
                    return (
                      <tr
                        key={row.userId}
                        className={`border-t border-[var(--border-color)] ${isCurrentUser ? 'bg-[var(--brand-soft)]' : ''}`}
                      >
                        <td className="py-4 pr-4 font-semibold">#{row.rank}</td>
                        <td className="py-4 pr-4">
                          <p className="font-semibold">{row.username}{isCurrentUser ? ' (You)' : ''}</p>
                          {row.email && <p className="text-xs text-[var(--muted-text-color)]">{row.email}</p>}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="space-y-1 text-xs text-[var(--muted-text-color)]">
                            {metric === 'PnL' ? (
                              <>
                                <p>Wallet: {portfolioWalletName(row, timeframe) || 'No wallet'}</p>
                                <p>Ranked score type: {scoreLabel(metric, timeframe)}</p>
                              </>
                            ) : (
                              <p>XP All-time: {row.xpAllTime ?? 0}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right font-semibold">
                          <span className={row.score >= 0 ? 'text-green-600' : 'text-red-600'}>{formatLeaderboardScore(row.score, metric)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;
