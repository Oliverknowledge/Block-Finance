const Leaderboard = () => {
  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
            Leaderboard
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            A conceptual ranking of users based on their simulated performance.
          </p>
        </header>

        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
            Example leaderboard layout
          </h2>
          <p className="text-sm text-slate-600 mb-4 dark:text-slate-300">
            Once trades and portfolio values are stored in Supabase, you could calculate
            each user&apos;s total return and rank them here.
          </p>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    User
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Return
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    1
                  </td>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    alice@example.com
                  </td>
                  <td className="px-4 py-3 text-right border-t border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                    +12.4%
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    2
                  </td>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    bob@example.com
                  </td>
                  <td className="px-4 py-3 text-right border-t border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                    +7.8%
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    3
                  </td>
                  <td className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    charlie@example.com
                  </td>
                  <td className="px-4 py-3 text-right border-t border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400">
                    -2.1%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          For your write‑up, you can describe how ranking could be based on total return,
          risk-adjusted return, or other performance indicators stored in your database.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;


