import { createClient, type User } from '@supabase/supabase-js'
import GenerateId from '../GenerateId';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default async function placeMarketSell(
  user: User,
  walletid: string,
  ticker: string,
  quantityToSell: number,
  price: number,
): Promise<boolean> {

  if (!user) return false;

  //  Check asset balance
  const asset = await supabase
    .from('tblwalletassets')
    .select('availableqty, avgcost')
    .eq('walletid', walletid)
    .eq('ticker', ticker)
    .single();

  if (asset.error) {
    console.error('Error fetching asset balance:', asset.error);
    return false;
  }
  console.log(asset.data.availableqty, quantityToSell);
  if (asset.data.availableqty < quantityToSell) {
    console.error('Insufficient asset quantity');
    return false;
  }

  // Calculate USDT value, fee, and net USDT. Slippage is 0 for now.
  const grossUSD = quantityToSell * price;
  const fee = 0.01 * grossUSD;
  const netUSD = grossUSD - fee;
  const slippage = 0;

  //  Sell the asset 
  const { error: updateAssetError } = await supabase
    .from('tblwalletassets')
    .update({
      availableqty: asset.data.availableqty - quantityToSell,
      updatedat: new Date()
    })
    .eq('walletid', walletid)
    .eq('ticker', ticker);

  if (updateAssetError) {
    console.error('Error updating asset quantity:', updateAssetError);
    return false;
  }

  // Increase USDT balance
  const usd = await supabase
    .from('tblwalletassets')
    .select('availableqty')
    .eq('walletid', walletid)
    .eq('ticker', 'USDT')
    .single();

  if (usd.error) {
    console.error('Error fetching USD balance:', usd.error);
    return false;
  }

  const { error: updateUsdError } = await supabase
    .from('tblwalletassets')
    .update({
      availableqty: usd.data.availableqty + netUSD,
      updatedat: new Date()
    })
    .eq('walletid', walletid)
    .eq('ticker', 'USDT');

  if (updateUsdError) {
    console.error('Error updating USD balance:', updateUsdError);
    return false;
  }

  // Insert trade
  const tradeId = GenerateId();
  const { error: tradeError } = await supabase
    .from('tbltrades')
    .insert([{
      tradeid: tradeId,
      walletid,
      ticker,
      usdvalue: netUSD,
      quantity: quantityToSell,
      side: 'SELL',
      price,
      fee,
      slippage
    }]);

  if (tradeError) {
    console.error('Error inserting sell trade:', tradeError);
    return false;
  }

  return true;
}
