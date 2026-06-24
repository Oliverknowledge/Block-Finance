import type { StakeProvider } from '../../types/stakeProvider';

const cardanoProviders: StakeProvider[] = [
  { id: 'atlas-ada', name: 'Atlas Pool', commission: 3, uptimeModifier: 1.01, trustScore: 87, apy: 5.4 },
  { id: 'lido-ada', name: 'Lido ADA', commission: 4, uptimeModifier: 1.0, trustScore: 85, apy: 5.0 },
  { id: 'orio-ada', name: 'Orio', commission: 2, uptimeModifier: 1.03, trustScore: 90, apy: 5.8 },
];

export default cardanoProviders;
