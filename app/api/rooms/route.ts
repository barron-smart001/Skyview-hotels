import { NextResponse } from 'next/server';
import { getRoomCatalog } from '@/lib/rooms';

export async function GET() {
  const catalog = await getRoomCatalog();
  return NextResponse.json(catalog, {
    // Let the CDN absorb repeat traffic; the server-side cache refreshes every 5 minutes.
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
