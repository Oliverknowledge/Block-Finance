import { type Validator } from "../types/validator";

export const SOLANA_VALIDATORS: Validator[] = [
  {
    id: "blaze",
    name: "BlazeStake",
    commission: 0.05,
    uptimeModifier: 1.02,
    trustScore: 0.9,
  },
  {
    id: "everstake",
    name: "Everstake",
    commission: 0.07,
    uptimeModifier: 1.01,
    trustScore: 0.92,
  },
  {
    id: "kraken",
    name: "Kraken",
    commission: 0.09,
    uptimeModifier: 1.0,
    trustScore: 0.95,
  },
  {
    id: "shinobi",
    name: "Shinobi Systems",
    commission: 0.04,
    uptimeModifier: 0.99,
    trustScore: 0.85,
  },
  {
    id: "coinbase",
    name: "Coinbase",
    commission: 0.1,
    uptimeModifier: 0.98,
    trustScore: 0.96,
  }
];


export const ETHEREUM_VALIDATORS: Validator[] = [
  {
    id: "lido",
    name: "Lido",
    commission: 0.1,
    uptimeModifier: 1.02,
    trustScore: 0.95,
  },
  {
    id: "rocketpool",
    name: "Rocket Pool",
    commission: 0.08,
    uptimeModifier: 1.01,
    trustScore: 0.92,
  },
  {
    id: "coinbase",
    name: "Coinbase",
    commission: 0.12,
    uptimeModifier: 1.0,
    trustScore: 0.96,
  },
  {
    id: "solo_staker",
    name: "Solo Staker",
    commission: 0.02,
    uptimeModifier: 0.97,
    trustScore: 0.7,
  },
];

export const POLKADOT_VALIDATORS: Validator[] = [
  {
    id: "parity",
    name: "Parity Technologies",
    commission: 0.05,
    uptimeModifier: 1.02,
    trustScore: 0.95,
  },
  {
    id: "stakingfac",
    name: "Staking Facilities",
    commission: 0.06,
    uptimeModifier: 1.01,
    trustScore: 0.93,
  },
  {
    id: "p2p",
    name: "P2P Validator",
    commission: 0.08,
    uptimeModifier: 1.0,
    trustScore: 0.9,
  },
  {
    id: "high_risk",
    name: "High-Yield Validator",
    commission: 0.02,
    uptimeModifier: 0.92,
    trustScore: 0.5,
  },
];

export const CARDANO_VALIDATORS: Validator[] = [
  {
    id: "iohk",
    name: "IOG",
    commission: 0.03,
    uptimeModifier: 1.02,
    trustScore: 0.96,
  },
  {
    id: "bloom",
    name: "Bloom Pool",
    commission: 0.035,
    uptimeModifier: 1.01,
    trustScore: 0.9,
  },
  {
    id: "adafrog",
    name: "Community SPO",
    commission: 0.025,
    uptimeModifier: 0.99,
    trustScore: 0.8,
  },
  {
    id: "unknown_spo",
    name: "Unknown SPO",
    commission: 0.015,
    uptimeModifier: 0.95,
    trustScore: 0.55,
  },
];
export const AVALANCHE_VALIDATORS: Validator[] = [
  {
    id: "ava_labs",
    name: "Ava Labs",
    commission: 0.06,
    uptimeModifier: 1.02,
    trustScore: 0.95,
  },
  {
    id: "figment",
    name: "Figment",
    commission: 0.08,
    uptimeModifier: 1.01,
    trustScore: 0.92,
  },
  {
    id: "stakefish",
    name: "Stakefish",
    commission: 0.07,
    uptimeModifier: 1.0,
    trustScore: 0.9,
  },
  {
    id: "cheap_node",
    name: "Low-Cost Validator",
    commission: 0.025,
    uptimeModifier: 0.93,
    trustScore: 0.6,
  },
];
