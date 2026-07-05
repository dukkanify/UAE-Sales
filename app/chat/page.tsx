import Link from "next/link";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getChatThreads } from "@/services/chatService";
import { getCurrentUser } from "@/services/profile";

export default async function ChatPage() {
  const [user, threads] = await Promise.all([
    getCurrentUser(),
    getChatThreads(),
  ]);

  const unreadTotal = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="تواصل مع المشترين والبائعين بخصوص إعلاناتك النشطة."
          title="الرسائل"
          user={user}
        >
          <div className="grid gap-4">
            <p className="text-sm text-muted">
              {threads.length} محادثة
              {unreadTotal > 0 ? ` · ${unreadTotal} غير مقروءة` : ""}
            </p>
            {threads.map((thread) => (
              <Card key={thread.id} className="p-4" interactive variant="flat">
                <Link className="flex gap-4" href={`/chat?thread=${thread.id}`}>
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
                    <AppImage
                      alt={thread.participantName}
                      className="object-cover"
                      fallback="avatar"
                      fill
                      sizes="48px"
                      src={thread.avatarUrl}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {thread.participantName}
                      </p>
                      <span className="shrink-0 text-xs text-muted">
                        {new Date(thread.lastMessageAt).toLocaleDateString(
                          "ar-AE",
                          { day: "numeric", month: "short" },
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-primary">
                      {thread.listingTitle}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {thread.lastMessage}
                    </p>
                  </div>
                  {thread.unreadCount > 0 ? (
                    <Badge variant="new">{thread.unreadCount}</Badge>
                  ) : null}
                </Link>
              </Card>
            ))}
          </div>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
