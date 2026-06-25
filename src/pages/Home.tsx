
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleStartTrading = () => {
    navigate('/Trade');
  }

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center px-6 py-12 pb-16">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[var(--brand-color)] shadow-sm ring-1 ring-[var(--brand-glow)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
            Simulated learning with real market insights
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-[var(--primary-text-color)]">
            Trade smarter, learn faster, and grow your confidence in crypto.
          </h1>
          <p className="text-base md:text-lg text-[var(--muted-text-color)] max-w-xl leading-relaxed">
            Block Finance is a polished simulated trading experience that helps beginners and advanced users practise orders, manage portfolios, and explore market signals.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="btn btn-lg btn-primary"
              onClick={handleStartTrading}
            >
              Start Trading
            </button>
            <button
              type="button"
              className="btn btn-lg btn-secondary"
              onClick={() => navigate('/Account')}
            >
              Log In / Sign Up
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Simulated', value: 'No real funds used' },
              { label: 'Guided', value: 'Learn orders, risk and P&L' },
              { label: 'Inclusive', value: 'Designed for all experience levels' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 shadow-sm">
                <p className="font-semibold mb-1">{item.label}</p>
                <p className="text-[var(--muted-text-color)] text-xs">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-8 shadow-soft backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text-color)]">
                Quick Overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Your simulated trading dashboard</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              100k USDT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Practice balance', value: '100,000 USDT' },
              { title: 'Pairs available', value: '6+' },
              { title: 'Risk free', value: 'Simulated cash only' },
              { title: 'Live vibes', value: 'Real market data' },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-5 transition hover:border-blue-300/70 hover:shadow-md">
                <p className="text-xs text-[var(--muted-text-color)] uppercase tracking-[0.18em] mb-3">{card.title}</p>
                <p className="font-semibold text-lg">{card.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--muted-text-color)] leading-relaxed">
            Create an account, choose your strategy, and start building confidence by trading top crypto pairs in a safe environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
