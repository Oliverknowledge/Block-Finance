import type { StakeProvider } from '../../types/stakeProvider';

const solanaProviders: StakeProvider[] = [
  { id: 'blaze-sol', name: 'Blaze Stake', commission: 6, uptimeModifier: 1.02, trustScore: 88, apy: 10.0 },
  { id: 'kraken-sol', name: 'Kraken', commission: 8, uptimeModifier: 1.0, trustScore: 84, apy: 9.0 },
  { id: 'phantom-sol', name: 'Phantom', commission: 5, uptimeModifier: 1.04, trustScore: 90, apy: 12.0 },
  { id: 'cronos-sol', name: 'Cronos', commission: 10, uptimeModifier: 0.98, trustScore: 78, apy: 10.0 },
  { id: 'axiom-sol', name: 'Axiom', commission: 7, uptimeModifier: 1.05, trustScore: 92, apy: 15.0 },
];

export default solanaProviders;
