import { Source } from './Source';

export interface Item {
  id: string;
  name: string;
  model: string;
  cost: number;
  amount: number;
  source: Source;
  condition: string;
  info: string;
  modified: string;
  modifiedBy: string;
  invoices?: string[];
}
export type SingleItem = Omit<Item, 'id'>;
