  import { useEffect, useState } from 'react';
  import { coinNameToTicker } from '../data/tickers';
  import { CandleStickChart } from '../Components/TradingChart';
  import SearchBar from '../Components/SearchBar';
  import { useFetchCoinMetrics } from '../utils/FetchCoinMetrics';
  import { useFetchCryptoNews } from '../utils/FetchCryptoNews';
  import NewsCard from '../Components/NewsCard';
  import Button from '../Components/Button';
import fetchWalletUSDTBalance from '../utils/FetchWalletUSDTBalance';
import { useAuth } from '../context/AuthContext';
import placeMarketBuy from '../utils/actions/placeMarketBuy';
import placeMarketSell from '../utils/actions/placeMarketSell';
import fetchWalletHolding from '../utils/FetchWalletHolding';
import IncrementXP from '../utils/IncrementXP';

  type Side = 'buy' | 'sell';

  const Trade = () => {
    const { user } = useAuth();
    const [USD, setUSD ] = useState<number>(0);
    const [coinName, setCoinName] = useState<string>('bitcoin');
    const [side, setSide] = useState<Side>('buy');
    const logoToken = import.meta.env.VITE_LOGO_API;
    //Use coinNameToTicker get ticker for respective crypto
    const baseTicker = coinNameToTicker[coinName] ?? 'BTC';
    const [ wallets, setWallets] = useState<{ walletid: string; name: string; usdt_balance?: number }[]>([]);
    const [selectedWalletID, setselectedWalletID] = useState<string>('');
    const [ loading, setLoading ] = useState<boolean>(false);
    const [message, setMessage] = useState<Record<string, string>>({message: '', type: ''});
    const [position, setPosition] = useState<{
      availableqty: number;
      avgcost: number;
    } | null>(null);
   
        
    useEffect(() => {
      async function fetchWallets() {
        const wallets = await fetchWalletUSDTBalance(user);
        if (wallets.length > 0) {
          setWallets(wallets);
          setselectedWalletID(wallets[0].walletid);
          
        }
      }
      fetchWallets();
      }, [user]);


    
    //Fetch coin metrics
    const { data: metrics, loading: metricsLoading, error: metricsError } =
      useFetchCoinMetrics(coinName);
    //Fetch crypto news
    const { data: news, loading: newsLoading, error: newsError } =
      useFetchCryptoNews(coinName);
    
    const handleBuy =  async (e: React.FormEvent) => {  
      // setLoading to true & prevent default form submission
      e.preventDefault();
      setLoading(true);
   
      const res = await placeMarketBuy(user!, selectedWalletID, baseTicker, USD, metrics!.price);
      if (!res){
        setMessage({message:'Insufficient funds in wallet',
                  type: 'Error'});
      }
      else {
        setMessage({message: `Successfully placed market buy for $${USD.toFixed(2)} of ${baseTicker} at $${metrics!.price.toFixed(2)}`,
                    type: 'Success'});
        //Increment XP
        IncrementXP(user, 10);
      }   
      setLoading(false);

      
  };
    const handleSell = async (e: React.FormEvent) => {
      e.preventDefault();
      //IncrementXP 
    

      setLoading(true);
      const res = await placeMarketSell(user!, selectedWalletID, baseTicker, USD/metrics!.price, metrics!.price);
      console.log(res)
      if (!res){
        setMessage({message:'Insufficient asset quantity in wallet',
                  type: 'Error'});
      }
      else {
        setMessage({message: `Successfully placed market sell for $${USD.toFixed(2)} of ${baseTicker} at $${metrics!.price.toFixed(2)}`,
                    type: 'Success'});
        IncrementXP(user, 10);
      }   
      setLoading(false);
    }
    useEffect(() => {
      if (!selectedWalletID || !baseTicker) {
        setPosition(null);
        return;
      }
    
      fetchWalletHolding(selectedWalletID, baseTicker)
        .then(setPosition);
    }, [selectedWalletID, baseTicker]);
    const currentPrice = metrics?.price ?? 0;

const positionValue =
  position ? position.availableqty * currentPrice : 0;

const unrealizedPnL =
  position
    ? (currentPrice - position.avgcost) * position.availableqty
    : 0;

const pnlPercent =
  position && position.avgcost > 0
    ? ((currentPrice - position.avgcost) / position.avgcost) * 100
    : 0;
    return (
      <div className="px-6 md:px-20 pb-10  mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <div className="rounded-2xl  shadow-sm border p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className = "flex flex-row items-center gap-2">
              <img
              //Fetch the correct logo based on the ticker
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
                  {
                    //Using conditional rendering to show loading state or price
                  metricsLoading || !metrics
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
            {/* Pass coin name into candle stick chart.*/}
            <CandleStickChart coin={coinName} />
          

          <div className="rounded-2xl   p-4 md:p-5  ">
            {metricsError && (
              <p className="text-xs text-red-500 mb-2">
                Metrics unavailable for this asset: {metricsError}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
              <div>
                <p className=" mb-1">Market cap</p>
                <p className="font-semibold ">
                  {metrics
                    ? `$${(metrics.marketCap / 10**9).toFixed(2)}B`
                    : '—'}
                </p>
              </div>
              <div>
                <p className=" mb-1">24h volume</p>
                <p className="font-semibold ">
                  {metrics
                    ? `$${(metrics.volume24h / 10**9).toFixed(2)}B`
                    : '—'}
                </p>
              </div>
              <div>
                <p className=" mb-1">FDV</p>
                <p className="font-semibold ">
                  {metrics?.fullyDilutedValuation
                    ? `$${(metrics.fullyDilutedValuation / 10**9).toFixed(2)}B`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className=" mb-1">Circulating Supply</p>
                <p className="font-semibold ">
                  {metrics?.circulatingSupply
                    ? `$${(metrics.circulatingSupply / 10**9).toFixed(2)}B`
                    : 'N/A'}
                </p>
              </div>
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


        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl  shadow-sm border    p-3   sticky top-24">
            <div className = "w-full flex items-center justify-center mb-4">
          <h3 className = "text-3xl ">Spot</h3>
          </div>
          <div className = "w-full border"/>
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
                  onChange={(e) => setselectedWalletID(e.target.value )}
                  className="w-full px-4 py-2 border  dark:border-gray-600 rounded-md bg-(background-color)"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.walletid} value={wallet.walletid}>
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
                <div className="border  dark:border-gray-600 rounded-lg p-4 ">
                  <div className="flex flex-row space-x-10 justify-between w-full">
                    <div className = "flex items-center   ">
                    <input
                      type="number"
                      step="any"
                      value={USD || ''}
                      onChange={(e) => setUSD(parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                      className="text-2xl font-medium bg-transparent focus:outline-none w-24"
                    />
                  <span className="text-sm ">USD</span>
                    </div>
                    <div className = "flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={USD / (metrics ? metrics.price : 1)}
                      onChange={(e) => {
                        //Calculate USD based on price fetched from CoinGecko (parse float to convert string to float)
                        setUSD(parseFloat(e.target.value) * metrics!.price || 0);
                      }}
                      placeholder="0.00"
                      className="text-lg text-gray-400 bg-transparent focus:outline-none w-24"
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

              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Slippage:</span>
                  <span className="font-medium">2%</span>
                </div>
              </div>

              {USD === 0 ? (
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
        {position && position.availableqty > 0 && metrics && (
  <div className="mt-6 rounded-xl border p-4 space-y-2 ">
    <h4 className="text-sm font-semibold">Position</h4>

    <div className="flex justify-between text-sm">
      <span>Quantity</span>
      <span>
        {position.availableqty.toFixed(6)} {baseTicker}
      </span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Avg Cost</span>
      <span>${position.avgcost.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Market Price</span>
      <span>${currentPrice.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm">
      <span>Position Value</span>
      <span>${positionValue.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm font-medium">
      <span>PnL</span>
      <span
        className={
          unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'
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

        {message.message !== ''  && (
  <div className="fixed inset-0 z-50 flex items-center justify-center ">
    
   
    <div className={`relative w-full max-w-sm rounded-xl  p-6 shadow-xl space-y-4 ${message.type === 'Error' ? 'bg-red-500 ' : 'bg-green-500 '}`}>
      <h2 className="text-lg font-semibold ">{message.type === "Error" ? 'Error' : 'Success'}</h2>
      <p>{message.message}</p>
      <div className="flex justify-end gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setMessage({message: '', type: ''})}
        >
          Close
        </Button>
      </div>
    </div>

  </div>
)}


      </div>
    );
  };

  export default Trade;