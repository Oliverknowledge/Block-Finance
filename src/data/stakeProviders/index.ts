import type { StakeProvider } from '../../types/stakeProvider';
import avalancheProviders from './avalanche';
import cardanoProviders from './cardano';
import ethereumProviders from './ethereum';
import polkadotProviders from './polkadot';
import solanaProviders from './solana';

const stakeProvidersByChain: Record<string, StakeProvider[]> = {
  Solana: solanaProviders,
  Polkadot: polkadotProviders,
  Cardano: cardanoProviders,
  Avalanche: avalancheProviders,
  Ethereum: ethereumProviders,
};

export default stakeProvidersByChain;
