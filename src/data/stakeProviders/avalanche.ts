import type { StakeProvider } from '../../types/stakeProvider';

const avalancheProviders: StakeProvider[] = [
  { id: 'glacier-avax', name: 'Glacier', commission: 6, uptimeModifier: 1.01, trustScore: 84, apy: 9.6 },
  { id: 'summit-avax', name: 'Summit', commission: 5, uptimeModifier: 1.03, trustScore: 88, apy: 10.2 },
  { id: 'vector-avax', name: 'Vector', commission: 8, uptimeModifier: 0.99, trustScore: 82, apy: 8.9 },
];

export default avalancheProviders;
