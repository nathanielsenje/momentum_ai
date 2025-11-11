'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc, DocumentReference, FirestoreError } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

function useMemoizedDocRef(path: string): DocumentReference | null {
  const firestore = useFirestore();

  return useMemo(() => {
    if (!firestore) return null;
    // Simple path validation
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length % 2 !== 0) {
      console.error('Invalid document path:', path, 'A document path must have an even number of segments.');
      return null;
    }
    return doc(firestore, path);
  }, [firestore, path]);
}

export function useDoc<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const memoizedDocRef = useMemoizedDocRef(path);

  useEffect(() => {
    if (!memoizedDocRef) {
       if (useFirestore()) { // only set loading to false if firestore is available
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document ${path}:`, err);
        setError(err);
        setLoading(false);
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: memoizedDocRef.path,
            operation: 'get',
        }));
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading, error };
}
