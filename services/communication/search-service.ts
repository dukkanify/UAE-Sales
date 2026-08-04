/**
 * Global communication search across messages, posts, comments, announcements, tickets, users, communities.
 */

import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { canManageSupport, canMessage, canAccessCommunity, canManageBlog } from "@/services/communication/access";
import { readCommunicationDb } from "@/services/communication/store";
import type { SearchHit } from "@/types/communication";
import type { UserProfile } from "@/types";

export type { SearchHit };

export function searchCommunication(user: UserProfile, query: string, limit = 40): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const db = readCommunicationDb();
  const hits: SearchHit[] = [];

  if (canMessage(user)) {
    for (const m of db.messages) {
      if (m.deletedAt) continue;
      const conv = db.conversations.find((c) => c.id === m.conversationId);
      if (!conv?.participantIds.includes(user.id)) continue;
      if (m.body.toLowerCase().includes(q)) {
        hits.push({
          type: "message",
          id: m.id,
          title: conv.title,
          snippet: m.body.slice(0, 120),
          href: `messages?c=${conv.id}`,
        });
      }
      if (hits.length >= limit) return hits;
    }
  }

  if (canAccessCommunity(user)) {
    for (const c of db.communities) {
      if (c.isArchived) continue;
      if (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      ) {
        hits.push({
          type: "community",
          id: c.id,
          title: c.name,
          snippet: c.description.slice(0, 120),
          href: `community?id=${c.id}`,
        });
      }
    }
    for (const p of db.posts) {
      if (p.deletedAt) continue;
      if (p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)) {
        hits.push({
          type: "post",
          id: p.id,
          title: p.title,
          snippet: p.body.slice(0, 120),
          href: `community?post=${p.id}`,
        });
      }
      if (hits.length >= limit) return hits;
    }
  }

  for (const c of db.comments) {
    if (c.deletedAt || c.status === "hidden") continue;
    if (c.body.toLowerCase().includes(q)) {
      hits.push({
        type: "comment",
        id: c.id,
        title: "Comment",
        snippet: c.body.slice(0, 120),
        href: c.targetType === "blog_post" ? `blog?post=${c.targetId}` : `community?post=${c.targetId}`,
      });
    }
    if (hits.length >= limit) return hits;
  }

  for (const a of db.announcements) {
    if (a.status !== "published" && user.role === "student") continue;
    if (a.title.toLowerCase().includes(q) || a.bodyHtml.toLowerCase().includes(q)) {
      hits.push({
        type: "announcement",
        id: a.id,
        title: a.title,
        snippet: a.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 120),
        href: `announcements`,
      });
    }
  }

  if (canManageSupport(user) || true) {
    for (const t of db.tickets) {
      if (!canManageSupport(user) && t.requesterId !== user.id) continue;
      if (
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q)
      ) {
        hits.push({
          type: "ticket",
          id: t.id,
          title: t.ticketNumber,
          snippet: t.subject,
          href: `support?ticket=${t.id}`,
        });
      }
    }
  }

  for (const p of db.blogPosts) {
    if (p.status !== "published" && !canManageBlog(user)) continue;
    if (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)) {
      hits.push({
        type: "blog",
        id: p.id,
        title: p.title,
        snippet: p.excerpt.slice(0, 120),
        href: `/blog/${p.slug}`,
      });
    }
  }

  for (const u of readAuthDb().users) {
    if (u.status !== "active") continue;
    const profile = toUserProfile(u);
    const hay = `${profile.fullName ?? ""} ${profile.email}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: "user",
        id: u.id,
        title: profile.fullName || profile.email,
        snippet: `${u.role} · ${profile.email}`,
        href: `messages?peer=${u.id}`,
      });
    }
    if (hits.length >= limit) break;
  }

  return hits.slice(0, limit);
}
