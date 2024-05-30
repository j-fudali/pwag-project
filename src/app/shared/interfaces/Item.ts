import { Source } from './Source';

export interface Item {
  name: string;
  model: string;
  cost: number;
  amount: number;
  source: Source;
  condition: string;
  info: string;
  modified: string;
  modifiedBy: string;
}
