import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { ChatConversationSidebar } from "@/features/chat/components/ChatConversationSidebar";
import { ChatShell } from "@/features/chat/components/ChatShell";
import { ConversationDetail } from "@/features/chat/components/ConversationDetail";

type ChatConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const { conversationId } = await params;

  return (
    <>
      <SiteHeader />
      <main>
        <ChatShell sidebar={<ChatConversationSidebar activeId={conversationId} />}>
          <ConversationDetail conversationId={conversationId} />
        </ChatShell>
      </main>
      <SiteFooter />
    </>
  );
}
