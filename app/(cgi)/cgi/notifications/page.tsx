import { NotificationsPageView } from "@/features/notifications/components/notifications-page";

export const metadata = { title: "Notifications" };

export default function Page() {
  return <NotificationsPageView roleSegment="cgi" />;
}
