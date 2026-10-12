import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { HOTEL } from '@/lib/hotel-config';
import { MOCK_SERVICES } from '@/lib/data/mock-data';
import type { HotelService } from '@/types';

type ServiceCatalog = { services: HotelService[]; source: 'supabase' | 'fallback' };

type ServiceRecord = {
  id: string;
  name: string;
  category: HotelService['category'];
  price_ngn: number | string;
  duration: string | null;
  description: string | null;
  image_url: string | null;
  popular: boolean | null;
};

export const SERVICES_CACHE_TAG = 'services';

async function loadServiceCatalog(): Promise<ServiceCatalog> {
  if (!isSupabaseConfigured()) return { services: MOCK_SERVICES, source: 'fallback' };

  try {
    const { data, error } = await createPublicClient()
      .from('services')
      .select('id, name, category, price_ngn, duration, description, image_url, popular, hotel:hotels!inner(slug)')
      .eq('hotel.slug', HOTEL.slug)
      .order('popular', { ascending: false })
      .order('name', { ascending: true });

    if (error || !data?.length) return { services: MOCK_SERVICES, source: 'fallback' };

    const services = (data as unknown as ServiceRecord[]).map((record) => ({
      id: record.id,
      name: record.name,
      category: record.category,
      price: Number(record.price_ngn),
      duration: record.duration ?? undefined,
      description: record.description ?? '',
      image: record.image_url ?? '',
      popular: Boolean(record.popular),
    }));
    return { services, source: 'supabase' };
  } catch {
    return { services: MOCK_SERVICES, source: 'fallback' };
  }
}

/** Cached like the room catalog: refreshed every 5 minutes or on revalidateTag(SERVICES_CACHE_TAG). */
export const getServiceCatalog = cache(
  unstable_cache(loadServiceCatalog, ['service-catalog', HOTEL.slug], { revalidate: 300, tags: [SERVICES_CACHE_TAG] })
);
