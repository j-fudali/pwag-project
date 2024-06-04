import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface ItemDoc {
  id?: string;
  name: string;
  model: string;
  cost: number;
  amount: number;
  source: DocumentReference;
  condition: string;
  info: string;
  modified: Timestamp;
  modifiedBy: string;
  invoices?: string[];
}
