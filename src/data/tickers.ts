export const coinNameToTicker: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  tether: 'USDT',
  'binance coin': 'BNB',
  solana: 'SOL',
  'usd coin': 'USDC',
  xrp: 'XRP',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  avalanche: 'AVAX',
  tron: 'TRX',
  polkadot: 'DOT',
  polygon: 'MATIC',
  litecoin: 'LTC',
  chainlink: 'LINK',
  stellar: 'XLM',
  'bitcoin cash': 'BCH',
  cosmos: 'ATOM',
  monero: 'XMR',
  uniswap: 'UNI',
  vechain: 'VET',
  aave: 'AAVE',
  maker: 'MKR',
  'wrapped bitcoin': 'WBTC',
  
};

// Simple list of major trading pairs used by the Trade page.
// This is intentionally small and static – it is ONLY for the simulator UI,
// not for driving live market data.
export const tickers = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', close: 68000 },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', close: 3500 },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', close: 180 },
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', close: 0.6 },
  { symbol: 'ADAUSDT', base: 'ADA', quote: 'USDT', close: 0.5 },
  { symbol: 'DOGEUSDT', base: 'DOGE', quote: 'USDT', close: 0.2 },
];
