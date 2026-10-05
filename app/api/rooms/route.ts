import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_ROOMS } from "@/lib/data/mock-data";

export async function Get() {
  return NextResponse.json({ message: "Rooms endpoint active" });
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