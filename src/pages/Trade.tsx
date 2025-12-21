import { useState } from 'react';
import { coinNameToTicker } from '../data/tickers';
import { useTrading } from '../context/TradingContext';
import { CandleStickChart } from '../Components/TradingChart';
import SearchBar from '../Components/SearchBar';
import { useFetchCoinMetrics } from '../utils/FetchCoinMetrics';
import { useFetchCryptoNews } from '../utils/FetchCryptoNews';
import NewsCard from '../Components/NewsCard';

type Side = 'buy' | 'sell';

const Trade = () => {
  const { state, buy, sell } = useTrading();

  // Core coin state is the CoinGecko-style name (e.g. "bitcoin")
  const [coinName, setCoinName] = useState<string>('bitcoin');
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const logoToken = import.meta.env.VITE_LOGO_API;
  const baseTicker = coinNameToTicker[coinName] ?? 'BTC';
  const selectedSymbol = `${baseTicker}USDT`;

  const { data: metrics, loading: metricsLoading, error: metricsError } =
    useFetchCoinMetrics(coinName);

  const { data: news, loading: newsLoading, error: newsError } =
    useFetchCryptoNews(coinName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !price || price <= 0) {
      setMessage('Enter a valid amount and price.');
      return;
    }

    const quantity = amount;
    const action = side === 'buy' ? buy : sell;
    const error = action({
      symbol: selectedSymbol,
      quantity,
      price,
    });

    if (error) {
      setMessage(error);
    } else {
      setMessage(
        `Simulated ${side === 'buy' ? 'buy' : 'sell'} order placed for ${quantity} ${
          selectedSymbol
        } at ${price.toFixed(2)}.`
      );
      setAmount(0);
    }
  };

  return (
    <div className="px-6 md:px-20 pb-10  mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: chart + positions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search bar to choose asset */}
        <div className="mb-1">
          <SearchBar
            Search={(value) => {
              setCoinName(value.toLowerCase());
              setMessage(null);
            }}
          />
        </div>

        <div className="rounded-2xl  shadow-sm border border-gray-200 p-4 md:p-5  dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className = "flex flex-row items-center gap-2">
            <img
            src={`https://img.logokit.com/crypto/${baseTicker}?token=${logoToken}`}
            alt={`${baseTicker} logo`}
            className="w-10 h-10 rounded-full shadow-md"
          />
              <h1 className="text-xl md:text-2xl font-semibold ">
                {coinName.charAt(0).toUpperCase() + coinName.slice(1)} ({baseTicker}/USDT)
              </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Simulated price action (no real trades are sent).
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Last price</p>
              <p className="text-lg font-semibold ">
                {metricsLoading || !metrics
                  ? '—'
                  : `$${metrics.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}`}
              </p>
              {metrics && (
                <p
                  className={`text-xs font-medium ${
                    metrics.change24h >= 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                >
                  {metrics.change24h >= 0 ? '▲' : '▼'}{' '}
                  {metrics.change24h.toFixed(2)}% (24h)
                </p>
              )}
            </div>
          </div>
          {/* Candle data uses CoinGecko-style name which is mapped to Binance ticker internally */}
          <CandleStickChart coin={coinName} />
        </div>

        {/* Coin metrics strip */}
        <div className="rounded-2xl  shadow-sm border border-gray-200 p-4 md:p-5  dark:border-gray-700">
          {metricsError && (
            <p className="text-xs text-red-500 mb-2">
              Metrics unavailable for this asset: {metricsError}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Market cap</p>
              <p className="font-semibold ">
                {metrics
                  ? `$${(metrics.marketCap / 1e9).toFixed(2)}B`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">24h volume</p>
              <p className="font-semibold ">
                {metrics
                  ? `$${(metrics.volume24h / 1e9).toFixed(2)}B`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">FDV</p>
              <p className="font-semibold ">
                {metrics?.fullyDilutedValuation
                  ? `$${(metrics.fullyDilutedValuation / 1e9).toFixed(2)}B`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Avg. buy price (you)</p>
              <p className="font-semibold ">
                {(() => {
                  const pos = state.positions.find((p) => p.symbol === selectedSymbol);
                  return pos ? `${pos.avgPrice.toFixed(2)} USDT` : '—';
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl  shadow-sm border border-gray-200 p-5 md:p-6  dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3 ">
            News
          </h2>


          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/*Shows a grid on screen with 3 coloumns on medium displays and above*/}
               {/* Iterates through a 3 indexed array and in each card displays "loading..." */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border rounded-xl border-gray-200 h-48 flex items-center justify-center text-xs text-gray-500  animate-pulse"
                >
                  Loading...
                </div>
              ))}
            </div>
          ) : newsError ? (
            
            <div className=" border rounded-xl  border-gray-200 p-4 text-sm text-gray-600 ">
              {/*Here, the error will be in red text*/}
              <p className="text-red-500 ">
                Unable to load news: {newsError}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* As in the loading state, it will return a grid with 3 columns*/}
              {/*The news will map over each of the 6 articles and pass the attributes of each article into the news card component*/}
              {news.map((article) => (
                <NewsCard
                  key={article.article_id}
                  title={article.title}
                  description={article.description || article.content}
                  link={article.link}
                  imageUrl={article.image_url}
                  pubDate={article.pubDate}
                  source={article.source_id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl  shadow-sm border border-gray-200 p-5 md:p-6  dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3 ">
            Simulated Positions
          </h2>
          {state.positions.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You do not have any simulated positions yet. Place a buy order to get
              started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                <thead className=" ">
                  <tr>
                    <th className="px-4 py-2 text-left ">Asset</th>
                    <th className="px-4 py-2 text-right ">Amount</th>
                    <th className="px-4 py-2 text-right ">Avg. Entry (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {state.positions.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2 ">{p.symbol}</td>
                      <td className="px-4 py-2 text-right ">
                        {p.quantity.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-right ">
                        {p.avgPrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right side: order ticket */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl  shadow-sm border border-gray-200 p-5 md:p-6  dark:border-gray-700 sticky top-24">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Practice balance:{' '}
            <span className="font-semibold ">
              {state.usdBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              USDT
            </span>
          </p>

          <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                side === 'buy'
                  ? ' '
                  : ''
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                side === 'sell'
                  ? ' '
                  : ''
              }`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium ">Market</label>
              <div className="border rounded-md px-3 py-2 text-sm  dark:border-gray-700 ">
                {baseTicker} / USDT
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium ">
                Amount ({selectedSymbol.replace('USDT', '')})
              </label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                step={0.0001}
                className="border rounded-md px-3 py-2   dark:border-gray-700 "
                placeholder="e.g. 0.01"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium ">Price (USDT)</label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={0.01}
                className="border rounded-md px-3 py-2   dark:border-gray-700 "
                placeholder={
                  metrics
                    ? `Current approx: ${metrics.price.toFixed(2)}`
                    : 'Enter a price'
                }
              />
            </div>

            {message && (
              <p className="text-xs text-gray-600 dark:text-gray-300">{message}</p>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: side === 'buy' ? '#16a34a' : '#dc2626',
                color: '#f9fafb',
                padding: '0.75rem 1.25rem',
                fontSize: '1rem',
                lineHeight: '1.5rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                fontWeight: '500',
                width: '100%',
                marginTop: '0.5rem',
                display: 'inline-block',
                textAlign: 'center' as const,
                fontFamily: 'inherit'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = side === 'buy' ? '#15803d' : '#b91c1c';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = side === 'buy' ? '#16a34a' : '#dc2626';
              }}
            >
              {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trade;