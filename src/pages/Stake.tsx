import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../Components/Button';
import Tooltip from '../Components/Tooltip';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import stakeProvidersByChain from '../data/stakeProviders';
import { coinNameToTicker } from '../data/tickers';
import { CHAINS } from '../lib/chainStakeData';
import { healthToStatus } from '../lib/healthToStatus';
import type { StakeMessage } from '../types/stakeUi';
import type { wallet } from '../types/Wallet';
import placeStake from '../utils/actions/placeStake';
import fetchWalletStakes, { type WalletStake } from '../utils/FetchWalletStakes';
import { fetchStakeWalletData } from '../utils/stakePageUtils';
import sellStake from '../utils/actions/sellStake';

const formatCurrency = (value: number) => Number(value || 0).toLocaleString();

const inputClass =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 py-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-gray-400/30';

const healthMap = {
  healthy: { label: 'Online', className: 'stake-status-healthy' },
  busy: { label: 'Busy', className: 'stake-status-busy' },
  congested: { label: 'Congested', className: 'stake-status-congested' },
  degraded: { label: 'Degraded', className: 'stake-status-degraded' },
  incident: { label: 'Incident', className: 'stake-status-incident' },
} as const;

const getTicker = (chainName: string) =>
  coinNameToTicker[chainName.toLowerCase()] ?? chainName.slice(0, 3).toUpperCase();

const getLockDays = (ticker: string) => {
  const normalizedTicker = ticker.toUpperCase();
  for (const chain of CHAINS) {
    if (getTicker(chain.name) === normalizedTicker) {
      return chain.staking.lockupDays;
    }
  }

  return 0;
};

const getDaysLeft = (createdAt: string, lockupDays: number) => {
  const createdTime = new Date(createdAt).getTime();
  const elapsedDays = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  const remaining = lockupDays - elapsedDays;
  return remaining > 0 ? remaining : 0;
};

