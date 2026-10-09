import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoomDetails } from '@/components/rooms/RoomDetails';
import { getRoomById } from '@/lib/rooms';
import { HOTEL } from '@/lib/hotel-config';

type RoomDetailsPageProps = {
  params: Promise<{ roomId: string }>;
};

export async function generateMetadata({ params }: RoomDetailsPageProps): Promise<Metadata> {
  const { roomId } = await params;
  const room = await getRoomById(roomId);
  return { title: room ? `${room.name} | ${HOTEL.name}` : `Room not found | ${HOTEL.name}` };
}

export default async function RoomDetailsPage({ params }: RoomDetailsPageProps) {
  const { roomId } = await params;
  const room = await getRoomById(roomId);

  if (!room) notFound();

  return <RoomDetails room={room} />;
}