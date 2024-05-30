import { Injectable, Signal, inject } from '@angular/core';
import { ItemDoc } from '../../shared/interfaces/ItemDoc';
import {
  DocumentReference,
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
} from '@angular/fire/firestore';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  filter,
  forkJoin,
  from,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NewItem } from '../../shared/interfaces/NewItem';
import { AuthService } from '../../shared/data-access/auth.service';
import { Source } from '../../shared/interfaces/Source';
import { Item } from '../../shared/interfaces/Item';
import { FirebaseError } from '@angular/fire/app';

export interface ItemsState {
  items: Signal<Item[]>;
  status: Signal<'success' | 'loading' | 'error'>;
  error: Signal<string | null>;
  itemAdded: Signal<boolean | null>;
}

@Injectable()
export class ItemsService {
  private firestore = inject(Firestore);
  private itemsCollection = collection(this.firestore, 'items');
  private _authService = inject(AuthService);
  sourceCollectionRef = collection(this.firestore, 'sources').path;

  add$ = new Subject<NewItem>();
  private error$ = new Subject<FirebaseError>();
  private onAdd$ = this.add$.pipe(
    switchMap((item) =>
      from(
        addDoc(this.itemsCollection, <ItemDoc>{
          ...item,
          source: doc(
            this.firestore,
            this.sourceCollectionRef + `/${item.source}`
          ),
          modified: Timestamp.now(),
          modifiedBy: this._authService.state.user()?.username,
        })
      )
    )
  );
  private itemAdded$ = merge(
    this.add$.pipe(map(() => null)),
    this.onAdd$.pipe(
      map(() => true),
      catchError(() => of(false))
    )
  );
  private items$ = (
    collectionData(this.itemsCollection) as Observable<ItemDoc[]>
  ).pipe(
    switchMap((items) =>
      combineLatest(
        items.map((i) =>
          (
            docData(i.source as DocumentReference, {
              idField: 'id',
            }) as Observable<Source>
          ).pipe(
            map(
              (source) =>
                ({
                  ...i,
                  source: source,
                  modified: i.modified.toDate().toLocaleDateString(),
                } as Item)
            )
          )
        )
      )
    ),
    catchError((err: FirebaseError) => {
      this.error$.next(err);
      return of([]);
    }),
    shareReplay(1)
  );
  private status$ = merge(
    this.items$.pipe(
      filter((items) => items.length > 0),
      map(() => 'success' as const)
    ),
    this.add$.pipe(map(() => 'loading' as const)),
    this.error$.pipe(map(() => 'error' as const))
  );
  private items = toSignal(this.items$, { initialValue: [] });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  private itemAdded = toSignal(this.itemAdded$, { initialValue: null });
  private error = toSignal(
    this.error$.pipe(map((err) => 'You cannot add user')),
    {
      initialValue: null,
    }
  );
  state: ItemsState = {
    items: this.items,
    status: this.status,
    itemAdded: this.itemAdded,
    error: this.error,
  };
}
