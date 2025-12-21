

import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[80vh]   flex items-center justify-center px-6 pb-16">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-semibold  text-blue-700/80 dark:text-blue-500 uppercase mb-2">
            Educational crypto simulator
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 ">
            Learn to trade crypto without risking real money.
          </h1>
          <p className="text-base md:text-lg  mb-6 max-w-xl">
            Block Finance lets you practise placing orders, managing a portfolio, and
            exploring the market using realistic data and a clean, usable interface.
            
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              className="btn btn-lg btn-primary"
              onClick={() => navigate('/Trade')}
            >
              Start trading
            </button>
            <button
              type="button"
              className="btn btn-lg btn-secondary"
              onClick={() => navigate('/Account')}
            >
              Log in / Sign up
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm ">
            <div>
              <p className="font-semibold ">Simulated</p>
              <p>No real funds or live orders are used.</p>
            </div>
            <div>
              <p className="font-semibold ">Guided</p>
              <p>Focus on concepts: orders, risk and P&amp;L.</p>
            </div>
            <div>
              <p className="font-semibold ">Beginner & Advanced Friendly</p>
              <p>Great for all skill-levels</p>
            </div>
          </div>
        </div>

        <div className="0 backdrop-blur rounded-2xl shadow-md p-6 md:p-8">
          <p className="text-sm font-medium mb-4">
            Quick overview
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="rounded-xl border border-slate-200 p-4 ">
              <p className="text-xs text-slate-500 mb-1">Practice balance</p>
              <p className="text-2xl font-semibold " >
                100,000<span className="text-xs text-slate-500 ml-1">USDT</span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 ">
              <p className="text-xs text-slate-500 mb-1">Pairs available</p>
              <p className="text-2xl font-semibold ">
                6+
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-black ">
              <p className="text-xs ">
                Risk-free learning
              </p>
              <p className="text-sm ">
                Place buys &amp; sells and watch how your positions change.
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-black ">
              <p className="text-xs ">
                Real-time data
              </p>
              <p className="text-sm ">
                Experience live market movements and trends.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            To get started, create an account, choose your skill level and then place a simulated trade on BTC/USDT or
            another pair of your choice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;