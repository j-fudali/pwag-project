import { NewItem } from './NewItem';

export type EditItem = NewItem & {
  id: string;
  invoicesToRemove: string[];
  initialInvoices: string[];
};
