import CryptoChart from '../Components/CryptoChart';

const Dashboard = () => {
  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold ">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[var(--muted-text-color)] max-w-2xl">
            Monitor the market and keep an eye on key pairs before you place a simulated
            order.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
            <p className="text-xs text-[var(--muted-text-color)] mb-1">Total practice balance</p>
            <p className="text-2xl font-semibold ">
              100,000 <span className="text-xs text-[var(--muted-text-color)] ml-1">USDT</span>
            </p>
            <p className="text-xs text-[var(--muted-text-color)] mt-2">
              Starting balance used across your simulated account.
            </p>
          </div>
          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
            <p className="text-xs text-[var(--muted-text-color)] mb-1">Open simulated positions</p>
            <p className="text-2xl font-semibold ">
              0
            </p>
            <p className="text-xs text-[var(--muted-text-color)] mt-2">
              Once you place trades, you could surface them here.
            </p>
          </div>
          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
            <p className="text-xs text-[var(--muted-text-color)] mb-1">Focus pairs</p>
            <p className="text-2xl font-semibold ">
              BTC / ETH / SOL
            </p>
            <p className="text-xs text-[var(--muted-text-color)] mt-2">
              Core pairs for demonstrating volatility and risk.
            </p>
          </div>
        </section>

        <section className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-4 md:p-6">
          <p className="text-sm font-medium text-[var(--muted-text-color)] mb-4">
            Market overview
          </p>
          <CryptoChart />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

