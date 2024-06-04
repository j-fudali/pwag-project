import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import {
  Observable,
  Subject,
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
} from 'rxjs';
import { FirebaseError } from '@angular/fire/app';
import { Source } from '../../shared/interfaces/Source';

export interface SourcesState {
  sources: Signal<Source[]>;
  status: Signal<'success' | 'error' | null>;
  error: Signal<string | null>;
}

@Injectable()
export class SourcesService {
  private firestore = inject(Firestore);
  private sourcesCollection = collection(this.firestore, 'sources');

  private error$ = new Subject<FirebaseError>();

  private sources$ = (
    collectionData(this.sourcesCollection, {
      idField: 'id',
    }) as Observable<Source[]>
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
  state: SourcesState = {
    sources: this.sources,
    status: this.status,
    error: this.error,
  };
}
