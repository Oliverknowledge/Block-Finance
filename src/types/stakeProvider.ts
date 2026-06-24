import type { Validator } from './validator';

export type StakeProvider = Validator & {
  apy: number;
};
