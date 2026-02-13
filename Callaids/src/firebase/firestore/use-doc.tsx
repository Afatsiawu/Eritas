
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';

export type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDoc<T = any>(
  collection: string | null | undefined,
  id: string | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collection || !id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/mongodb?collection=${collection}&id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch doc');
        const rawData = await response.json();
        if (rawData) {
          setData({ ...rawData, id: rawData._id });
        } else {
          setData(null);
        }
        setError(null);
      } catch (err) {
        console.error("useDoc error:", err);
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchData();

    // Polling every 5 seconds to mimic onSnapshot
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [collection, id]);

  return { data, isLoading, error };
}
