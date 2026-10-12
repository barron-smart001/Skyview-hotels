import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MOCK_SERVICES } from '@/lib/data/mock-data';
import type { ServiceRequest } from '@/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ServiceRow = { name: string; category: string };
type RequestRow = {
  id: string;
  service_id: string;
  requested_time: string;
  status: ServiceRequest['status'];
  notes: string | null;
  created_at: string;
  service: ServiceRow | ServiceRow[] | null;
};

function mapRequest(row: RequestRow): ServiceRequest {
  const service = Array.isArray(row.service) ? row.service[0] : row.service;
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: service?.name ?? 'Service',
    category: service?.category ?? '',
    requestedTime: row.requested_time,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

const REQUEST_SELECT = 'id, service_id, requested_time, status, notes, created_at, service:services(name, category)';

/** The signed-in guest's own service requests (RLS-scoped). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to see your service requests.' }, { status: 401 });

    const { data, error } = await supabase
      .from('service_requests')
      .select(REQUEST_SELECT)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ requests: (data as unknown as RequestRow[]).map(mapRequest) });
  } catch (error) {
    console.error('Failed to load service requests:', error);
    return NextResponse.json({ error: 'Service requests are unavailable right now.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const serviceId = typeof body?.serviceId === 'string' ? body.serviceId.trim() : '';
  const requestedTime = typeof body?.requestedTime === 'string' ? body.requestedTime.trim().slice(0, 120) : '';
  const notes = typeof body?.notes === 'string' ? body.notes.trim().slice(0, 1000) || null : null;

  if (!serviceId || !requestedTime) {
    return NextResponse.json({ error: 'Please choose a service and a preferred time.' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to request hotel services.' }, { status: 401 });

    // Demo catalog entries are not stored; mirrors the demo booking behaviour.
    if (!UUID_PATTERN.test(serviceId)) {
      const demoService = MOCK_SERVICES.find((service) => service.id === serviceId);
      if (!demoService) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
      const demoRequest: ServiceRequest = {
        id: `demo-${crypto.randomUUID()}`,
        serviceId,
        serviceName: demoService.name,
        category: demoService.category,
        requestedTime,
        status: 'Pending',
        notes: notes ?? undefined,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ request: demoRequest, source: 'demo' }, { status: 201 });
    }

    // Attach the guest's current stay, if any, so staff know which room to serve.
    const today = new Date().toISOString().slice(0, 10);
    const { data: stay } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['checked-in', 'confirmed'])
      .gte('check_out', today)
      .order('check_in', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        user_id: user.id,
        service_id: serviceId,
        booking_id: stay?.id ?? null,
        requested_time: requestedTime,
        notes,
        status: 'Pending',
      })
      .select(REQUEST_SELECT)
      .single();

    if (error) {
      // 23503: service_id does not reference an existing service.
      if (error.code === '23503') return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
      throw error;
    }

    return NextResponse.json({ request: mapRequest(data as unknown as RequestRow), source: 'supabase' }, { status: 201 });
  } catch (error) {
    console.error('Service request failed:', error);
    return NextResponse.json({ error: 'We could not send your request. Please try again.' }, { status: 500 });
  }
}
