import { Injectable, Signal, inject } from '@angular/core';
import { ItemDoc } from '../../shared/interfaces/ItemDoc';
import {
  DocumentReference,
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  updateDoc,
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
  withLatestFrom,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NewItem } from '../../shared/interfaces/NewItem';
import { AuthService } from '../../shared/data-access/auth.service';
import { Item, SingleItem } from '../../shared/interfaces/Item';
import { FirebaseError } from '@angular/fire/app';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { EditItem } from '../../shared/interfaces/EditItem';
import { Source } from '../../shared/interfaces/Source';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface ItemsState {
  items: Signal<Item[]>;
  status: Signal<'success' | 'loading' | 'error'>;
  error: Signal<string | null>;
  selectedItem: Signal<SingleItem | null>;
  itemAdded: Signal<'success' | 'loading' | 'error' | null>;
  itemEdited: Signal<'success' | 'loading' | 'error' | null>;
  itemDeleted: Signal<'success' | 'loading' | 'error' | null>;
}

@Injectable()
export class ItemsService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private itemsCollection = collection(this.firestore, 'items');
  private _authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private router = inject(Router);

  private error$ = new Subject<FirebaseError>();
  sourceCollectionRef = collection(this.firestore, 'sources').path;
  getItemById$ = new Subject<string | null>();
  add$ = new Subject<NewItem>();
  edit$ = new Subject<EditItem>();
  delete$ = new Subject<Item>();

  private onDelete$ = this.delete$.pipe(
    switchMap((item) =>
      item.invoices && item.invoices.length > 0
        ? forkJoin(
            item.invoices.map((invoice) =>
              from(deleteObject(ref(this.storage, invoice)))
            )
          ).pipe(
            map(() => item.id),
            catchError(() => of(item.id))
          )
        : of(item.id)
    ),
    switchMap((id) => deleteDoc(doc(this.firestore, `items/${id}`)))
  );
  private onEdit$ = this.edit$.pipe(
    switchMap(({ invoicesToRemove, ...editedItem }) =>
      invoicesToRemove.length > 0
        ? forkJoin(
            invoicesToRemove.map((i) =>
              from(deleteObject(ref(this.storage, i)))
            )
          ).pipe(map(() => editedItem))
        : of(editedItem)
    ),
    switchMap(({ invoices, initialInvoices, ...rest }) =>
      invoices && invoices.length > 0
        ? forkJoin(this.uploadFiles(invoices)).pipe(
            map((invoices) => ({
              ...rest,
              invoices:
                initialInvoices != undefined
                  ? [...initialInvoices, ...invoices]
                  : invoices,
            })),
            catchError(() => of({ ...rest, invoices: initialInvoices }))
          )
        : of({ ...rest, invoices: initialInvoices })
    ),
    switchMap(({ id, ...item }) =>
      updateDoc(doc(this.firestore, `items/${id}`), {
        ...item,
        modified: Timestamp.now(),
        modifiedBy: this._authService.state.user()?.username,
        source: doc(
          this.firestore,
          this.sourceCollectionRef + `/${item.source}`
        ),
      })
    ),
    shareReplay(1)
  );
  private onGetItemById$ = merge(
    this.getItemById$,
    this.onEdit$.pipe(
      withLatestFrom(this.getItemById$),
      map(([_, id]) => id)
    )
  ).pipe(
    filter((id): id is string => id !== null),
    switchMap((id: string) => getDoc(doc(this.firestore, `items/${id}`))),
    switchMap((doc) => this.mapToItem(doc.data() as ItemDoc)),
    catchError(() => {
      this.router.navigate(['../']);
      return of(null);
    }),
    shareReplay(1)
  );
  private onAdd$ = this.add$.pipe(
    switchMap((item) => {
      const { invoices, ...rest } = item;
      const itemDoc: ItemDoc = {
        ...rest,
        source: doc(
          this.firestore,
          this.sourceCollectionRef + `/${item.source}`
        ),
        modified: Timestamp.now(),
        modifiedBy: this._authService.state.user()!.username,
      };
      if (invoices.length > 0) {
        return forkJoin(this.uploadFiles(item.invoices)).pipe(
          switchMap((invoices) =>
            addDoc(this.itemsCollection, { ...itemDoc, invoices })
          )
        );
      }
      return addDoc(this.itemsCollection, itemDoc);
    }),
    shareReplay(1)
  );

  private itemDeleted$ = merge(
    this.delete$.pipe(map(() => 'loading' as const)),
    this.onDelete$.pipe(
      tap(() => {
        this.router.navigate(['/']);
        this.snackbar.open($localize`Item has been deleted`, 'X', {
          duration: 3000,
        });
      }),
      map(() => 'success' as const),
      catchError(() => {
        this.snackbar.open($localize`Item has been not edited`, 'X', {
          duration: 3000,
        });
        return of('error' as const);
      })
    )
  );
  private itemEdited$ = merge(
    this.edit$.pipe(map(() => 'loading' as const)),
    this.onEdit$.pipe(
      tap(() =>
        this.snackbar.open($localize`Item has been edited`, 'X', {
          duration: 3000,
        })
      ),
      map(() => 'success' as const),
      catchError(() => {
        this.snackbar.open($localize`Item has been not edited`, 'X', {
          duration: 3000,
        });
        return of('error' as const);
      })
    )
  );
  private itemAdded$ = merge(
    this.add$.pipe(map(() => 'loading' as const)),
    this.onAdd$.pipe(
      tap(() =>
        this.snackbar.open($localize`Item has been added`, 'X', {
          duration: 3000,
        })
      ),
      map(() => 'success' as const),
      catchError(() => {
        this.snackbar.open($localize`Error! Item has been not added`, 'X', {
          duration: 3000,
        });
        return of('error' as const);
      })
    )
  );
  private items$ = (
    collectionData(this.itemsCollection, { idField: 'id' }) as Observable<
      ItemDoc[]
    >
  ).pipe(
    switchMap((items) =>
      items.length > 0
        ? combineLatest(items.map((i) => this.mapToItem(i)))
        : of([] as Item[])
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
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: null,
  });
  private selectedItem = toSignal(this.onGetItemById$, { initialValue: null });
  private itemEdited = toSignal(this.itemEdited$, { initialValue: null });
  private itemDeleted = toSignal(this.itemDeleted$, { initialValue: null });
  state: ItemsState = {
    items: this.items,
    status: this.status,
    error: this.error,
    itemAdded: this.itemAdded,
    selectedItem: this.selectedItem,
    itemEdited: this.itemEdited,
    itemDeleted: this.itemDeleted,
  };

  private uploadFiles(files: File[]) {
    return files.map((f) => {
      const storageRef = ref(this.storage, `${f.name}_${Date.now()}`);
      return from(uploadBytes(storageRef, f)).pipe(
        switchMap(() => getDownloadURL(storageRef))
      );
    });
  }

  private mapToItem(i: ItemDoc) {
    return (
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
    );
  }
}
