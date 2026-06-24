import type { StakeProvider } from '../../types/stakeProvider';

const polkadotProviders: StakeProvider[] = [
  { id: 'nova-dot', name: 'Nova Pool', commission: 9, uptimeModifier: 1.01, trustScore: 86, apy: 12.3 },
  { id: 'parity-dot', name: 'Parity One', commission: 7, uptimeModifier: 1.02, trustScore: 89, apy: 13.1 },
  { id: 'chainops-dot', name: 'ChainOps', commission: 10, uptimeModifier: 0.97, trustScore: 80, apy: 11.4 },
];

export default polkadotProviders;
