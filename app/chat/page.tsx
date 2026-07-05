import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { ChatConversationSidebar } from "@/features/chat/components/ChatConversationSidebar";
import { ChatMainPanel } from "@/features/chat/components/ChatMainPanel";
import { ChatShell } from "@/features/chat/components/ChatShell";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ChatShell sidebar={<ChatConversationSidebar />}>
          <ChatMainPanel />
        </ChatShell>
      </main>
      <SiteFooter />
    </>
  );
}