const Stake = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [chainName, setChainName] = useState<string | null>(null);
  const [validatorId, setValidatorId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [walletList, setWalletList] = useState<wallet[]>([]);
  const [stakeList, setStakeList] = useState<WalletStake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amountText, setAmountText] = useState('10000');
  const [percentText, setPercentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingStake, setIsSavingStake] = useState(false);
  const [sellingId, setSellingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<StakeMessage>({ type: '', message: '' });
  const [sellStakeItem, setSellStakeItem] = useState<WalletStake | null>(null);
  const [sellDaysLeft, setSellDaysLeft] = useState(0);

  const logoApiKey = import.meta.env.VITE_LOGO_API;

  const chain = CHAINS.find((chainItem) => chainItem.name === chainName) ?? null;
  const validatorOptions = chain ? stakeProvidersByChain[chain.name] ?? [] : [];
  const validator = validatorOptions.find((validatorItem) => validatorItem.id === validatorId) ?? validatorOptions[0] ?? null;
  const wallet = walletList.find((walletItem) => String(walletItem.walletid) === walletId) ?? null;
  const amountValue = Number(amountText);
  const stakeUsd = Number.isFinite(amountValue) ? amountValue : 0;
  const walletUsd = Number(wallet?.usdt_balance ?? 0);

  const onAmountChange = (value: string) => {
    setAmountText(value);

    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || walletUsd <= 0) {
      setPercentText('');
      return;
    }

    const percent = Math.min(100, Math.max(0, (amount / walletUsd) * 100));
    setPercentText(String(Math.round(percent)));
  };

  const onPercentChange = (value: string) => {
    setPercentText(value);

    const percent = Number(value);
    if (!Number.isFinite(percent) || walletUsd <= 0 || percent < 0) {
      setAmountText('');
      return;
    }

    const clampedPercent = Math.min(100, Math.max(0, percent));
    const amount = walletUsd * (clampedPercent / 100);
    setPercentText(String(clampedPercent));
    setAmountText(String(amount));
  };

  const setPercent = (percent: number) => {
    const clamped = Math.min(100, Math.max(0, percent));
    setPercentText(String(clamped));
    setAmountText(String((walletUsd * clamped) / 100));
  };

  const loadPage = async (preferredWalletId: string) => {
    if (!user) {
      setWalletList([]);
      setWalletId('');
      setStakeList([]);
      return;
    }

    setIsLoading(true);
    try {
      const { nextWallets, selectedWalletId } = await fetchStakeWalletData(user, preferredWalletId);
      setWalletList(nextWallets);
      setWalletId(selectedWalletId);

      const walletIds: Array<string | number> = [];
      for (const walletItem of nextWallets) {
        walletIds.push(walletItem.walletid);
      }
      const nextStakes = await fetchWalletStakes(walletIds, 'active');
      setStakeList(nextStakes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setWalletList([]);
      setWalletId('');
      setStakeList([]);
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const { nextWallets, selectedWalletId } = await fetchStakeWalletData(user, '');
        setWalletList(nextWallets);
        setWalletId(selectedWalletId);
        const walletIds: Array<string | number> = [];
        for (const walletItem of nextWallets) {
          walletIds.push(walletItem.walletid);
        }
        const nextStakes = await fetchWalletStakes(walletIds, 'active');
        setStakeList(nextStakes);
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitialData();
  }, [user]);

  const onWalletChange = (nextWalletId: string) => {
    setWalletId(nextWalletId);
  };

  const clearStatusMessage = () => {
    setStatusMessage({ type: '', message: '' });
  };

  const openStakeModal = (nextChainName: string) => {
    const validatorListForChain = stakeProvidersByChain[nextChainName] ?? [];
    setChainName(nextChainName);
    setValidatorId(validatorListForChain[0]?.id ?? '');
    setIsModalOpen(true);
  };

  const submitStake = async () => {
    if (isSavingStake) {
      return;
    }

    setIsSavingStake(true);

    try {
      const chainTicker =
        coinNameToTicker[chain!.name.toLowerCase()] ??
        chain!.name.slice(0, 5).toUpperCase();
      const nextApy = validator?.apy ?? chain!.staking.baseApy;
      const result = await placeStake(user, walletId, chainTicker, stakeUsd, nextApy);

      if (!result.ok) {
        setStatusMessage({
          type: 'Error',
          message: result.error ?? 'Failed to submit stake.',
        });
        return;
      }

      setIsModalOpen(false);
      setAmountText('10000');
      setPercentText('');
      setStatusMessage({ type: 'Success', message: 'Stake submitted and wallet balance updated.' });
      await loadPage(walletId);
    } finally {
      setIsSavingStake(false);
    }
  };

  const askSellStake = (stake: WalletStake, daysLeft: number) => {
    setSellStakeItem(stake);
    setSellDaysLeft(daysLeft);
  };

  const closeSellPopup = () => {
    if (sellingId !== null) {
      return;
    }
    setSellStakeItem(null);
    setSellDaysLeft(0);
  };

  const sellOneStake = async (stake: WalletStake, daysLeft: number) => {
    if (!user || sellingId !== null) {
      return;
    }

    setSellingId(stake.stakeid);
    try {
      const result = await sellStake(stake.stakeid, daysLeft);

      if (!result.ok) {
        setStatusMessage({
          type: 'Error',
          message: result.error ?? 'Failed to sell this stake.',
        });
        return;
      }

      if (result.isEarlySell) {
        setStatusMessage({
          type: 'Success',
          message: `Stake sold early. $${formatCurrency(result.amountBack ?? 0)} returned after $${formatCurrency(result.feeAmount ?? 0)} penalty.`,
        });
      } else {
        setStatusMessage({
          type: 'Success',
          message: `Stake sold. $${formatCurrency(result.amountBack ?? 0)} returned to your wallet.`,
        });
      }

      await loadPage(walletId);
      setSellStakeItem(null);
      setSellDaysLeft(0);
    } finally {
      setSellingId(null);
    }
  };

  const closeStakeModal = () => {
    setIsModalOpen(false);
  };

  const chainHealth = chain ? healthToStatus(chain.network.avgHealth) : null;
  const healthView =
    chainHealth === 'healthy'
      ? healthMap.healthy
      : chainHealth === 'busy'
      ? healthMap.busy
      : chainHealth === 'congested'
      ? healthMap.congested
      : chainHealth === 'degraded'
      ? healthMap.degraded
      : healthMap.incident;

  return (
    <div className="">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="p-6 md:p-8 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end rounded-xl ">
          <div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold">Stake</h1>
            <p className="mt-3 text-sm md:text-base max-w-2xl">
              Earn rewards on idle assets while helping secure major blockchain networks.
            </p>
            <div className="mt-4 inline-flex rounded-full border px-3 py-1 text-sm">
              <Tooltip text="Lock up your crypto to help secure the network and earn staking rewards in return." position="bottom">
                What is staking?
              </Tooltip>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {CHAINS.map((chainItem) => {
            const ticker = coinNameToTicker[chainItem.name.toLowerCase()] ?? chainItem.name.slice(0, 3).toUpperCase();

            return (
              <div
                key={chainItem.name}
                className={`rounded-2xl border p-4 md:p-5 shadow-sm ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={`https://img.logokit.com/crypto/${ticker}?token=${logoApiKey}`}
                        alt={`${chainItem.name} logo`}
                        className="w-11 h-11 "
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-lg truncate">{chainItem.name}</p>
                        <p className="text-sm">
                          Lock-up {chainItem.staking.lockupDays}d · Unbond {chainItem.staking.unbondingDays}d
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs">Rewards vary by validator and network conditions.</p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="!m-0 inline-flex flex-nowrap items-center gap-1 whitespace-nowrap"
                      onClick={() => openStakeModal(chainItem.name)}
                    >
                      Stake
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className={`rounded-2xl border p-4 md:p-5 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <h3 className="text-2xl font-semibold">Active Stakes</h3>

          {isLoading ? (
            <p className="mt-3 text-sm">Loading active stakes...</p>
          ) : stakeList.length === 0 ? (
            <p className="mt-3 text-sm">No active stakes yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {stakeList.map((stake) => {
                const walletName =
                  walletList.find((walletItem) => Number(walletItem.walletid) === Number(stake.walletid))?.name ??
                  `Wallet ${stake.walletid}`;
                const ticker = String(stake.ticker ?? '').toUpperCase();
                const lockupDays = getLockDays(stake.ticker);
                const remainingLockupDays = getDaysLeft(stake.createdat, lockupDays);
                const isSellingThisStake = sellingId === stake.stakeid;

                return (
                  <div
                    key={stake.stakeid}
                    className={`w-full rounded-xl border p-4 text-left ${isDark ? 'border-gray-600' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-11 w-11 rounded-lg border overflow-hidden ${isDark ? 'border-gray-500' : 'border-gray-300'}`}>
                          <img
                            src={`https://img.logokit.com/crypto/${ticker}?token=${logoApiKey}`}
                            alt={`${ticker} logo`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-semibold leading-tight">{ticker}</p>
                          <p className="text-sm opacity-80 truncate">Wallet: {walletName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="text-2xl font-semibold">${formatCurrency(stake.quantity)}</p>
                          <p className="text-sm opacity-80">APY {stake.apy}%</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="red"
                          className="!m-0 min-w-[84px]"
                          onClick={() => askSellStake(stake, remainingLockupDays)}
                          disabled={sellingId !== null}
                        >
                          {isSellingThisStake ? 'Selling...' : 'Sell'}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className={`text-sm font-medium ${remainingLockupDays > 0 ? 'text-gray-600' : 'text-green-600'}`}>
                        {remainingLockupDays > 0 ? `${remainingLockupDays}d lock-up left` : 'Lock-up complete'}
                      </p>
                      <p className="text-sm opacity-80">Started {new Date(stake.createdat).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && chain && (
        <div className="stake-modal-overlay fixed inset-0 z-50 flex items-center overflow-auto justify-center p-4">
          <div className="stake-modal-panel w-full max-w-2xl rounded-3xl border p-6">
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-2xl font-semibold mt-1">Stake {chain.name}</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet</label>
                <select
                  value={walletId}
                  onChange={(event) => {
                    void onWalletChange(event.target.value);
                  }}
                  className={inputClass}
                  disabled={isLoading || isSavingStake}
                >
                  {isLoading ? (
                    <option value="">Loading wallets...</option>
                  ) : walletList.length === 0 ? (
                    <option value="">No wallets found</option>
                  ) : (
                    walletList.map((walletItem) => (
                      <option key={walletItem.walletid} value={walletItem.walletid}>
                        {walletItem.name} - ${formatCurrency(walletItem.usdt_balance ?? 0)}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs">Available USDT: ${formatCurrency(walletUsd)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Validator</label>
                <select
                  value={validator?.id ?? ''}
                  onChange={(event) => setValidatorId(event.target.value)}
                  className={inputClass}
                  disabled={isSavingStake}
                >
                  {validatorOptions.map((validatorItem) => (
                    <option key={validatorItem.id} value={validatorItem.id}>
                      {validatorItem.name} - {validatorItem.apy}% APY
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stake-modal-subpanel mt-4 rounded-2xl border p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Projected APY</span>
                <span className="font-semibold">{validator?.apy ?? chain.staking.baseApy}%</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Network Status</span>
                <span className={`font-semibold ${healthView.className}`}>
                  {healthView.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Unbonding Period</span>
                <span className="font-semibold">{chain.staking.unbondingDays}d</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <div className="rounded-xl border px-3 py-2 flex items-center justify-between">
                <span className="text-xl font-semibold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountText}
                  onChange={(event) => onAmountChange(event.target.value)}
                  className="w-full bg-transparent text-right text-xl font-semibold focus:outline-none"
                  placeholder="0.00"
                  disabled={isSavingStake}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="rounded-xl border px-3 py-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={percentText}
                    onChange={(event) => onPercentChange(event.target.value)}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                    placeholder="Percentage"
                    disabled={isSavingStake}
                  />
                  <span className="text-sm font-semibold">%</span>
                </div>
                <div className="flex items-center gap-1">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      className="stake-modal-subpanel !m-0 rounded-lg border px-2 py-1 text-xs"
                      onClick={() => setPercent(percent)}
                      disabled={isSavingStake}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="stake-modal-subpanel mt-4 flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Lock-up: {chain.staking.lockupDays} days</span>
              </div>
              <Tooltip
                text={`You will not be able to access these funds for ${chain.staking.lockupDays} days after staking.`}
                position="top"
              >
                Details
              </Tooltip>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" size="sm" variant="secondary" onClick={closeStakeModal} disabled={isSavingStake} className="!m-0">
                Close
              </Button>
              <Button
                type="button"
                variant="green"
                size="sm"
                onClick={submitStake}
                disabled={isSavingStake}
                className="!m-0"
              >
                Stake
              </Button>
            </div>
          </div>
        </div>
      )}

      {sellStakeItem && (
        <div className="trade-confirm-overlay fixed inset-0 z-50 grid place-items-center px-4">
          <div className="trade-confirm-panel">
            <h2 className="text-lg font-semibold">Confirm Sell</h2>
            <p className="trade-confirm-copy mt-2 text-sm">
              {sellDaysLeft > 0
                ? `This stake still has ${sellDaysLeft} day(s) left. Selling now applies a 10% penalty.`
                : 'Sell this active stake and move funds back to your wallet?'}
            </p>
            <div className="trade-confirm-summary mt-4 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span>Asset</span>
                <span className="font-medium">{sellStakeItem.ticker}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span>Amount</span>
                <span className="font-medium">${formatCurrency(sellStakeItem.quantity)}</span>
              </div>
              {sellDaysLeft > 0 && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>Penalty</span>
                  <span className="font-medium">10%</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={closeSellPopup}
                disabled={sellingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="red"
                onClick={() => {
                  void sellOneStake(sellStakeItem, sellDaysLeft);
                }}
                disabled={sellingId !== null}
              >
                {sellingId !== null ? 'Selling...' : 'Confirm Sell'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {statusMessage.message !== '' && (
        <div className="trade-confirm-overlay fixed inset-0 z-50 grid place-items-center px-4">
          <div className="trade-confirm-panel relative min-h-[10rem] ">
            <div className="flex items-center gap-3">
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    statusMessage.type === 'Error' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {statusMessage.type === 'Error' ? 'Stake Not Completed' : 'Stake Completed'}
                </h2>
              </div>
            </div>

            <p className="trade-confirm-copy mt-4 text-sm">
              {statusMessage.message}
            </p>
            <Button
              type="button"
              onClick={clearStatusMessage}
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 rounded-full text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stake;
