import { type BadgeDefinition } from "../types/Badge";
export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: 'first_trade',
    symbol: '⚡',
    title: 'First Fill',
    description: 'Place your first trade.',
    isUnlocked: (_xp, tradeCount) => tradeCount >= 1,
  },
  {
    id: 'xp_200',
    symbol: '🎯',
    title: '200 XP',
    description: 'Reach 200 total XP.',
    isUnlocked: (xp) => xp >= 200,
  },
  {
    id: 'ten_trades',
    symbol: '📈',
    title: 'Active Trader',
    description: 'Complete 10 trades.',
    isUnlocked: (_xp, tradeCount) => tradeCount >= 10,
  },
  {
    id: 'xp_500',
    symbol: '🏅',
    title: '500 XP',
    description: 'Reach 500 total XP.',
    isUnlocked: (xp) => xp >= 500,
  },
  {
    id: 'xp_1000',
    symbol: '👑',
    title: '1,000 XP',
    description: 'Reach 1,000 total XP.',
    isUnlocked: (xp) => xp >= 1000,
  },
];