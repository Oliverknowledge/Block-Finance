import CryptoChart from '../Components/CryptoChart';

const Dashboard = () => {
  return (
    <div className="px-6 md:px-10 py-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-3 mb-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[var(--brand-color)] shadow-sm ring-1 ring-[var(--brand-glow)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
            Live market pulse and performance insights
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[var(--muted-text-color)] max-w-2xl">
            Monitor top crypto pairs, review your simulated balance, and get quick market signals.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
          {[
            {
              label: 'Practice balance',
              value: '100,000 USDT',
              description: 'Your simulated account equity.',
              accent: 'from-blue-500 to-indigo-500',
            },
            {
              label: 'Open positions',
              value: '0',
              description: 'Track your current simulated trades.',
              accent: 'from-emerald-500 to-teal-500',
            },
            {
              label: 'Focus pairs',
              value: 'BTC / ETH / SOL',
              description: 'Assets with the highest volatility.',
              accent: 'from-purple-500 to-fuchsia-500',
            },
          ].map((card) => (
            <div key={card.label} className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
              <div className="inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white shadow-sm" style={{ backgroundImage: `linear-gradient(135deg, var(--${card.accent}), rgba(255,255,255,0.08))` }}>
                {card.label}
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-3 text-xs text-[var(--muted-text-color)]">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-8 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted-text-color)]">
                Market overview
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-text-color)] max-w-xl">
                Explore a live chart and compare top cryptocurrencies before you place your next simulated order.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-[var(--muted-surface-color)] px-4 py-2 text-xs text-[var(--muted-text-color)]">
              Updated continuously
            </div>
          </div>
          <CryptoChart />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

