import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, CircleAlert, ShieldCheck, Wallet2, X } from 'lucide-react';
import Button from '../Button';
import Tooltip from '../Tooltip';
import { useAuth } from '../../hooks/useAuth';
import stakeProvidersByChain from '../../data/stakeProviders';
import { coinNameToTicker } from '../../data/tickers';
import { CHAINS } from '../../lib/chainStakeData';
import { healthToStatus } from '../../lib/healthToStatus';
import type { StakeMessage, StakeReceipt } from '../../types/stakeUi';
import type { wallet } from '../../types/Wallet';
import type { WalletStake } from '../../utils/FetchWalletStakes';
import placeStake from '../../utils/actions/placeStake';
import sellStake from '../../utils/actions/sellStake';
import {
  fetchStakeWalletData,
  getStakeChainNameFromTicker,
  getStakeLockupDaysFromTicker,
  resolveStakeWalletId,
} from '../../utils/stakePageUtils';

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toSpendableAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor((value + Number.EPSILON) * 100) / 100;
};

const formatInputNumber = (value: number) => toSpendableAmount(value).toFixed(2).replace(/\.00$/, '');

const fieldClassName =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/30';

const surfaceTone = { backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' } as const;
const mutedSurfaceTone = { backgroundColor: 'var(--muted-surface-color)', borderColor: 'var(--border-color)' } as const;
const textTone = { color: 'var(--text-color)' } as const;
const mutedTextTone = { color: 'var(--muted-text-color)' } as const;

const networkStatusMap = {
  healthy: { label: 'Online', className: 'text-emerald-600 dark:text-emerald-400' },
  busy: { label: 'Busy', className: 'text-yellow-600 dark:text-yellow-400' },
  congested: { label: 'Congested', className: 'text-orange-600 dark:text-orange-400' },
  degraded: { label: 'Degraded', className: 'text-red-600 dark:text-red-400' },
  incident: { label: 'Incident', className: 'text-red-600 dark:text-red-400' },
} as const;

const StakePanels = () => {
  const { user } = useAuth();
  const [selectedChainName, setSelectedChainName] = useState<string | null>(null);
  const [selectedValidatorId, setSelectedValidatorId] = useState('');
  const [selectedWalletID, setSelectedWalletID] = useState('');
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [walletStakes, setWalletStakes] = useState<WalletStake[]>([]);
  const [walletDataLoading, setWalletDataLoading] = useState(false);
  const [amountInput, setAmountInput] = useState('10000');
  const [percentageInput, setPercentageInput] = useState('');
  const [amountMode, setAmountMode] = useState<'usd' | 'percent'>('usd');
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submittingStake, setSubmittingStake] = useState(false);
  const [sellConfirmStake, setSellConfirmStake] = useState<WalletStake | null>(null);
  const [sellingStakeId, setSellingStakeId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<StakeReceipt | null>(null);
  const [message, setMessage] = useState<StakeMessage>({ type: '', message: '' });

  const logoToken = import.meta.env.VITE_LOGO_API;

  const selectedChain = CHAINS.find((chain) => chain.name === selectedChainName) ?? null;
  const validators = selectedChain ? stakeProvidersByChain[selectedChain.name] ?? [] : [];
  const selectedValidator = validators.find((validator) => validator.id === selectedValidatorId) ?? validators[0] ?? null;
  const selectedWallet = wallets.find((walletItem) => String(walletItem.walletid) === selectedWalletID) ?? null;
  const parsedAmount = Number.parseFloat(amountInput);
  const parsedPercentage = Number.parseFloat(percentageInput);
  const percentageOverLimit = Number.isFinite(parsedPercentage) && parsedPercentage > 100;
  const numericAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const availableWalletUSDT = toSpendableAmount(selectedWallet?.usdt_balance ?? 0);
  const activeStakesForSelectedWallet = walletStakes.filter(
    (stake) => String(stake.walletid) === selectedWalletID && stake.status === 'active',
  );
  const totalActiveStakeUSD = activeStakesForSelectedWallet.reduce((acc, stake) => acc + Number(stake.quantity ?? 0), 0);

  const handleAmountChange = (value: string) => {
    setAmountMode('usd');
    setAmountInput(value);

    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount) || amount <= 0 || availableWalletUSDT <= 0) {
      setPercentageInput('');
      return;
    }

    const percent = Math.min(100, Math.max(0, (amount / availableWalletUSDT) * 100));
    setPercentageInput(percent.toFixed(2).replace(/\.00$/, ''));
  };

  const handlePercentageChange = (value: string) => {
    setAmountMode('percent');
    setPercentageInput(value);

    const percent = Number.parseFloat(value);
    if (!Number.isFinite(percent) || availableWalletUSDT <= 0) {
      setAmountInput('');
      return;
    }

    if (percent > 100) {
      setAmountInput('');
      return;
    }

    const clamped = Math.min(100, Math.max(0, percent));
    const amount = (availableWalletUSDT * clamped) / 100;
    setAmountInput(formatInputNumber(amount));
  };

  const applyPercentage = (percent: number) => {
    setAmountMode('percent');
    const clamped = Math.min(100, Math.max(0, percent));
    setPercentageInput(String(clamped));
    setAmountInput(formatInputNumber((availableWalletUSDT * clamped) / 100));
  };

  const getStakeLockupDays = (stake: WalletStake) => getStakeLockupDaysFromTicker(stake.ticker);
  const getStakeChainName = (stake: WalletStake) => getStakeChainNameFromTicker(stake.ticker);

  const loadWalletData = async (preferredWalletId: string) => {
    if (!user) {
      setWallets([]);
      setWalletStakes([]);
      setSelectedWalletID('');
      return;
    }

    setWalletDataLoading(true);
    try {
      const { nextWallets, nextWalletStakes } = await fetchStakeWalletData(user);
      setWallets(nextWallets);
      setWalletStakes(nextWalletStakes);
      setSelectedWalletID(resolveStakeWalletId(nextWallets, preferredWalletId));
    } finally {
      setWalletDataLoading(false);
    }
  };

  const refreshWalletData = async () => {
    await loadWalletData(selectedWalletID);
  };

  useEffect(() => {
    if (!user) {
      setWallets([]);
      setWalletStakes([]);
      setSelectedWalletID('');
      return;
    }

    const loadInitialData = async () => {
      setWalletDataLoading(true);
      try {
        const { nextWallets, nextWalletStakes } = await fetchStakeWalletData(user);
        setWallets(nextWallets);
        setWalletStakes(nextWalletStakes);
        setSelectedWalletID((currentWalletId) => resolveStakeWalletId(nextWallets, currentWalletId));
      } finally {
        setWalletDataLoading(false);
      }
    };

    void loadInitialData();
  }, [user]);

  useEffect(() => {
    if (message.message === '') {
      return;
    }

    const timeoutId = window.setTimeout(() => setMessage({ type: '', message: '' }), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [message.message]);

  useEffect(() => {
    if (amountMode !== 'percent') {
      return;
    }

    const percent = Number.parseFloat(percentageInput);
    if (!Number.isFinite(percent) || availableWalletUSDT <= 0 || percent > 100) {
      return;
    }

    const clamped = Math.min(100, Math.max(0, percent));
    setAmountInput(formatInputNumber((availableWalletUSDT * clamped) / 100));
  }, [availableWalletUSDT, percentageInput, amountMode]);

  const canSubmitStake = Boolean(
    selectedChain &&
      selectedValidator &&
      selectedWallet &&
      !percentageOverLimit &&
      numericAmount > 0 &&
      numericAmount <= availableWalletUSDT &&
      !submittingStake,
  );

  const selectChain = (chainName: string) => {
    const nextValidators = stakeProvidersByChain[chainName] ?? [];
    setSelectedChainName(chainName);
    setSelectedValidatorId(nextValidators[0]?.id ?? '');
    setStakeModalOpen(true);
  };

  const requestStake = () => {
    if (!selectedWallet) {
      setMessage({ type: 'Error', message: 'Select a wallet before staking.' });
      return;
    }

    if (percentageOverLimit) {
      setMessage({ type: 'Error', message: 'Stake percentage cannot be greater than 100%.' });
      return;
    }

    if (numericAmount > availableWalletUSDT) {
      setMessage({ type: 'Error', message: 'Stake amount exceeds wallet USDT balance.' });
      return;
    }

    if (!canSubmitStake) {
      setMessage({ type: 'Error', message: 'Enter a valid amount and try again.' });
      return;
    }

    setConfirmOpen(true);
  };

  const confirmStake = async () => {
    if (!selectedChain || !selectedValidator || !selectedWallet) {
      return;
    }

    setSubmittingStake(true);

    try {
      const chainTicker = coinNameToTicker[selectedChain.name.toLowerCase()] ?? selectedChain.name.slice(0, 5).toUpperCase();
      const result = await placeStake(user, selectedWalletID, chainTicker, numericAmount, selectedValidator.apy);

      if (!result.ok) {
        setMessage({
          type: 'Error',
          message: result.error ?? 'Failed to submit stake.',
        });
        return;
      }

      setReceipt({
        chainName: selectedChain.name,
        validatorName: selectedValidator.name,
        walletName: selectedWallet.name,
        amount: numericAmount,
        apy: selectedValidator.apy,
        lockupDays: selectedChain.staking.lockupDays,
      });
      setConfirmOpen(false);
      setStakeModalOpen(false);
      setAmountInput('10000');
      setPercentageInput('');
      setAmountMode('usd');
      setMessage({ type: 'Success', message: 'Stake submitted and wallet balance updated.' });
      await refreshWalletData();
    } finally {
      setSubmittingStake(false);
    }
  };

  const closeStakeModal = () => {
    if (submittingStake) {
      return;
    }
    setStakeModalOpen(false);
    setConfirmOpen(false);
  };

  const requestSellStake = (stake: WalletStake) => {
    const lockupDays = getStakeLockupDays(stake);
    if (lockupDays !== 0) {
      setMessage({ type: 'Error', message: `This stake cannot be sold yet. Lock-up is ${lockupDays} days.` });
      return;
    }
    setSellConfirmStake(stake);
  };

  const confirmSellStake = async () => {
    if (!sellConfirmStake) {
      return;
    }

    const lockupDays = getStakeLockupDays(sellConfirmStake);
    setSellingStakeId(sellConfirmStake.stakeid);

    try {
      const result = await sellStake(sellConfirmStake.stakeid, lockupDays);
      if (!result.ok) {
        setMessage({ type: 'Error', message: result.error ?? 'Failed to sell staked funds.' });
        return;
      }

      setMessage({ type: 'Success', message: 'Staked funds sold and moved back to available wallet balance.' });
      setSellConfirmStake(null);
      await refreshWalletData();
    } finally {
      setSellingStakeId(null);
    }
  };

  const networkStatus = selectedChain ? healthToStatus(selectedChain.network.avgHealth) : null;
  const networkView =
    networkStatus === 'healthy'
      ? networkStatusMap.healthy
      : networkStatus === 'busy'
      ? networkStatusMap.busy
      : networkStatus === 'congested'
      ? networkStatusMap.congested
      : networkStatus === 'degraded'
      ? networkStatusMap.degraded
      : networkStatusMap.incident;

  return (
    <div className="px-6 md:px-10 pb-12" style={textTone}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-3xl border shadow-sm" style={surfaceTone}>
          <div className="p-6 md:p-8 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em]" style={mutedTextTone}>Staking Hub</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-semibold" style={textTone}>Stake</h1>
              <p className="mt-3 text-sm md:text-base max-w-2xl" style={mutedTextTone}>Earn rewards on idle assets while helping secure major blockchain networks.</p>
              <div className="mt-4 inline-flex rounded-full border px-3 py-1 text-sm" style={{ ...mutedSurfaceTone, ...mutedTextTone }}>
                <Tooltip text="Lock up your crypto to help secure the network and earn staking rewards in return.">
                  What is staking?
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border p-4" style={mutedSurfaceTone}>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={mutedTextTone}>
                  <Wallet2 className="w-4 h-4" />
                  Available
                </div>
                <p className="mt-2 text-lg font-semibold" style={textTone}>${formatCurrency(availableWalletUSDT)}</p>
                <p className="mt-1 text-xs" style={mutedTextTone}>{selectedWallet?.name ?? 'No wallet selected'}</p>
              </div>
              <div className="rounded-2xl border p-4" style={mutedSurfaceTone}>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={mutedTextTone}>
                  <ShieldCheck className="w-4 h-4" />
                  Active Staked
                </div>
                <p className="mt-2 text-lg font-semibold" style={textTone}>${formatCurrency(totalActiveStakeUSD)}</p>
                <p className="mt-1 text-xs" style={mutedTextTone}>{activeStakesForSelectedWallet.length} position{activeStakesForSelectedWallet.length === 1 ? '' : 's'}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {CHAINS.map((chain) => {
            const ticker = coinNameToTicker[chain.name.toLowerCase()] ?? chain.name.slice(0, 3).toUpperCase();
            const isSelected = chain.name === selectedChainName;

            return (
              <div
                key={chain.name}
                className={`rounded-2xl border p-4 md:p-5 transition-all shadow-sm hover:opacity-95 ${isSelected ? 'ring-2 ring-blue-500/30' : ''}`}
                style={isSelected ? mutedSurfaceTone : surfaceTone}
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={`https://img.logokit.com/crypto/${ticker}?token=${logoToken}`}
                        alt={`${chain.name} logo`}
                        className="w-11 h-11 rounded-full border"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-lg truncate" style={textTone}>{chain.name}</p>
                        <p className="text-sm" style={mutedTextTone}>Lock-up {chain.staking.lockupDays}d · Unbond {chain.staking.unbondingDays}d</p>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold" style={{ ...mutedSurfaceTone, ...mutedTextTone }}>
                      {chain.staking.baseApy.toFixed(1)}% APY
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs" style={mutedTextTone}>Rewards vary by validator and network conditions.</p>
                    <Button
                      type="button"
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      className="!m-0 inline-flex flex-nowrap items-center gap-1 whitespace-nowrap"
                      onClick={() => selectChain(chain.name)}
                    >
                      Stake
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {selectedWallet && (
          <section className="rounded-3xl border p-5 md:p-6 shadow-sm space-y-4" style={surfaceTone}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl md:text-2xl font-semibold" style={textTone}>Active Stakes</h2>
              <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium" style={{ ...mutedSurfaceTone, ...mutedTextTone }}>
                {selectedWallet.name}
              </span>
            </div>

            {activeStakesForSelectedWallet.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm" style={{ ...mutedSurfaceTone, ...mutedTextTone }}>
                No active stakes in this wallet yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeStakesForSelectedWallet.map((stake) => (
                  <div
                    key={stake.stakeid}
                    className="rounded-2xl border px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    style={mutedSurfaceTone}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl text-sm font-semibold grid place-items-center" style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-color)' }}>
                        {stake.ticker.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold" style={textTone}>{getStakeChainName(stake)}</p>
                        <p className="text-xs" style={mutedTextTone}>
                          APY {Number(stake.apy).toFixed(1)}% · Lock-up {getStakeLockupDays(stake)}d
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="text-right">
                        <p className="font-semibold" style={textTone}>${formatCurrency(Number(stake.quantity))}</p>
                        <p className="text-xs" style={mutedTextTone}>{new Date(stake.createdat).toLocaleDateString()}</p>
                      </div>

                      {getStakeLockupDays(stake) === 0 ? (
                        <Button
                          type="button"
                          variant="red"
                          size="sm"
                          className="!m-0"
                          onClick={() => requestSellStake(stake)}
                          disabled={sellingStakeId === stake.stakeid || submittingStake}
                        >
                          {sellingStakeId === stake.stakeid ? 'Selling...' : 'Sell'}
                        </Button>
                      ) : (
                        <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium" style={{ ...mutedSurfaceTone, ...mutedTextTone }}>
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {receipt && (
          <section className="rounded-3xl border p-5 md:p-6 shadow-sm space-y-4" style={surfaceTone}>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-xl">Stake submitted</h3>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Wallet</p>
                <p className="font-semibold mt-1" style={textTone}>{receipt.walletName}</p>
              </div>
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Network</p>
                <p className="font-semibold mt-1" style={textTone}>{receipt.chainName}</p>
              </div>
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Validator</p>
                <p className="font-semibold mt-1" style={textTone}>{receipt.validatorName}</p>
              </div>
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Amount</p>
                <p className="font-semibold mt-1" style={textTone}>${formatCurrency(receipt.amount)}</p>
              </div>
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Estimated APY</p>
                <p className="font-semibold mt-1" style={textTone}>{receipt.apy.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border px-3 py-2" style={mutedSurfaceTone}>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Lock-up</p>
                <p className="font-semibold mt-1" style={textTone}>{receipt.lockupDays} days</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {stakeModalOpen && selectedChain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.7)]" style={surfaceTone}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide" style={mutedTextTone}>Stake Setup</p>
                <h2 className="text-2xl font-semibold mt-1" style={textTone}>Stake {selectedChain.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeStakeModal}
                className="!m-0 rounded-lg border p-2"
                style={{ ...surfaceTone, ...mutedTextTone }}
                disabled={submittingStake}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={textTone}>Wallet</label>
                <select
                  value={selectedWalletID}
                  onChange={(event) => setSelectedWalletID(event.target.value)}
                  className={fieldClassName}
                  disabled={walletDataLoading || submittingStake}
                >
                  {walletDataLoading ? (
                    <option value="">Loading wallets...</option>
                  ) : wallets.length === 0 ? (
                    <option value="">No wallets found</option>
                  ) : (
                    wallets.map((walletItem) => (
                      <option key={walletItem.walletid} value={walletItem.walletid}>
                        {walletItem.name} - ${formatCurrency(walletItem.usdt_balance ?? 0)}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs" style={mutedTextTone}>Available USDT: ${formatCurrency(availableWalletUSDT)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={textTone}>Validator</label>
                <select
                  value={selectedValidator?.id ?? ''}
                  onChange={(event) => setSelectedValidatorId(event.target.value)}
                  className={fieldClassName}
                  disabled={submittingStake}
                >
                  {validators.map((validator) => (
                    <option key={validator.id} value={validator.id}>
                      {validator.name} · {validator.apy.toFixed(1)}% APY
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border p-4 space-y-3" style={mutedSurfaceTone}>
              <div className="flex items-center justify-between text-sm">
                <span style={mutedTextTone}>Projected APY</span>
                <span className="font-semibold" style={textTone}>{selectedValidator?.apy.toFixed(1) ?? selectedChain.staking.baseApy.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span style={mutedTextTone}>Network Status</span>
                <span className={`font-semibold ${networkView.className}`}>{networkView.label}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span style={mutedTextTone}>Unbonding Period</span>
                <span className="font-semibold" style={textTone}>{selectedChain.staking.unbondingDays}d</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium" style={textTone}>Amount (USD)</label>
              <div className="rounded-xl border px-3 py-2 flex items-center justify-between" style={surfaceTone}>
                <span className="text-xl font-semibold" style={textTone}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountInput}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  className="w-full bg-transparent text-right text-xl font-semibold focus:outline-none"
                  style={textTone}
                  placeholder="0.00"
                  disabled={submittingStake}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="rounded-xl border px-3 py-2 flex items-center gap-2" style={surfaceTone}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={percentageInput}
                    onChange={(event) => handlePercentageChange(event.target.value)}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                    style={textTone}
                    placeholder="Percentage"
                    disabled={submittingStake}
                  />
                  <span className="text-sm font-semibold" style={mutedTextTone}>%</span>
                </div>
                <div className="flex items-center gap-1">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      className="!m-0 rounded-lg border px-2 py-1 text-xs"
                      style={{ ...mutedSurfaceTone, ...mutedTextTone }}
                      onClick={() => applyPercentage(percent)}
                      disabled={submittingStake}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
              {percentageOverLimit && (
                <p className="text-xs text-red-600 dark:text-red-400">Percentage cannot be greater than 100%.</p>
              )}
  
                {selectedWallet && numericAmount > availableWalletUSDT && (
                <p className="text-xs text-red-600 dark:text-red-400">Amount exceeds wallet USDT balance.</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={mutedSurfaceTone}>
              <div className="flex items-center gap-2" style={textTone}>
                <AlertTriangle className="w-4 h-4" style={mutedTextTone} />
                <span>Lock-up: {selectedChain.staking.lockupDays} days</span>
              </div>
              <Tooltip text={`You will not be able to access these funds for ${selectedChain.staking.lockupDays} days after staking.`}>
                Details
              </Tooltip>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" size="sm" variant="secondary" onClick={closeStakeModal} disabled={submittingStake} className="!m-0">
                Close
              </Button>
              <Button
                type="button"
                variant="green"
                size="sm"
                onClick={requestStake}
                disabled={!canSubmitStake}
                className="!m-0"
              >
                Stake
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && selectedChain && selectedValidator && selectedWallet && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border p-6 shadow-[0_35px_90px_-45px_rgba(0,0,0,0.75)]" style={surfaceTone}>
            <h2 className="text-xl font-semibold" style={textTone}>Confirm Stake</h2>
            <p className="mt-2 text-sm" style={mutedTextTone}>
              Your funds will be inaccessible for {selectedChain.staking.lockupDays} days once this stake is submitted.
            </p>

            <div className="mt-4 rounded-xl border p-3 text-sm space-y-2" style={mutedSurfaceTone}>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Wallet</span>
                <span className="font-semibold">{selectedWallet.name}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Network</span>
                <span className="font-semibold">{selectedChain.name}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Validator</span>
                <span className="font-semibold">{selectedValidator.name}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Amount</span>
                <span className="font-semibold">${formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Estimated APY</span>
                <span className="font-semibold">{selectedValidator.apy.toFixed(1)}%</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submittingStake} className="!m-0">
                Cancel
              </Button>
              <Button type="button" size="sm" variant="green" onClick={confirmStake} disabled={submittingStake} className="!m-0">
                {submittingStake ? 'Processing...' : 'Confirm Stake'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {sellConfirmStake && (
        <div className="fixed inset-0 z-[56] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border p-6 shadow-[0_35px_90px_-45px_rgba(0,0,0,0.75)]" style={surfaceTone}>
            <h2 className="text-xl font-semibold" style={textTone}>Sell Staked Funds</h2>
            <p className="mt-2 text-sm" style={mutedTextTone}>
              This will move your staked amount back to available wallet balance.
            </p>

            <div className="mt-4 rounded-xl border p-3 text-sm space-y-2" style={mutedSurfaceTone}>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Network</span>
                <span className="font-semibold">{getStakeChainName(sellConfirmStake)}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Amount</span>
                <span className="font-semibold">${formatCurrency(Number(sellConfirmStake.quantity))}</span>
              </div>
              <div className="flex items-center justify-between" style={textTone}>
                <span>Lock-up</span>
                <span className="font-semibold">{getStakeLockupDays(sellConfirmStake)} days</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setSellConfirmStake(null)}
                disabled={sellingStakeId === sellConfirmStake.stakeid}
                className="!m-0"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="red"
                onClick={confirmSellStake}
                disabled={sellingStakeId === sellConfirmStake.stakeid || getStakeLockupDays(sellConfirmStake) !== 0}
                className="!m-0"
              >
                {sellingStakeId === sellConfirmStake.stakeid ? 'Selling...' : 'Sell Funds'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {message.message !== '' && (
        <div className="fixed top-20 right-4 z-[60] w-[min(92vw,24rem)]">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-xl ${
              message.type === 'Error'
                ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <CircleAlert className="w-5 h-5 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{message.type === 'Error' ? 'Action failed' : 'Success'}</p>
                <p className="text-sm mt-1">{message.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setMessage({ type: '', message: '' })}
                className="!m-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakePanels;
