import { createClient, type User } from '@supabase/supabase-js'
import GenerateId from '../GenerateId';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);


export default async function placeMarketBuy(
    user: User,
    walletid: string,
    ticker: string,
    USD: number,
    price: number,
): Promise<boolean> {
    //Input walletid and ticker and quantity to buy
    //Use fetch wallets function to find t
    //Insert a new row into tbltrades with wallet id, ticker, quantity, side 'buy' and price
    //Use database logic to add or update a position  
    const availableUSD= await supabase
        .from('tblwalletassets')
        .select('availableqty')
        .eq('walletid', walletid)
        .eq('ticker', 'USDT')
        .single();
    
    if (availableUSD.error) {
        console.error('Error fetching wallet USD balance:', availableUSD.error);
        return false;
    }   
    if (availableUSD.data.availableqty < USD) {
        console.error('Insufficient USD balance in wallet');
        return false;
    }
    const newUSDBalance = availableUSD.data.availableqty - USD;
    const { error: updateError } = await supabase
        .from('tblwalletassets')
        .update({ availableqty: newUSDBalance, updatedat: new Date() })
        .eq('walletid', walletid)
        .eq('ticker', 'USDT');
    if (updateError) {
        console.error('Error updating wallet USD balance:', updateError);
        return false;
    }
    
    const quantityToBuy = USD / price;
    // Deduct a 1% fee from the USD value
    const fee = 0.01 * USD;
    USD -= fee;
    // No slippage for now
    const slippage = 0;
    if (!user) return false;
    const id = GenerateId();
   const  { error } = await supabase
        .from('tbltrades')
        .insert([
          { tradeid: id, walletid: walletid, ticker: ticker, usdvalue: USD, quantity: quantityToBuy, side: 'BUY', price: price, fee: fee, slippage: slippage },
        ]); 
        if (error) {
          console.error('Error placing market buy:', error);
        }   
    const {error: incrementError }=  await supabase.rpc('increment_wallet_asset', {
            p_price: price,
            p_walletid: walletid,
            p_ticker: ticker,
            p_qty: quantityToBuy,
          });
        if (incrementError) {
            console.error('Error updating wallet asset quantity:', incrementError);
            return false;
            }

    
    return true
}
