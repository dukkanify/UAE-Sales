import Link from "next/link";

type NotificationsListProps = {
  items: Array<{
    id: string;
    title: string;
    body: string;
    href?: string;
    read: boolean;
  }>;
};

export function NotificationsList({ items }: NotificationsListProps) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => {
        const content = (
          <>
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-0.5 text-xs">{item.body}</p>
          </>
        );
        return (
          <li
            key={item.id}
            className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm ${item.read ? "bg-surface-muted text-muted" : "border border-primary/15 bg-primary-soft"}`}
          >
            {item.href ? (
              <Link className="block" href={item.href}>
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
