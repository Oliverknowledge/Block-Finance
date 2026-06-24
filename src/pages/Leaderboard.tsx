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
  const myRow = user ? rows.find((row) => row.userId === user.id) ?? null : null;
  const topRows = rows.slice(0, 10);
  const topPerformer = rows[0] ?? null;

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Leaderboard</h1>
          <p className="text-sm md:text-base max-w-2xl">
            Compare users by XP and portfolio performance across 7D and all-time rankings.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 md:p-5 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase ">Main Filter</p>
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
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase ">Timeframe</p>
              <div className="flex flex-wrap gap-2">
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

          </div>

        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
            <p className="text-xs uppercase ">Your Position</p>
            {myRow ? (
              <>
                <p className="mt-2 text-2xl font-semibold">#{myRow.rank}</p>
                <p className="mt-1 text-sm">{scoreLabel(metric, timeframe)}</p>
                <p className="text-lg font-medium mt-1">
                  {metric === 'xp' ? (
                    <span>{Math.round(myRow.score).toLocaleString()}</span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 ${
                        myRow.score >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      <span>{myRow.score >= 0 ? '↑' : '↓'}</span>
                      <span>{`${myRow.score >= 0 ? '+' : '-'}$${formatCurrency(Math.abs(myRow.score))}`}</span>
                    </span>
                  )}
                </p>
                {metric === 'PnL' && portfolioWalletName(myRow, timeframe) !== '' && (
                  <p className="text-xs mt-1">
                    Best wallet: {portfolioWalletName(myRow, timeframe)}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm">Sign in and start trading to appear in the leaderboard.</p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
            <p className="text-xs uppercase ">Top Performer</p>
            {topPerformer ? (
              <>
                <p className="mt-2 text-xl font-semibold">{topPerformer.username}</p>
                <p className="mt-1 text-sm">{scoreLabel(metric, timeframe)}</p>
                <p className="text-lg font-medium mt-1">
                  {metric === 'xp' ? (
                    <span>{Math.round(topPerformer.score).toLocaleString()}</span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 ${
                        topPerformer.score >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      <span>{topPerformer.score >= 0 ? '↑' : '↓'}</span>
                      <span>{`${topPerformer.score >= 0 ? '+' : '-'}$${formatCurrency(Math.abs(topPerformer.score))}`}</span>
                    </span>
                  )}
                </p>
                {metric === 'PnL' && portfolioWalletName(topPerformer, timeframe) !== '' && (
                  <p className="text-xs mt-1">
                    Wallet: {portfolioWalletName(topPerformer, timeframe)}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm">No users found yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Top Performers</h2>
            <p className="text-xs">{scoreLabel(metric, timeframe)}</p>
          </div>

          {loading ? (
            <p className="text-sm">Loading leaderboard...</p>
          ) : errorMessage !== '' ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : topRows.length === 0 ? (
            <p className="text-sm">No leaderboard data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase ">
                    <th className="py-2 pr-3">Rank</th>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 text-right">{scoreLabel(metric, timeframe)}</th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map((row) => {
                    const isCurrentUser = user?.id === row.userId;
                    return (
                      <tr
                        key={row.userId}
                        className={`border-t border-[var(--border-color)] ${
                          isCurrentUser ? 'bg-gray-200/60' : ''
                        }`}
                      >
                        <td className="py-3 pr-3 font-medium">#{row.rank}</td>
                        <td className="py-3 pr-3">
                          <p className={`font-medium ${isCurrentUser ? 'text-gray-800' : ''}`}>
                            {row.username}
                            {isCurrentUser ? ' (You)' : ''}
                          </p>
                          {metric === 'PnL'  && (
                            <p className="text-xs">
                              Wallet: {portfolioWalletName(row, timeframe) ? portfolioWalletName(row,timeframe) : "No wallet created"}
                            </p>
                          )}
                          {row.email !== '' && <p className="text-xs">{row.email}</p>}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {metric === 'xp' ? (
                            <span>{Math.round(row.score).toLocaleString()}</span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                row.score >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              <span>{row.score >= 0 ? '↑' : '↓'}</span>
                              <span>{`${row.score >= 0 ? '+' : '-'}$${formatCurrency(Math.abs(row.score))}`}</span>
                            </span>
                          )}
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
