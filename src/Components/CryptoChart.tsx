import { useState } from "react";
import SearchBar from "./SearchBar";
import { CandleStickChart } from "./TradingChart";
import { coinNameToTicker } from "../data/tickers";
import { useFetchCoinMetrics } from "../utils/FetchCoinMetrics";

const CryptoChart = () => {
  const [coin, setCoin] = useState("bitcoin");

  const handleSearch = (value: string) => {
    setCoin(value.toLowerCase());
  };

  const logoToken = import.meta.env.VITE_LOGO_API;
  const coinId = coin; 
  const ticker = coinNameToTicker[coinId]; 

  const { data, loading, error } = useFetchCoinMetrics(coinId ?? undefined);

  // --- ERROR STATE: Unknown Coin Ticker ---
  if (!ticker) {
    return (
      <div className="p-8 text-center bg-surface min-h-screen text-primary">
        <SearchBar Search={handleSearch} />
        <p className="mt-8 text-xl text-danger">
          ⚠️ Unknown cryptocurrency: <strong>{coin}</strong>
        </p>
        <p className="text-muted">Try a common coin like "bitcoin" or "ethereum".</p>
      </div>
    );
  }

  // --- LOADING/ERROR STATES ---
  if (loading) {
    return (
      <div className="p-8 text-center bg-surface min-h-screen text-primary">
        <SearchBar Search={handleSearch} />
        <div className="mt-20 text-xl animate-pulse">Loading data for {coinId}...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-surface min-h-screen text-primary">
        <SearchBar Search={handleSearch} />
        <div className="mt-20 text-xl text-danger">
          ❌ Fetch failed: {error?.message || "No data returned from API."}
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---

  // Determine color for 24h change (Success/Danger is common in trading UI)
  const changeColor = data.change24h >= 0 ? 'text-success' : 'text-danger';
  const changeSign = data.change24h >= 0 ? '▲' : '▼';

  return (
    <div className="min-h-screen bg-surface text-primary p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Search Bar (Top Control) - Assuming SearchBar has minimal styling */}
        <div className="mb-8">
          <SearchBar Search={handleSearch}  />
        </div>

        {/* 2. Header and Price Metrics */}
        <div className="flex items-center mb-6 space-x-4 border-b border-divider pb-4">
          <img
            src={`https://img.logokit.com/crypto/${ticker}?token=${logoToken}`}
            alt={`${coin} logo`}
            className="w-10 h-10 rounded-full shadow-md"
          />
          <div>
            <h1 className="text-2xl font-semibold capitalize">{coin}</h1>
            <p className="text-sm text-muted">{ticker} / USD</p>
          </div>

          {/* Current Price and 24h Change */}
          <div className="ml-auto flex items-end space-x-4">
            <p className="text-4xl font-bold">${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
            <p className={`text-lg font-medium ${changeColor} mb-0.5`}>
              {changeSign} {data.change24h.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* 3. Main Chart (Placeholder) */}
        <div className="bg-card rounded-lg p-2 shadow-lg h-[450px] mb-8 border border-divider">
           <CandleStickChart coin={coin} />
        </div>

        {/* 4. Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Market Cap */}
          <MetricCard 
            title="Market Cap" 
            value={`$${(data.marketCap / 1e9).toFixed(2)}B`} 
            tooltip={`$${data.marketCap.toLocaleString()}`}
          />
          
          {/* 24h Volume */}
          <MetricCard 
            title="24h Volume" 
            value={`$${(data.volume24h / 1e9).toFixed(2)}B`} 
            tooltip={`$${data.volume24h.toLocaleString()}`}
          />

          {/* Fully Diluted Valuation (FDV) */}
          <MetricCard 
            title="FDV" 
            value={data.fullyDilutedValuation 
              ? `$${(data.fullyDilutedValuation / 1e9).toFixed(2)}B`
              : 'N/A'
            }
            tooltip={data.fullyDilutedValuation 
              ? `$${data.fullyDilutedValuation.toLocaleString()}`
              : 'Not available'
            }
          />
          
          {/* Circulating Supply */}
          <MetricCard 
            title="Circulating Supply" 
            value={`${(data.circulatingSupply / 1e6).toFixed(2)}M`} 
            tooltip={data.circulatingSupply.toLocaleString()}
          />
        </div>
        
        {/* 5. Additional Supply Data (Muted Footer) */}
        <div className="mt-8 text-xs text-muted text-right">
            Total Supply: {data.totalSupply?.toLocaleString() || 'Unlimited/N/A'}
        </div>

      </div>
    </div>
  );
};

// Helper component for clean metric display
const MetricCard = ({ title, value, tooltip }: { title: string, value: string, tooltip: string }) => (
  <div className="bg-card p-4 rounded-md shadow-sm border border-divider hover:shadow-lg transition duration-150 relative group">
    <p className="text-sm font-medium text-muted">{title}</p>
    <p className="text-xl font-semibold mt-1">{value}</p>
    {/* Tooltip implementation remains the same for functionality */}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-tooltip text-xs text-tooltip-text rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
      {tooltip}
    </span>
  </div>
);

export default CryptoChart;