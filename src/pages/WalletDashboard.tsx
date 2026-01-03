import Button from '../Components/Button';
import { useAuth } from '../context/AuthContext';
import { CreateWallet } from '../utils/CreateWallet';
import FetchWallets from '../utils/FetchWallets';
import FetchXP from '../utils/fetchXP';
import { useEffect, useState } from 'react';
import { type wallet } from '../types/wallet';  
const WalletDashboard = () => {
  const { user, loading } = useAuth();
  const [XP, setXP] = useState<number>(0);
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    FetchXP(user).then(setXP);
    FetchWallets(user).then(setWallets);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  async function createWallet() {
    if (!user || !walletName.trim()) return;
    try {
      setIsCreating(true);  
      console.log('Creating wallet with name:', walletName.trim(), user.id);
      const response = await CreateWallet(user, walletName);
      if (response) {
        // Refresh wallets and XP 
        await FetchWallets(user).then(setWallets);
        
        await FetchXP(user).then(setXP);

      }
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setIsCreating(false);
    }
  }

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Hi, {user?.user_metadata.username}!
          </h1>
          <div className="flex items-center gap-4">
            <Button size="md" variant="green" onClick={() => setIsCreating(true)}>
              Create New Wallet
            </Button>
            <div className="rounded-xl shadow-sm px-4 py-2 text-sm">
              <span className="font-semibold">Total XP:</span>{' '}
              <span className="ml-1">{XP}</span>
            </div>
          </div>
        </div>

        <section className="rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wallets</h2>
            <p className="text-xs">Practice equity: USDT</p>
          </div>
        </section>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Create Wallet</h2>
            <input
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Wallet name"
              className="w-full rounded-lg border px-3 py-2 text-sm   "
            />
            <div className="flex justify-end gap-3">
              <Button size="sm" variant="secondary" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="green" onClick={createWallet} disabled={!walletName.trim()}>
                Create
              </Button>
            </div>
        
          </div>
   

    </div>
      )
} 
{wallets.length === 0 ? (
  <div className="mt-6 text-center text-sm text-body">
    You have no wallets yet. Create one to get started!
    Make sure to check out the tutorials to earn XP and learn how to trade!
  </div>
) : (
  <div className="mt-6 space-y-4 max-w-3xl mx-auto">
    {wallets.map((wallet) => (
      <div
        key={wallet.walletid}
        className="p-4 rounded-lg shadow-sm flex items-center justify-between"
      >
        <span className="font-medium">{wallet.name}</span>
        <span className="text-sm text-body">ID: {wallet.walletid}</span>
      </div>
    ))}
  </div>
)}
    </div>
  );
}
export default WalletDashboard;
