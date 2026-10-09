import { NextResponse } from "next/server";
import { getRoomCatalog } from '@/lib/rooms';

export async function GET() {
  const catalog = await getRoomCatalog();
  return NextResponse.json(catalog);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // const { data: rooms, error } = await supabase
    //   .from('rooms')
    //   .select('*, room_type:room_types(*)')
    //   .order('price_per_night_ngn', { ascending: true });

    // if (error || !rooms || rooms.length === 0) {
    //   return NextResponse.json({ rooms: MOCK_ROOMS, source: 'fallback' });
    // }

    return NextResponse.json({ message: "Room created", data: body });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
export { };
