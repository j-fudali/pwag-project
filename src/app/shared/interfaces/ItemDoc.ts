import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface ItemDoc {
  name: string;
  model: string;
  cost: number;
  amount: number;
  source: DocumentReference;
  condition: string;
  info: string;
  modified: Timestamp;
  modifiedBy: string;
}
