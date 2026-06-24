import { useCallback, useEffect, useState } from 'react';
import Button from '../Components/Button';
import { useAuth } from '../hooks/useAuth';
import { createWallet } from '../utils/CreateWallet';
import deleteWallet from '../utils/DeleteWallet';
import fetchWallets from '../utils/FetchWallets';
import fetchWalletAssets, { type WalletAssetPosition } from '../utils/FetchWalletAssets';
import fetchWalletStakes, { type WalletStake } from '../utils/FetchWalletStakes';
import fetchXp from '../utils/fetchXP';
import { type wallet } from '../types/Wallet';

type Notice = {
  type: 'Error' | 'Success' | '';
  message: string;
};

type InsightTone = 'good' | 'warning' | 'risk';

type WalletInsight = {
  tone: InsightTone;
  text: string;
};

type WalletEvaluation = {
  walletName: string;
  insights: WalletInsight[];
};

const normalizeTicker = (value: string) => value.trim().toUpperCase();

const evaluateWallet = (
  walletName: string,
  assetPositions: WalletAssetPosition[],
  walletStakes: WalletStake[],
): WalletEvaluation => {
  const totals: Record<string, number> = {};
  let totalValue = 0;
  let stableValue = 0;
  let stakedValue = 0;
  let topValue = 0;
  let cryptoCount = 0;
  const insights: WalletInsight[] = [];

  for (let i = 0; i < assetPositions.length; i += 1) {
    const position = assetPositions[i];
    const ticker = normalizeTicker(String(position.ticker || ''));
    const quantity = Number(position.availableqty) || 0;
    if (ticker === '' || quantity <= 0) continue;

    const price = ticker === 'USDT' ? 1 : Number(position.avgcost) || 1;
    const value = quantity * price;
    if (value <= 0) continue;

    totals[ticker] = (totals[ticker] || 0) + value;
  }

  for (let i = 0; i < walletStakes.length; i += 1) {
    const stake = walletStakes[i];
    if (stake.status !== 'active') continue;
    const ticker = normalizeTicker(String(stake.ticker || ''));
    const value = (Number(stake.quantity) || 0) + (Number(stake.rewardsaccrued) || 0);
    if (ticker === '' || value <= 0) continue;

    stakedValue += value;
    totals[ticker] = (totals[ticker] || 0) + value;
  }

  for (const ticker in totals) {
    const value = totals[ticker];
    totalValue += value;
    if (ticker === 'USDT') {
      stableValue += value;
    } else {
      cryptoCount += 1;
    }
    if (value > topValue) {
      topValue = value;
    }
  }

  if (totalValue <= 0) {
    insights.push({ tone: 'risk', text: 'No funded positions. Add funds to start.' });
    return { walletName, insights };
  }

  const stableRatio = stableValue / totalValue;
  const stakedRatio = stakedValue / totalValue;
  const topRatio = topValue / totalValue;

  if (stableRatio >= 0.7) {
    insights.push({ tone: 'good', text: 'Defensive wallet: mostly stable assets.' });
  } else if (stableRatio <= 0.2) {
    insights.push({ tone: 'warning', text: 'Higher-risk wallet: mostly crypto assets.' });
  } else {
    insights.push({ tone: 'good', text: 'Balanced mix of stable and crypto assets.' });
  }

  if (cryptoCount <= 1 || topRatio >= 0.6) {
    insights.push({ tone: 'warning', text: 'Concentration is high. One asset dominates.' });
  } else if (stakedRatio >= 0.5) {
    insights.push({ tone: 'warning', text: 'Large share is locked in staking.' });
  } else {
    insights.push({ tone: 'good', text: 'Structure looks healthy and diversified.' });
  }

  return { walletName, insights };
};

