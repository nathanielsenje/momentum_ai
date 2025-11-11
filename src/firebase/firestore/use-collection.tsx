'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  startAt,
  Query,
  DocumentData,
  CollectionReference,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  where?: [string, any, any][];
  orderBy?: [string, 'asc' | 'desc'][];
  limit?: number;
  startAfter?: any;
  endBefore?: any;
  startAt?: any;
}

function useMemoizedQuery(
  path: string,
  options?: UseCollectionOptions
): Query | null {
  const firestore = useFirestore();

  const memoizedOptions = useMemo(
    () => JSON.stringify(options),
    [options]
  );

  return useMemo(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, path);

    const parsedOptions = options ? JSON.parse(memoizedOptions) as UseCollectionOptions : undefined;

    if (parsedOptions?.where) {
      for (const w of parsedOptions.where) {
        q = query(q, where(w[0], w[1], w[2]));
      }
    }
    if (parsedOptions?.orderBy) {
      for (const o of parsedOptions.orderBy) {
        q = query(q, orderBy(o[0], o[1]));
      }
    }
    if (parsedOptions?.startAt) {
      q = query(q, startAt(parsedOptions.startAt));
    }
    if (parsedOptions?.startAfter) {
      q = query(q, startAfter(parsedOptions.startAfter));
    }
    if (parsedOptions?.endBefore) {
      q = query(q, endBefore(parsedOptions.endBefore));
    }
    if (parsedOptions?.limit) {
      if (parsedOptions.orderBy && parsedOptions.endBefore) {
        q = query(q, limitToLast(parsedOptions.limit));
      } else {
        q = query(q, limit(parsedOptions.limit));
      }
    }
    return q;
  }, [firestore, path, memoizedOptions]);
}


export function useCollection<T>(
  path: string,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useMemoizedQuery(path, options);

  useEffect(() => {
    if (!memoizedQuery) {
      if (useFirestore()) { // only set loading to false if firestore is available
        setLoading(false);
      }
      return;
    };
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching collection ${path}:`, err);
        setError(err);
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: (memoizedQuery as CollectionReference).path,
            operation: 'list',
        }));
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
