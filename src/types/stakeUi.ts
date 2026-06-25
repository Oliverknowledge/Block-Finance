export type StakeMessage = {
  type: 'Error' | 'Success' | '';
  message: string;
};

export type StakeReceipt = {
  chainName: string;
  validatorName: string;
  walletName: string;
  amount: number;
  apy: number;
  lockupDays: number;
  
};
