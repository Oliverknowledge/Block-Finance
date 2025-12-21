import { useMemo, useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { useAuth } from '../context/AuthContext';

type Wallet = {
  id: string;
  name: string;
  changePct: number;
};

const Portfolio = () => {
  const { state } = useTrading();
  const { user, signOut } = useAuth();

  const totals = useMemo(() => {
    const invested = state.positions.reduce(
      (sum, p) => sum + p.quantity * p.avgPrice,
      0
    );
    const stakedApprox = state.stakes.reduce(
      (sum, s) => sum + s.quantity * 1,
      0
    );
    const equity = state.usdBalance + invested + stakedApprox;
    return { equity };
  }, [state.positions, state.stakes, state.usdBalance]);

  const [wallets, setWallets] = useState<Wallet[]>([
    { id: '1', name: 'Wallet 1', changePct: -10 },
    { id: '2', name: 'Test short-term', changePct: 50 },
    { id: '3', name: 'Best wallet', changePct: 150 },
    { id: '4', name: 'Long-term', changePct: 6 },
  ]);

  const totalXp = useMemo(
    () => state.trades.length * 10 + 750,
    [state.trades.length]
  );

  const handleDelete = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const displayName = user?.email?.split('@')[0] ?? 'Oliver';

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Sub navigation bar like sketch */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex gap-6 text-sm">
            <button className="text-slate-600 dark:text-slate-300">Dashboard</button>
            <button className="text-slate-600 dark:text-slate-300">Progress</button>
            <button className="text-slate-600 dark:text-slate-300">Settings</button>
            <button className="text-blue-700 font-semibold border-b-2 border-blue-600 pb-1 dark:text-blue-300">
              Wallet dashboard
            </button>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn btn-sm btn-red"
          >
            Log out
          </button>
        </div>

        {/* Greeting and XP */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
            Hi, {displayName},
          </h1>
          <div className="rounded-xl bg-white shadow-sm border border-slate-200 px-4 py-2 text-sm dark:bg-slate-900 dark:border-slate-800">
            <span className="font-semibold">Total XP:</span>{' '}
            <span className="ml-1">{totalXp}</span>
          </div>
        </div>

        {/* Wallet list */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4 space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Wallets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice equity: {totals.equity.toFixed(2)} USDT
            </p>
          </div>

          {wallets.map((wallet) => {
            const positive = wallet.changePct >= 0;
            return (
              <div
                key={wallet.id}
                className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 dark:border-slate-700"
              >
                <span className="text-sm md:text-base text-slate-900 dark:text-slate-50">
                  {wallet.name}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                      positive
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {positive ? '↑' : '↓'}
                    {Math.abs(wallet.changePct)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(wallet.id)}
                    className="btn btn-sm btn-secondary"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Portfolio;


