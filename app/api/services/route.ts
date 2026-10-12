import { NextResponse } from 'next/server';
import { getServiceCatalog } from '@/lib/services';

export async function GET() {
  const catalog = await getServiceCatalog();
  return NextResponse.json(catalog, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
