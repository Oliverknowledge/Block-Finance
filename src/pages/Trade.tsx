  import { useEffect, useState } from 'react';
  import { coinNameToTicker } from '../data/tickers';
  import { TradingViewChart, type ChartMode } from '../Components/TradingChart';
import SearchBar from '../Components/SearchBar';
import { useFetchCoinMetrics } from '../utils/FetchCoinMetrics';
import { useFetchCryptoNews } from '../utils/FetchCryptoNews';
import NewsCard from '../Components/NewsCard';
import Button from '../Components/Button';
import Tooltip from '../Components/Tooltip';
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
      <div className="px-6 md:px-20 pb-10  mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className = "flex flex-row items-center gap-2">
              <img
              src={`https://img.logokit.com/crypto/${baseTicker}?token=${logoToken}`}
              alt={`${baseTicker} logo`}
              className="w-10 h-10 rounded-full shadow-md"
            />
                <h2 className="text-xl md:text-2xl font-semibold ">

                  {coinName.charAt(0).toUpperCase() + coinName.slice(1)} ({baseTicker}/USDT)
                </h2>
                </div>
                
              </div>
              <div className="mb-1 w-100">
            <SearchBar
              Search={(value) => {
                setCoinName(value.toLowerCase());
                }}
            />
          </div>
              <div className="text-right">
                <p className="text-[10px] uppercase ">Last price</p>
                <p className="text-lg font-semibold ">
                  {binanceLastPrice === null
                    ? '—'
                    : `$${binanceLastPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}`}
                </p>
                {binanceChange24h !== null && (
                  <p
                    className={`text-xs font-medium ${
                      binanceChange24h >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {binanceChange24h >= 0 ? '↑' : '↓'}{' '}
                    {binanceChange24h.toFixed(2)}% (24h)
                  </p>
                )}
              </div>
            </div>
            {!showBeginnerTooltips && (
              <div className="mb-3 flex justify-end gap-2">
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
            <TradingViewChart
              coin={coinName}
              mode={chartMode}
              onMarketDataChange={handleMarketDataChange}
            />
          

          <div className="rounded-2xl p-4 md:p-5">
            {metricsError && (
              <p className="text-xs text-red-600 mb-2">
                Metrics unavailable for this asset: {metricsError}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
              <div>
                <p className="mb-1">
                  {showBeginnerTooltips ? (
                    <Tooltip text="Price multiplied by circulating supply.">Market cap</Tooltip>
                  ) : (
                    'Market cap'
                  )}
                </p>
                <p className="font-semibold ">
                  {metrics
                    ? `$${(metrics.marketCap / 10**9).toFixed(2)}B`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="mb-1">
                  {showBeginnerTooltips ? (
                    <Tooltip text="Total traded value over the last 24 hours.">24h volume</Tooltip>
                  ) : (
                    '24h volume'
                  )}
                </p>
                <p className="font-semibold ">
                  {metrics
                    ? `$${(metrics.volume24h / 10**9).toFixed(2)}B`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="mb-1">
                  {showBeginnerTooltips ? (
                    <Tooltip text="Value if max token supply were all in circulation.">FDV</Tooltip>
                  ) : (
                    'FDV'
                  )}
                </p>
                <p className="font-semibold ">
                  {metrics?.fullyDilutedValuation
                    ? `$${(metrics.fullyDilutedValuation / 10**9).toFixed(2)}B`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="mb-1">
                  {showBeginnerTooltips ? (
                    <Tooltip text="Tokens currently available on the market.">Circulating Supply</Tooltip>
                  ) : (
                    'Circulating Supply'
                  )}
                </p>
                <p className="font-semibold ">
                  {metrics?.circulatingSupply
                    ? `$${(metrics.circulatingSupply / 10**9).toFixed(2)}B`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          </div>
          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-3 ">
              News
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
          <div className="rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-3 sticky top-24">
            <div className = "w-full flex items-center justify-center mb-4">
          <h3 className = "text-3xl ">Spot</h3>
          </div>
          <div className="w-full border border-[var(--border-color)]" />
            <div className="flex mb-4 rounded-lg overflow-hidden  ">
              <Button
                variant = {`${side === 'buy' ? 'green' : 'secondary' }`}
                size = "lg"
                type="button"
                onClick={() => setSide('buy')}
                className={`flex-1  ${
                  side === 'buy'
                    ? ' '
                    : ''
                }`}
              >
                Buy
              </Button>
              <Button
                size = "lg"
                variant = {`${side === 'sell' ? 'red' : 'secondary'}`}
                type="button"
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  side === 'sell'
                    ? ' '
                    : ''
                }`}
              >
                Sell
              </Button>
            </div>
            <div>
                <label className="block text-sm font-medium my-3 ">
                  Select Wallet
                </label>
                <select
                  value={selectedWalletID}
                  onChange={(e) => setSelectedWalletID(String(e.target.value))}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-md bg-[var(--background-color)] text-[var(--text-color)]"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.walletid} value={String(wallet.walletid)}>
                      {wallet.name} - ${wallet.usdt_balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            <form onSubmit={side == 'buy' ? handleBuy : handleSell} className="space-y-4 mt-4">
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {side === 'buy' ? 'Buy' : 'Sell'} Amount
                </label>
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <div className="flex flex-row space-x-10 justify-between w-full">
                    <div className = "flex items-center   ">
                    <input
                      type="number"
                      step="any"
                      value={USD || ''}
                      onChange={(e) => setUSDFromAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                      className="text-2xl font-medium bg-transparent focus:outline-none w-24"
                    />
                  <span className="text-sm ">USD</span>
                    </div>
                    <div className = "flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={currentPrice > 0 ? USD / currentPrice : 0}
                      onChange={(e) => {
                        const assetAmount = parseFloat(e.target.value) || 0;
                        setUSDFromAmount(assetAmount * currentPrice);
                      }}
                      placeholder="0.00"
                      className="text-lg text-[var(--muted-text-color)] bg-transparent focus:outline-none w-24"
                    />
                    <span className="text-sm font-medium ">
                        {baseTicker}
                      </span>
                      <img
                        src={`https://img.logokit.com/crypto/${baseTicker}?token=${logoToken}`}
                        alt={baseTicker}
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                  </div>
                
                </div>
              </div>

              <div className="space-y-2">
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
                      className="w-full"
                    >
                      {preset}%
                    </Button>
                  ))}
                </div>
                <div className=" rounded-lg p-3 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={percentage}
                    onChange={(e) => setUSDFromPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="text-lg font-medium bg-transparent focus:outline-none w-20"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-[var(--muted-text-color)] mb-1">
                  <span>Slippage:</span>
                  <span className="font-medium">2%</span>
                </div>
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
  <>
    {!loading ? (
      <Button
        type="submit"
        variant={side === 'buy' ? 'green' : 'red'}
        size="lg"
        className="w-full"

      >
        {side === 'buy' ? 'Total Buy Amount' : 'Total Sell Amount'}: $
        {USD.toFixed(2)}
      </Button>
    ) : (
      <Button
        type="submit"
        variant={side === 'buy' ? 'green' : 'red'}
        size="lg"
        className="w-full"
        disabled
      >
        Processing...
      </Button>
    )}
  </>
)}

            </form>
        {activePosition && activePosition.availableqty > 0 && (
  <div className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4 space-y-2">
    <h4 className="text-sm font-semibold">Position</h4>

    <div className="flex justify-between text-sm">
      <span>Quantity</span>
        <span>
        {activePosition.availableqty.toFixed(6)} {baseTicker}
      </span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Avg Cost</span>
      <span>${activePosition.avgcost.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Market Price</span>
      <span>${currentPrice.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Position Value</span>
      <span>${positionValue.toFixed(2)}</span>
    </div>

    {showWhatIfBox && (
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-3">
        <p className="text-xs font-semibold">What If</p>
        <div className="mt-2 space-y-1 text-xs">
          {whatIfScenarios.map((percent) => {
            const projectedBalance = positionValue * (1 + percent / 100);
            return (
              <div key={percent} className="flex items-center justify-between">
                <span>{percent > 0 ? `+${percent}%` : `${percent}%`}</span>
                <span>${projectedBalance.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}

    <div className="flex justify-between text-sm font-medium">
      <span>PnL</span>
      <span
        className={
          unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
        }
      >
        {unrealizedPnL >= 0 ? '+' : ''}
        ${unrealizedPnL.toFixed(2)} ({pnlPercent.toFixed(2)}%)
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
