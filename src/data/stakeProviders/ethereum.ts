import type { StakeProvider } from '../../types/stakeProvider';

const ethereumProviders: StakeProvider[] = [
  { id: 'beacon-eth', name: 'Beacon Prime', commission: 12, uptimeModifier: 1.0, trustScore: 90, apy: 4.7 },
  { id: 'lighthouse-eth', name: 'Lighthouse', commission: 10, uptimeModifier: 1.01, trustScore: 88, apy: 4.9 },
  { id: 'altair-eth', name: 'Altair', commission: 14, uptimeModifier: 0.98, trustScore: 85, apy: 4.4 },
];

export default ethereumProviders;