const WalletDashboard = () => {
  const { user, loading } = useAuth();
  const [xp, setXp] = useState<number>(0);
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>('');
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>({ type: '', message: '' });

  const [selectedWalletForEvaluation, setSelectedWalletForEvaluation] = useState<wallet | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');
  const [walletEvaluation, setWalletEvaluation] = useState<WalletEvaluation | null>(null);

  const refreshData = useCallback(async () => {
    if (!user) {
      setXp(0);
      setWallets([]);
      return;
    }

    const [nextXp, nextWallets] = await Promise.all([fetchXp(user), fetchWallets(user)]);
    setXp(nextXp);
    setWallets(nextWallets);
  }, [user]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const closeWalletEvaluation = () => {
    setSelectedWalletForEvaluation(null);
    setEvaluationLoading(false);
    setEvaluationError('');
    setWalletEvaluation(null);
  };

  const openWalletEvaluation = async (walletItem: wallet) => {
    setSelectedWalletForEvaluation(walletItem);
    setEvaluationLoading(true);
    setEvaluationError('');
    setWalletEvaluation(null);

    try {
      const [positions, stakes] = await Promise.all([
        fetchWalletAssets(walletItem.walletid),
        fetchWalletStakes([walletItem.walletid], 'active'),
      ]);

      const nextEvaluation = evaluateWallet(walletItem.name, positions, stakes);
      setWalletEvaluation(nextEvaluation);
    } catch {
      setEvaluationError('Unable to evaluate this wallet right now. Please try again.');
    } finally {
      setEvaluationLoading(false);
    }
  };

  async function handleCreateWallet() {
    if (!user || !walletName.trim()) {
      return;
    }

    setIsSubmittingCreate(true);
    setNotice({ type: '', message: '' });

    try {
      await createWallet(user, walletName.trim());
      setWalletName('');
      setIsCreating(false);
      setNotice({ type: 'Success', message: 'Wallet created.' });
      await refreshData();
    } catch {
      setNotice({ type: 'Error', message: 'Failed to create wallet.' });
    } finally {
      setIsSubmittingCreate(false);
    }
  }

  async function handleDeleteWallet(walletItem: wallet) {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Delete wallet "${walletItem.name}"? This will remove all wallet assets, trades and stakes.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingWalletId(walletItem.walletid);
    setNotice({ type: '', message: '' });

    try {
      const result = await deleteWallet(user, walletItem.walletid);
      if (!result.ok) {
        setNotice({ type: 'Error', message: result.error ?? 'Failed to delete wallet.' });
        return;
      }

      if (selectedWalletForEvaluation?.walletid === walletItem.walletid) {
        closeWalletEvaluation();
      }

      setNotice({ type: 'Success', message: 'Wallet deleted.' });
      await refreshData();
    } finally {
      setDeletingWalletId(null);
    }
  }

  if (loading) {
    return <div className="px-6 md:px-10 pb-10">Loading...</div>;
  }

  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Hi, {user?.user_metadata.username}!
          </h1>
          <div className="flex items-center gap-3">
            <Button size="md" variant="green" onClick={() => setIsCreating(true)}>
              Create New Wallet
            </Button>
            <div className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">
              <span className="font-semibold">Total XP:</span>
              <span className="ml-1">{xp}</span>
            </div>
          </div>
        </div>

        {notice.message !== '' && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.type === 'Error'
                ? 'border-red-300 text-red-700'
                : 'border-green-300 text-green-700'
            }`}
          >
            {notice.message}
          </div>
        )}

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wallets</h2>
            <p className="text-xs text-[var(--muted-text-color)]">Click a wallet to run portfolio evaluation</p>
          </div>

          {wallets.length === 0 ? (
            <div className="text-sm text-[var(--muted-text-color)]">
              You have no wallets yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((walletItem) => (
                <div
                  key={walletItem.walletid}
                  className="rounded-lg border border-[var(--border-color)] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => void openWalletEvaluation(walletItem)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        void openWalletEvaluation(walletItem);
                      }
                    }}
                    className="min-w-0 flex-1 cursor-pointer rounded-md p-1 text-left focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
                  >
                    <p className="font-medium">{walletItem.name}</p>
                    <p className="text-xs text-[var(--muted-text-color)]">ID: {walletItem.walletid}</p>
                 
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="!m-0"
                      onClick={() => void openWalletEvaluation(walletItem)}
                    >
                      Evaluate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="red"
                      className="!m-0 w-fit"
                      onClick={() => void handleDeleteWallet(walletItem)}
                      disabled={deletingWalletId === walletItem.walletid || isSubmittingCreate}
                    >
                      {deletingWalletId === walletItem.walletid ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedWalletForEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-300 bg-white p-5 md:p-6 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted-text-color)]">Portfolio Evaluation</p>
                <h2 className="text-2xl font-semibold mt-1">{selectedWalletForEvaluation.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeWalletEvaluation}
                className="!m-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-900 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {evaluationLoading && (
              <div className="mt-6 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm">
                Evaluating wallet distribution and risk profile...
              </div>
            )}

            {!evaluationLoading && evaluationError !== '' && (
              <div className="mt-6 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
                {evaluationError}
              </div>
            )}

            {!evaluationLoading && evaluationError === '' && walletEvaluation && (
              <section className="mt-6 rounded-xl border border-gray-300 bg-white p-4 space-y-3">
                <h3 className="text-lg font-semibold">Feedback</h3>
                {walletEvaluation.insights.map((insight, index) => {
                  const rowClass =
                    insight.tone === 'good'
                      ? 'border-gray-300 bg-gray-50'
                      : insight.tone === 'warning'
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 bg-gray-50';

                  return (
                    <div key={index} className={`rounded-md border p-3 text-sm ${rowClass}`}>
                      {insight.text}
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Create Wallet</h2>
            <input
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Wallet name"
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsCreating(false)}
                disabled={isSubmittingCreate}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="green"
                onClick={() => void handleCreateWallet()}
                disabled={!walletName.trim() || isSubmittingCreate}
              >
                {isSubmittingCreate ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
