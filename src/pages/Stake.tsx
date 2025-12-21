import { useMemo, useState } from 'react';
import { useTrading } from '../context/TradingContext';

const Stake = () => {
  const { state, stake, completeStake } = useTrading();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [apy, setApy] = useState<number>(8);
  const [message, setMessage] = useState<string | null>(null);

  const stakeablePositions = useMemo(
    () => state.positions.filter((p) => p.quantity > 0),
    [state.positions]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSymbol) {
      setMessage('Choose a position to stake from.');
      return;
    }
    if (!amount || amount <= 0) {
      setMessage('Enter an amount to stake.');
      return;
    }
    const error = stake({
      symbol: selectedSymbol,
      fromPositionSymbol: selectedSymbol,
      quantity: amount,
      apy,
    });
    if (error) {
      setMessage(error);
    } else {
      setMessage('Stake created successfully.');
      setAmount(0);
    }
  };

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
            Stake
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Lock part of an existing position to earn simulated yield and understand how
            staking works.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
              Create a stake
            </h2>

            {stakeablePositions.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You don&apos;t have any positions yet. Buy some cryptocurrency on the
                Trade page before staking.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">From position</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="border rounded-md px-3 py-2 bg-white dark:bg-[#0f172a] dark:border-gray-700"
                  >
                    <option value="">Select a position</option>
                    {stakeablePositions.map((p) => (
                      <option key={p.id} value={p.symbol}>
                        {p.symbol} – {p.quantity.toFixed(4)} available
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Amount to stake</label>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    step={0.0001}
                    className="border rounded-md px-3 py-2 bg-white dark:bg-[#0f172a] dark:border-gray-700"
                    placeholder="e.g. 0.1"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This reduces the available amount in that position.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">APY (%)</label>
                  <input
                    type="number"
                    value={apy || ''}
                    onChange={(e) => setApy(Number(e.target.value))}
                    min={0}
                    step={0.1}
                    className="border rounded-md px-3 py-2 bg-white dark:bg-[#0f172a] dark:border-gray-700"
                    placeholder="e.g. 10"
                  />
                </div>

                {message && (
                  <p className="text-xs text-blue-600 dark:text-blue-300">{message}</p>
                )}

                <button type="submit" className="btn btn-md btn-primary w-full mt-2">
                  Start stake
                </button>
              </form>
            )}
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100">
            <h2 className="text-lg font-semibold mb-3">How staking works here</h2>
            <p className="mb-2">
              This simulator lets you move part of a position into a separate &quot;stake&quot;
              bucket. In a full implementation, rewards would accrue over time based on
              APY.
            </p>
            <p className="mb-2">
              When you complete a stake, the staked amount (plus any rewards you choose
              to simulate) is returned back into your positions.
            </p>
            <p className="text-xs opacity-80">
              For coursework you can describe how APY, lock periods and penalties would
              be calculated using backend logic or scheduled jobs.
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800 text-sm">
          <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
            Current stakes
          </h2>
          {state.stakes.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              You don&apos;t have any active stakes yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 dark:border-slate-800 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-2 text-left">Asset</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">APY %</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.stakes.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-4 py-2">{s.symbol}</td>
                      <td className="px-4 py-2 text-right">
                        {s.quantity.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-right">{s.apy.toFixed(1)}</td>
                      <td className="px-4 py-2 text-left capitalize">
                        {s.status.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {s.status === 'active' ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => completeStake(s.id)}
                          >
                            Complete stake
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Stake;


