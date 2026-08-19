import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { ChatConversationView } from "@/features/chat/components/ChatConversationView";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

type ChatConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const [{ conversationId }, user] = await Promise.all([params, requireCurrentUser("/chat")]);

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <DashboardShell
          activePath="/chat"
          description="تواصل مع البائع بخصوص هذا الإعلان."
          title="المحادثة"
          user={user}
        >
          <ChatConversationView conversationId={conversationId} />
        </DashboardShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
