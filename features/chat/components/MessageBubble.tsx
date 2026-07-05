import type { ChatMessage } from "@/types/domain/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.isMine;

  return (
    <div className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-2xl)] px-4 py-3 text-sm shadow-[var(--shadow-xs)] sm:max-w-[70%] ${
          isMine
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md border border-border bg-surface text-ink"
        }`}
      >
        {!isMine ? (
          <p className="mb-1 text-[11px] font-semibold text-muted">
            {message.senderName}
          </p>
        ) : null}
        <p className="leading-7">{message.text}</p>
        {message.imageUrl ? (
          <div className="mt-2 overflow-hidden rounded-[var(--radius-xl)] border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="مرفق"
              className="max-h-48 w-full object-cover"
              src={message.imageUrl}
            />
          </div>
        ) : null}
        <p
          className={`mt-2 text-[10px] ${
            isMine ? "text-white/70" : "text-muted"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("ar-AE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {!message.read && !isMine ? " · غير مقروء" : ""}
        </p>
      </div>
    </div>
  );
}
