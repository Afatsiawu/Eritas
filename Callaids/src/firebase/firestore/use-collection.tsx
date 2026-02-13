
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T = any>(
  collection: string | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collection) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/mongodb?collection=${collection}`);
        if (!response.ok) throw new Error('Failed to fetch collection');
        const rawData = await response.json();
        if (Array.isArray(rawData)) {
          const results = rawData.map(item => ({ ...item, id: item._id }));
          setData(results);
        } else {
          setData([]);
        }
        setError(null);
      } catch (err) {
        console.error("useCollection error:", err);
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchData();

    // Polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [collection]);

  return { data, isLoading, error };
}

