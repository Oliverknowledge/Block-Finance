  import { useEffect, useState } from 'react';
  import { coinNameToTicker } from '../data/tickers';
  import { TradingViewChart, type ChartMode } from '../Components/TradingChart';
import SearchBar from '../Components/SearchBar';
import { useFetchCoinMetrics } from '../utils/FetchCoinMetrics';
import { useFetchCryptoNews } from '../utils/FetchCryptoNews';
import NewsCard from '../Components/NewsCard';
import Button from '../Components/Button';
import fetchWalletUSDTBalance from '../utils/FetchWalletUSDTBalance';
import { useAuth } from '../hooks/useAuth';
import placeMarketBuy from '../utils/actions/placeMarketBuy';
import placeMarketSell from '../utils/actions/placeMarketSell';
import fetchWalletHolding from '../utils/FetchWalletHolding';
import IncrementXP from '../utils/IncrementXP';
import fetchUserLevel, { type UserExperienceLevel } from '../utils/fetchUserLevel';

import type { wallet } from '../types/Wallet';

  type Side = 'buy' | 'sell';
  type NoticeType = '' | 'Success' | 'Error';
  type TradePosition = {
    availableqty: number;
    avgcost: number;
  };

  const Trade = () => {
    const { user } = useAuth();
    const [USD, setUSD ] = useState(0);
    const [percentage, setPercentage] = useState('');
    const [coinName, setCoinName] = useState('bitcoin');
    const [side, setSide] = useState<Side>('buy');
    const logoToken = import.meta.env.VITE_LOGO_API;
    const baseTicker = coinNameToTicker[coinName] ?? 'BTC';
    const [wallets, setWallets] = useState<wallet[]>([]);
  const [selectedWalletID, setSelectedWalletID] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<NoticeType>('');
  const [binanceLastPrice, setBinanceLastPrice] = useState<number | null>(null);
  const [binanceChange24h, setBinanceChange24h] = useState<number | null>(null);
  const [position, setPosition] = useState<TradePosition | null>(null);
  const [userLevel, setUserLevel] = useState<UserExperienceLevel>('beginner');
  const [chartMode, setChartMode] = useState<ChartMode>('line');
    
        
    useEffect(() => {
      async function fetchWallets() {
        const nextWallets = await fetchWalletUSDTBalance(user);
        setWallets(nextWallets);
        if (nextWallets.length > 0) {
          setSelectedWalletID(String(nextWallets[0].walletid));
        } else {
          setSelectedWalletID('');
          setPosition(null);
        }
      }
      fetchWallets();
      }, [user]);

    useEffect(() => {
      fetchUserLevel(user).then((level) => setUserLevel(level));
    }, [user]);

    useEffect(() => {
      if (userLevel === 'beginner') {
        setChartMode('line');
      }
    }, [userLevel]);


    
    const { data: metrics, error: metricsError } =
      useFetchCoinMetrics(coinName);
    const { data: news, loading: newsLoading, error: newsError } =
      useFetchCryptoNews(coinName);

    const showMessage = (type: Exclude<NoticeType, ''>, text: string) => {
      setMessageType(type);
      setMessageText(text);
    };

    const clearMessage = () => {
      setMessageType('');
      setMessageText('');
    };

    const handleMarketDataChange = (marketData: {
      lastPrice: number | null;
      change24h: number | null;
    }) => {
      setBinanceLastPrice(marketData.lastPrice);
      setBinanceChange24h(marketData.change24h);
    };

    const tradePrice = binanceLastPrice ?? 0;

    const refreshWalletAndPosition = async () => {
      const latestWallets = await fetchWalletUSDTBalance(user!);
      setWallets(latestWallets);

      const walletToUse = selectedWalletID || String(latestWallets[0]?.walletid || '');
      setSelectedWalletID(walletToUse);
      const latestPosition = await fetchWalletHolding(walletToUse, baseTicker);
      setPosition(latestPosition);
    };

    const syncAfterTrade = async () => {
      await IncrementXP(user!, 10);
      await refreshWalletAndPosition();
      return null;
    };

    const executeBuy =  async () => {
      setLoading(true);
      
      try {
        const res = await placeMarketBuy(selectedWalletID, baseTicker, USD, tradePrice);

        if (!res) {
          showMessage('Error', 'Insufficient funds in wallet');
          return;
        }

        showMessage(
          'Success',
          `Successfully placed market buy for $${USD.toFixed(2)} of ${baseTicker} at $${tradePrice.toFixed(2)}`
        );
        await syncAfterTrade();
      } finally {
        setLoading(false);
      }
    };
    const executeSell = async () => {
      setLoading(true);

      try {
        const res = await placeMarketSell(
          selectedWalletID,
          baseTicker,
          USD / tradePrice,
          tradePrice
        );

        if (!res) {
          showMessage('Error', 'Insufficient asset quantity in wallet');
          return;
        }

        showMessage(
          'Success',
          `Successfully placed market sell for $${USD.toFixed(2)} of ${baseTicker} at $${tradePrice.toFixed(2)}`
        );
        await syncAfterTrade();
      } finally {
        setLoading(false);
      }
    };

    const handleBuy = (e: React.FormEvent) => {
      e.preventDefault();
      if (isInvalidTradeAmount) {
        return;
      }
      void executeBuy();
    };
    const handleSell = (e: React.FormEvent) => {
      e.preventDefault();
      if (isInvalidTradeAmount) {
        return;
      }
      void executeSell();
    };

    useEffect(() => {
      fetchWalletHolding(selectedWalletID, baseTicker)
        .then(setPosition);
    }, [selectedWalletID, baseTicker]);

const activePosition = position && position.availableqty > 0 ? position : null;
const currentPrice = binanceLastPrice ?? (activePosition ? activePosition.avgcost : 0);

const positionValue = activePosition ? activePosition.availableqty * currentPrice : 0;
const unrealizedPnL = activePosition
  ? (currentPrice - activePosition.avgcost) * activePosition.availableqty
  : 0;
const pnlPercent = activePosition && activePosition.avgcost > 0
  ? ((currentPrice - activePosition.avgcost) / activePosition.avgcost) * 100
  : 0;

const selectedWallet = wallets.find((wallet) => String(wallet.walletid) === String(selectedWalletID));
const showBeginnerTooltips = userLevel === 'beginner';
const whatIfScenarios = [-30, 20, 50];
const showWhatIfBox = showBeginnerTooltips && activePosition;
let MaxTradeUSD = 0;
if (side === 'buy') {
  MaxTradeUSD = selectedWallet?.usdt_balance ?? 0;
} else if (activePosition) {
  MaxTradeUSD = activePosition.availableqty * currentPrice;
}

const setUSDFromAmount = (nextUSD: number) => {
  setUSD(nextUSD)
  const nextPercent = (nextUSD / MaxTradeUSD * 100);
  setPercentage(nextPercent.toFixed(2));
};

const setUSDFromPercent = (nextPercent: number) => {
  setPercentage(nextPercent.toFixed(2));
  setUSD((MaxTradeUSD * nextPercent) / 100);
};
const isInvalidTradeAmount = USD <= 0 || tradePrice <= 0;

    return (
      <div className="px-6 md:px-10 py-8 pb-12 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 space-y-7">

          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-7 shadow-soft">
            <div className="flex flex-col gap-6 md:items-center md:flex-row md:justify-between mb-5">
              <div className="flex items-center gap-4">
                <img
                  src={`https://img.logokit.com/crypto/${baseTicker}?token=${logoToken}`}
                  alt={`${baseTicker} logo`}
                  className="w-14 h-14 rounded-3xl shadow-sm"
                />
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {coinName.charAt(0).toUpperCase() + coinName.slice(1)}
                  </h2>
                  <p className="text-sm text-[var(--muted-text-color)]">{baseTicker}/USDT</p>
                </div>
              </div>

              <div className="w-full max-w-xs">
                <SearchBar
                  Search={(value) => {
                    setCoinName(value.toLowerCase());
                  }}
                />
              </div>

              <div className="rounded-3xl bg-[var(--muted-surface-color)] px-5 py-4 text-right shadow-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--muted-text-color)]">Last price</p>
                <p className="mt-2 text-2xl font-semibold">
                  {binanceLastPrice === null
                    ? '—'
                    : `$${binanceLastPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}`}
                </p>
                {binanceChange24h !== null && (
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      binanceChange24h >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {binanceChange24h >= 0 ? '↑' : '↓'} {binanceChange24h.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>

            {!showBeginnerTooltips && (
              <div className="mb-5 flex flex-wrap gap-3 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant={chartMode === 'line' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setChartMode('line')}
                >
                  Line
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartMode === 'candlestick' ? 'primary' : 'secondary'}
                  className="!m-0"
                  onClick={() => setChartMode('candlestick')}
                >
                  Candles
                </Button>
              </div>
            )}

            <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4 shadow-sm mb-6">
              <TradingViewChart
                coin={coinName}
                mode={chartMode}
                onMarketDataChange={handleMarketDataChange}
              />
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6 md:p-7 shadow-sm">
              {metricsError && (
                <p className="text-xs text-red-500 mb-4">
                  Metrics unavailable for this asset: {metricsError}
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-xs md:text-sm">
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="mb-1 text-[var(--muted-text-color)]">Market cap</p>
                  <p className="font-semibold ">
                    {metrics
                      ? `$${(metrics.marketCap / 10 ** 9).toFixed(2)}B`
                      : '—'}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="mb-1 text-[var(--muted-text-color)]">24h volume</p>
                  <p className="font-semibold ">
                    {metrics
                      ? `$${(metrics.volume24h / 10 ** 9).toFixed(2)}B`
                      : '—'}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="mb-1 text-[var(--muted-text-color)]">FDV</p>
                  <p className="font-semibold ">
                    {metrics?.fullyDilutedValuation
                      ? `$${(metrics.fullyDilutedValuation / 10 ** 9).toFixed(2)}B`
                      : 'N/A'}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="mb-1 text-[var(--muted-text-color)]">Circulating Supply</p>
                  <p className="font-semibold ">
                    {metrics?.circulatingSupply
                      ? `$${(metrics.circulatingSupply / 10 ** 9).toFixed(2)}B`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-7 shadow-soft">
            <h2 className="text-lg font-semibold mb-6 uppercase tracking-wider text-[var(--text-color)]">
              Latest News
            </h2>


            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border rounded-xl border-[var(--border-color)] bg-[var(--muted-surface-color)] h-48 flex items-center justify-center text-xs text-[var(--muted-text-color)] animate-pulse"
                  >
                    Loading...
                  </div>
                ))}
              </div>
            ) : newsError ? (
              
              <div className="border rounded-xl border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4 text-sm text-[var(--muted-text-color)]">
                <p className="text-red-600 ">
                  Unable to load news: {newsError}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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


        </div>

        <div className="lg:col-span-1">
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-soft sticky top-24">
            <div className="flex flex-col gap-4 items-center text-center mb-6">
              <h3 className="text-2xl font-semibold tracking-tight">Spot Trading</h3>
              <p className="text-sm text-[var(--muted-text-color)] max-w-xs">
                Fast order entry, wallet selection, and position summary in one panel.
              </p>
            </div>

            <div className="flex gap-3 mb-6 rounded-[1.5rem] overflow-hidden bg-[var(--muted-surface-color)] p-2">
              <Button
                variant={side === 'buy' ? 'primary' : 'secondary'}
                size="lg"
                type="button"
                onClick={() => setSide('buy')}
                className="flex-1 rounded-[1.25rem]"
              >
                Buy
              </Button>
              <Button
                size="lg"
                variant={side === 'sell' ? 'primary' : 'secondary'}
                type="button"
                onClick={() => setSide('sell')}
                className="flex-1 rounded-[1.25rem]"
              >
                Sell
              </Button>
            </div>

            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium">Select Wallet</label>
              <select
                value={selectedWalletID}
                onChange={(e) => setSelectedWalletID(String(e.target.value))}
                className="select"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.walletid} value={String(wallet.walletid)}>
                    {wallet.name} - ${wallet.usdt_balance?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={side === 'buy' ? handleBuy : handleSell} className="space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  {side === 'buy' ? 'Buy' : 'Sell'} Amount
                </label>
                <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <input
                        type="number"
                        step="any"
                        value={USD || ''}
                        onChange={(e) => setUSDFromAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        className="text-2xl font-semibold bg-transparent focus:outline-none w-28"
                      />
                      <span className="text-sm text-[var(--muted-text-color)]">USD</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-text-color)]">
                      <input
                        type="number"
                        step="any"
                        value={currentPrice > 0 ? USD / currentPrice : 0}
                        onChange={(e) => {
                          const assetAmount = parseFloat(e.target.value) || 0;
                          setUSDFromAmount(assetAmount * currentPrice);
                        }}
                        placeholder="0.00"
                        className="w-24 bg-transparent focus:outline-none"
                      />
                      <span>{baseTicker}</span>
                      <img
                        src={`https://img.logokit.com/crypto/${baseTicker}?token=${logoToken}`}
                        alt={baseTicker}
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    {side === 'buy' ? 'Wallet' : 'Position'} Percentage
                  </label>
                  <span className="text-xs text-[var(--muted-text-color)]">
                    Available: ${MaxTradeUSD.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant={
                        Number(percentage) === preset
                          ? side === 'buy'
                            ? 'green'
                            : 'red'
                          : 'secondary'
                      }
                      onClick={() => setUSDFromPercent(preset)}
                      className="w-full rounded-[1rem]"
                    >
                      {preset}%
                    </Button>
                  ))}
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-3 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={percentage}
                    onChange={(e) => setUSDFromPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20 text-lg font-medium bg-transparent focus:outline-none"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-[var(--muted-text-color)]">
                <span>Slippage</span>
                <span className="font-medium">2%</span>
              </div>

              {isInvalidTradeAmount ? (
                <Button
                  type="submit"
                  variant={side === 'buy' ? 'green' : 'red'}
                  size="lg"
                  className="w-full"
                  disabled
                >
                  Invalid {side === 'buy' ? 'Buy' : 'Sell'} Amount
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant={side === 'buy' ? 'green' : 'red'}
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} $${USD.toFixed(2)}`}
                </Button>
              )}
            </form>

            {activePosition && activePosition.availableqty > 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Position</h4>
                  <span className="text-xs text-[var(--muted-text-color)]">Live overview</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>{activePosition.availableqty.toFixed(6)} {baseTicker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Cost</span>
                    <span>${activePosition.avgcost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Price</span>
                    <span>${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position Value</span>
                    <span>${positionValue.toFixed(2)}</span>
                  </div>
                </div>

                {showWhatIfBox && (
                  <div className="rounded-[1.25rem] border border-[var(--border-color)] bg-[var(--surface-color)] p-3">
                    <p className="text-xs font-semibold mb-2">What If</p>
                    <div className="space-y-2 text-xs">
                      {whatIfScenarios.map((percent) => {
                        const projectedBalance = positionValue * (1 + percent / 100);
                        return (
                          <div key={percent} className="flex justify-between">
                            <span>{percent > 0 ? `+${percent}%` : `${percent}%`}</span>
                            <span>${projectedBalance.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm font-semibold">
                  <span>PnL</span>
                  <span className={unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {messageText !== '' && (
          <div className="trade-confirm-overlay fixed inset-0 z-50 grid place-items-center px-4">
            <div
              className={`trade-confirm-panel relative min-h-[10rem] ${
                messageType === 'Error' ? 'ring-1 ring-red-300/70' : 'ring-1 ring-green-300/70'
              }`}
            >
              <div className="flex items-center gap-3">
              
                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      messageType === 'Error' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {messageType === 'Error' ? 'Order Not Completed' : 'Order Completed'}
                  </h2>
                </div>
              </div>

              <p className="trade-confirm-copy mt-4 text-sm">
                {messageText}
              </p>
               <Button 
                type="button"
                onClick={clearMessage}
                size = "sm"
                variant = "secondary"
                className="absolute bottom-3 right-3 rounded-full text-sm "
              >
                Close
              </Button>
          
            </div>
          </div>
        )}


      </div>
    );
  };

  export default Trade;
