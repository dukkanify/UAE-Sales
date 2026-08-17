import { ChatInboxList } from "@/features/chat/components/ChatInboxList";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

export default async function ChatPage() {
  const user = await requireCurrentUser("/chat");

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/chat"
          description="تواصل مع المشترين والبائعين بخصوص إعلاناتك النشطة."
          title="الرسائل"
          user={user}
        >
          <ChatInboxList />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
