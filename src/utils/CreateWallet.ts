import { createClient, type User } from "@supabase/supabase-js";
import GenerateId from "./GenerateId";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );    
export const CreateWallet = async (user: User, name: string) => {
    // Create a new wallet entry in the 'tblwallets' table
    const id = GenerateId();

    const { error } = await supabase 
    .from('tblwallets')
    .upsert({ walletid: id, user_id: user.id, name: name })
    if (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');

    }
    //Add 50XP
    const {error: xpError} = await supabase.rpc('incrementXP', {
      user_id: user.id,
      quantity: 50
    });
    
    if (xpError) {
      console.error('Error updating XP:', xpError);
      throw new Error('Failed to update XP');
    }
    return true;
}   