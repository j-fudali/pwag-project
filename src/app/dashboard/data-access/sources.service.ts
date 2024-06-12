import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
} from '@angular/fire/firestore';
import {
  Observable,
  Subject,
  catchError,
  filter,
  forkJoin,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { FirebaseError } from '@angular/fire/app';
import { Source } from '../../shared/interfaces/Source';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SourcesState {
  sources: Signal<Source[]>;
  status: Signal<'success' | 'error' | 'deleted' | 'added' | null>;
  error: Signal<string | null>;
}

@Injectable()
export class SourcesService {
  private firestore = inject(Firestore);
  private sourcesCollection = collection(this.firestore, 'sources');
  private snackbar = inject(MatSnackBar);
  private url = location.href;
  private isPolish = this.url.includes('4201');
  private error$ = new Subject<FirebaseError>();

  deleteMany$ = new Subject<string[]>();
  add$ = new Subject<{ newSource: string; newSourcePl: string }>();

  private onDeleteMany$ = this.deleteMany$.pipe(
    switchMap((ids) =>
      forkJoin(ids.map((id) => deleteDoc(doc(this.firestore, `sources/${id}`))))
    ),
    tap(() =>
      this.snackbar.open($localize`Sources deleted`, 'X', { duration: 3000 })
    ),
    catchError(() => {
      this.snackbar.open($localize`Cannot delete source`, 'X', {
        duration: 3000,
      });
      return of('error' as const);
    }),
    shareReplay(1)
  );
  private onAdd$ = this.add$.pipe(
    switchMap(({ newSource, newSourcePl }) =>
      addDoc(this.sourcesCollection, { name: newSource, name_pl: newSourcePl })
    ),

    tap(() =>
      this.snackbar.open($localize`Source added`, 'X', { duration: 3000 })
    ),
    catchError(() => {
      this.snackbar.open($localize`Cannot add source`, 'X', {
        duration: 3000,
      });
      return of('error' as const);
    }),
    shareReplay(1)
  );

  private sources$ = (
    collectionData(
      query(
        this.sourcesCollection,
        this.isPolish ? orderBy('name_pl') : orderBy('name')
      ),
      {
        idField: 'id',
      }
    ) as Observable<Source[]>
  ).pipe(
    catchError((err: FirebaseError) => {
      this.error$.next(err);
      return of([]);
    }),
    shareReplay(1)
  );
  private status$ = merge(
    this.sources$.pipe(
      filter((sources) => sources != null),
      filter((sources) => sources!.length > 0),
      map(() => 'success' as const)
    ),
    this.onAdd$.pipe(map(() => 'added' as const)),
    this.onDeleteMany$.pipe(map(() => 'deleted' as const)),
    this.error$.pipe(map(() => 'error' as const))
  );
  private sources = toSignal(this.sources$, { initialValue: [] });
  private status = toSignal(this.status$, {
    initialValue: null,
  });
  private error = toSignal(
    this.error$.pipe(map((err) => 'You cannot add user')),
    {
      initialValue: null,
    }
  );
  private onDeleteMany = toSignal(this.onDeleteMany$, { initialValue: null });
  private onAdd = toSignal(this.onAdd$, { initialValue: null });
  state: SourcesState = {
    sources: this.sources,
    status: this.status,
    error: this.error,
  };
}
