import { BookingJoinLobby } from "@/features/bookings/components/booking-join-lobby";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingJoinPage({ params }: PageProps) {
  const { id } = await params;
  return <BookingJoinLobby bookingId={id} />;
}
