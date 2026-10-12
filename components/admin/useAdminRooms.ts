'use client';

import { useEffect, useState } from 'react';
import type { AdminRoom } from '@/types';

/** Live room inventory for staff screens, with persisted status changes. */
export function useAdminRooms() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/rooms', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Rooms could not be loaded.');
        setRooms(result.rooms);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Rooms could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const setStatus = async (id: string, status: AdminRoom['status']) => {
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update the room.');
      setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, status, updatedAt: result.room.updated_at } : room)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the room.');
    } finally {
      setUpdatingId(null);
    }
  };

  return { rooms, loading, error, updatingId, setStatus };
}
