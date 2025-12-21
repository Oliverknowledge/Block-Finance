import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

type Position = {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
};

type StakeStatus = 'active' | 'completed' | 'early_unstaked';

type Stake = {
  id: string;
  symbol: string;
  quantity: number;
  apy: number;
  status: StakeStatus;
  rewardsAccrued: number;
  penaltyApplied: number;
  createdAt: string;
  updatedAt: string;
};

type TradeSide = 'buy' | 'sell';

type TradeRecord = {
  id: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  usdValue: number;
  createdAt: string;
};

type TradingState = {
  usdBalance: number;
  positions: Position[];
  stakes: Stake[];
  trades: TradeRecord[];
};

type TradingContextType = {
  state: TradingState;
  buy: (params: { symbol: string; quantity: number; price: number }) => string | null;
  sell: (params: { symbol: string; quantity: number; price: number }) => string | null;
  stake: (params: {
    symbol: string;
    fromPositionSymbol: string;
    quantity: number;
    apy: number;
  }) => string | null;
  completeStake: (stakeId: string) => void;
};

const DEFAULT_BALANCE = 100_000;

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const blankState: TradingState = {
  usdBalance: DEFAULT_BALANCE,
  positions: [],
  stakes: [],
  trades: [],
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const TradingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<TradingState>(blankState);

  const userId = user?.id ?? null;

  // Load trading state from Supabase when user changes
  useEffect(() => {
    if (!userId) {
      setState(blankState);
      return;
    }

    const load = async () => {
      try {
        const [accountRes, positionsRes, stakesRes, tradesRes] = await Promise.all([
          supabase.from('tblAccounts').select('usd_balance').eq('user_id', userId).maybeSingle(),
          supabase
            .from('tblPositions')
            .select('id, symbol, totalQuantity, AvgBuyPrice')
            .eq('user_id', userId),
          supabase
            .from('tblStakes')
            .select(
              'id, symbol, quantity, apy, status, rewardsAccrued, PenalityApplied, CreatedAt, UpdatedAt'
            )
            .eq('user_id', userId),
          supabase
            .from('tblTrades')
            .select('id, TickerId, Side, Quantity, Price, USDValue, CreatedAt')
            .eq('user_id', userId)
            .order('CreatedAt', { ascending: false }),
        ]);

        const usdBalance =
          (accountRes.data?.usd_balance as number | null | undefined) ?? DEFAULT_BALANCE;

        const positions: Position[] =
          positionsRes.data?.map((row: any) => ({
            id: String(row.id),
            symbol: row.symbol,
            quantity: Number(row.totalQuantity ?? 0),
            avgPrice: Number(row.AvgBuyPrice ?? 0),
          })) ?? [];

        const stakes: Stake[] =
          stakesRes.data?.map((row: any) => ({
            id: String(row.id),
            symbol: row.symbol,
            quantity: Number(row.quantity ?? 0),
            apy: Number(row.apy ?? 0),
            status: row.status as StakeStatus,
            rewardsAccrued: Number(row.rewardsAccrued ?? 0),
            penaltyApplied: Number(row.PenalityApplied ?? 0),
            createdAt: row.CreatedAt,
            updatedAt: row.UpdatedAt,
          })) ?? [];

        const trades: TradeRecord[] =
          tradesRes.data?.map((row: any) => ({
            id: String(row.id),
            symbol: row.TickerId,
            side: (row.Side?.toLowerCase() ?? 'buy') as TradeSide,
            quantity: Number(row.Quantity ?? 0),
            price: Number(row.Price ?? 0),
            usdValue: Number(row.USDValue ?? 0),
            createdAt: row.CreatedAt,
          })) ?? [];

        setState({
          usdBalance,
          positions,
          stakes,
          trades,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load trading state from Supabase', err);
        setState(blankState);
      }
    };

    void load();
  }, [userId]);

  // Helper to persist single trade + derived state to Supabase
  const persistAfterTrade = useCallback(
    async (
      nextState: TradingState,
      params: { symbol: string; side: TradeSide; quantity: number; price: number }
    ) => {
      if (!userId) return;
      const { symbol, side, quantity, price } = params;
      const usdValue = quantity * price;

      await Promise.all([
        supabase
          .from('tblAccounts')
          .upsert({ user_id: userId, usd_balance: nextState.usdBalance })
          .eq('user_id', userId),
        supabase.from('tblPositions').upsert(
          nextState.positions.map((p) => ({
            id: p.id,
            user_id: userId,
            symbol: p.symbol,
            totalQuantity: p.quantity,
            AvgBuyPrice: p.avgPrice,
          })),
        ),
        supabase.from('tblTrades').insert({
          user_id: userId,
          TickerId: symbol,
          Side: side.toUpperCase(),
          Quantity: quantity,
          Price: price,
          USDValue: usdValue,
        }),
      ]);
    },
    [userId]
  );

  const persistStakes = useCallback(
    async (nextState: TradingState) => {
      if (!userId) return;
      await supabase.from('tblStakes').upsert(
        nextState.stakes.map((s) => ({
          id: s.id,
          user_id: userId,
          symbol: s.symbol,
          quantity: s.quantity,
          apy: s.apy,
          status: s.status,
          rewardsAccrued: s.rewardsAccrued,
          PenalityApplied: s.penaltyApplied,
          CreatedAt: s.createdAt,
          UpdatedAt: s.updatedAt,
        })),
      );
    },
    [userId]
  );

  const recordTrade = useCallback(
    (symbol: string, side: TradeSide, quantity: number, price: number) => {
      const usdValue = quantity * price;
      const trade: TradeRecord = {
        id: generateId(),
        symbol,
        side,
        quantity,
        price,
        usdValue,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        trades: [trade, ...prev.trades],
      }));
    },
    []
  );

  const buy: TradingContextType['buy'] = useCallback(
    ({ symbol, quantity, price }) => {
      if (quantity <= 0 || price <= 0) {
        return 'Enter a valid amount and price.';
      }
      const usdCost = quantity * price;
      if (usdCost > state.usdBalance + 1e-8) {
        return 'Insufficient funds for this trade.';
      }

      setState((prev) => {
        const prevPositions = prev.positions;
        const idx = prevPositions.findIndex((p) => p.symbol === symbol);
        let newPositions: Position[];
        if (idx === -1) {
          newPositions = [
            ...prevPositions,
            {
              id: generateId(),
              symbol,
              quantity,
              avgPrice: price,
            },
          ];
        } else {
          const existing = prevPositions[idx];
          const totalNotional =
            existing.quantity * existing.avgPrice + usdCost;
          const totalQuantity = existing.quantity + quantity;
          const updated: Position = {
            ...existing,
            quantity: totalQuantity,
            avgPrice: totalNotional / totalQuantity,
          };
          newPositions = prevPositions.map((p, i) =>
            i === idx ? updated : p
          );
        }

        const next: TradingState = {
          ...prev,
          usdBalance: prev.usdBalance - usdCost,
          positions: newPositions,
        };

        void persistAfterTrade(next, { symbol, side: 'buy', quantity, price });
        recordTrade(symbol, 'buy', quantity, price);

        return next;
      });

      return null;
    },
    [persistAfterTrade, recordTrade, state.usdBalance]
  );

  const sell: TradingContextType['sell'] = useCallback(
    ({ symbol, quantity, price }) => {
      if (quantity <= 0 || price <= 0) {
        return 'Enter a valid amount and price.';
      }

      const usdValue = quantity * price;

      let error: string | null = null;

      setState((prev) => {
        const idx = prev.positions.findIndex((p) => p.symbol === symbol);
        if (idx === -1) {
          error = 'You do not hold this asset.';
          return prev;
        }
        const existing = prev.positions[idx];
        if (quantity > existing.quantity + 1e-8) {
          error = 'Insufficient funds for this trade.';
          return prev;
        }

        const remainingQuantity = existing.quantity - quantity;
        const newPositions =
          remainingQuantity <= 1e-8
            ? prev.positions.filter((_, i) => i !== idx)
            : prev.positions.map((p, i) =>
                i === idx ? { ...existing, quantity: remainingQuantity } : p
              );

        const next: TradingState = {
          ...prev,
          usdBalance: prev.usdBalance + usdValue,
          positions: newPositions,
        };

        if (!error) {
          void persistAfterTrade(next, { symbol, side: 'sell', quantity, price });
          recordTrade(symbol, 'sell', quantity, price);
        }

        return next;
      });

      return error;
    },
    [persistAfterTrade, recordTrade]
  );

  const stake: TradingContextType['stake'] = useCallback(
    ({ symbol, fromPositionSymbol, quantity, apy }) => {
      if (quantity <= 0) {
        return 'Enter a valid amount to stake.';
      }
      if (apy <= 0) {
        return 'Enter a valid APY.';
      }

      let error: string | null = null;

      setState((prev) => {
        const idx = prev.positions.findIndex(
          (p) => p.symbol === fromPositionSymbol
        );
        if (idx === -1) {
          error = 'You do not hold this asset to stake.';
          return prev;
        }
        const existing = prev.positions[idx];
        if (quantity > existing.quantity + 1e-8) {
          error = 'Insufficient funds for this stake.';
          return prev;
        }
        const remainingQuantity = existing.quantity - quantity;
        const newPositions =
          remainingQuantity <= 1e-8
            ? prev.positions.filter((_, i) => i !== idx)
            : prev.positions.map((p, i) =>
                i === idx ? { ...existing, quantity: remainingQuantity } : p
              );

        const now = new Date().toISOString();
        const newStake: Stake = {
          id: generateId(),
          symbol,
          quantity,
          apy,
          status: 'active',
          rewardsAccrued: 0,
          penaltyApplied: 0,
          createdAt: now,
          updatedAt: now,
        };

        const next: TradingState = {
          ...prev,
          positions: newPositions,
          stakes: [...prev.stakes, newStake],
        };

        void persistStakes(next);

        return next;
      });

      return error;
    },
    [persistStakes]
  );

  const completeStake = useCallback((stakeId: string) => {
    setState((prev) => {
      const idx = prev.stakes.findIndex((s) => s.id === stakeId);
      if (idx === -1) return prev;
      const stake = prev.stakes[idx];

      // Return quantity + rewards to positions
      const totalQuantityBack = stake.quantity + stake.rewardsAccrued;
      const existingIdx = prev.positions.findIndex(
        (p) => p.symbol === stake.symbol
      );

      let newPositions: Position[];
      if (existingIdx === -1) {
        newPositions = [
          ...prev.positions,
          {
            id: generateId(),
            symbol: stake.symbol,
            quantity: totalQuantityBack,
            avgPrice: 0,
          },
        ];
      } else {
        const existing = prev.positions[existingIdx];
        newPositions = prev.positions.map((p, i) =>
          i === existingIdx
            ? { ...existing, quantity: existing.quantity + totalQuantityBack }
            : p
        );
      }

      const newStakes = prev.stakes.map((s, i) =>
        i === idx ? { ...s, status: 'completed', updatedAt: new Date().toISOString() } : s
      );

      const next: TradingState = {
        ...prev,
        positions: newPositions,
        stakes: newStakes,
      };

      void persistStakes(next);

      return next;
    });
  }, [persistStakes]);

  const value = useMemo<TradingContextType>(
    () => ({
      state,
      buy,
      sell,
      stake,
      completeStake,
    }),
    [buy, completeStake, sell, stake, state]
  );

  return (
    <TradingContext.Provider value={value}>{children}</TradingContext.Provider>
  );
};

export const useTrading = () => {
  const ctx = useContext(TradingContext);
  if (!ctx) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return ctx;
};


