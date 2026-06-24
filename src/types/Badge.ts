
export type BadgeId =
  | 'first_trade'
  | 'xp_200'
  | 'ten_trades'
  | 'xp_500'
  | 'xp_1000';

export type BadgeDefinition = {
  id: BadgeId;
  symbol: string;
  title: string;
  description: string;
  isUnlocked: (xp: number, tradeCount: number) => boolean;
};
