'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/types';

export function useRoomCatalog() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/rooms', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Room information is unavailable right now.');
        const result = await response.json() as { rooms?: Room[] };
        if (!Array.isArray(result.rooms)) throw new Error('Room information could not be loaded.');
        setRooms(result.rooms);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Room information could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { rooms, loading, error };
}