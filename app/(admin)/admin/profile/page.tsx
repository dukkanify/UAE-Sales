import { ProfilePageView } from "@/features/profile/components/profile-page";

export const metadata = { title: "Profile" };

export default function Page() {
  return <ProfilePageView roleLabel="admin" />;
}
