import { ProfileActivityPanelBody } from "@/features/profile/components/ProfileActivityPanelBody";
import { getNotifications } from "@/services/activityService";

export async function ProfileActivityPanel({ userId }: { userId: string }) {
  const notifications = await getNotifications(userId);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <ProfileActivityPanelBody notifications={notifications} unread={unread} />
  );
}
