/**
 * Blog module — categories, posts, SEO, related articles, comment moderation hooks.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertCanManageBlog,
  CommunicationError,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import {
  readCommunicationDb,
  writeCommunicationDb,
} from "@/services/communication/store";
import type { BlogCategory, BlogPost, BlogPostStatus } from "@/types/communication";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function listBlogCategories(): BlogCategory[] {
  return readCommunicationDb().blogCategories;
}

export function listBlogPosts(filters?: {
  status?: BlogPostStatus | "all";
  categoryId?: string;
  tag?: string;
  q?: string;
  publicOnly?: boolean;
}): BlogPost[] {
  let rows = [...readCommunicationDb().blogPosts];
  if (filters?.publicOnly) {
    rows = rows.filter((p) => p.status === "published");
    // Promote scheduled that are due
    const now = nowIso();
    rows = rows.concat(
      readCommunicationDb().blogPosts.filter(
        (p) =>
          p.status === "scheduled" &&
          p.scheduledAt &&
          p.scheduledAt <= now &&
          !rows.some((r) => r.id === p.id),
      ),
    );
    // Also auto-publish due scheduled in store
    writeCommunicationDb((db) => {
      for (const p of db.blogPosts) {
        if (p.status === "scheduled" && p.scheduledAt && p.scheduledAt <= now) {
          p.status = "published";
          p.publishedAt = p.publishedAt ?? now;
        }
      }
    });
    rows = readCommunicationDb().blogPosts.filter((p) => p.status === "published");
  } else if (filters?.status && filters.status !== "all") {
    rows = rows.filter((p) => p.status === filters.status);
  }
  if (filters?.categoryId) rows = rows.filter((p) => p.categoryId === filters.categoryId);
  if (filters?.tag) {
    const tag = filters.tag.toLowerCase();
    rows = rows.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.bodyHtml.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) =>
    (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt),
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return readCommunicationDb().blogPosts.find((p) => p.slug === slug) ?? null;
}

export function getBlogPostById(id: string): BlogPost | null {
  return readCommunicationDb().blogPosts.find((p) => p.id === id) ?? null;
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const published = listBlogPosts({ publicOnly: true }).filter((p) => p.id !== post.id);
  const related = published.filter(
    (p) =>
      post.relatedIds.includes(p.id) ||
      p.categoryId === post.categoryId ||
      p.tags.some((t) => post.tags.includes(t)),
  );
  return (related.length ? related : published).slice(0, limit);
}

export async function upsertBlogPost(input: {
  user: UserProfile;
  id?: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl?: string | null;
  categoryId?: string | null;
  tags?: string[];
  status: BlogPostStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  scheduledAt?: string | null;
  relatedIds?: string[];
}): Promise<BlogPost> {
  assertCanManageBlog(input.user);
  const moderation = moderateText(input.bodyHtml.replace(/<[^>]+>/g, " "), {
    contentType: "post",
    contentId: input.id ?? "new",
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Blog content blocked by moderation", 422);
  }

  const stamp = nowIso();
  let savedId: string | null = input.id ?? null;

  writeCommunicationDb((db) => {
    if (input.id) {
      const existing = db.blogPosts.find((p) => p.id === input.id);
      if (!existing) return;
      existing.title = input.title.trim();
      existing.slug = slugify(input.title) || existing.slug;
      existing.excerpt = input.excerpt.trim();
      existing.bodyHtml = input.bodyHtml;
      existing.featuredImageUrl = input.featuredImageUrl ?? existing.featuredImageUrl;
      existing.categoryId = input.categoryId ?? existing.categoryId;
      existing.tags = input.tags ?? existing.tags;
      existing.status = input.status;
      existing.seoTitle = input.seoTitle ?? existing.seoTitle;
      existing.seoDescription = input.seoDescription ?? existing.seoDescription;
      existing.scheduledAt = input.scheduledAt ?? null;
      existing.relatedIds = input.relatedIds ?? existing.relatedIds;
      if (input.status === "published" && !existing.publishedAt) {
        existing.publishedAt = stamp;
      }
      existing.updatedAt = stamp;
      savedId = existing.id;
      return;
    }

    const post: BlogPost = {
      id: generateId(),
      title: input.title.trim(),
      slug: slugify(input.title) || generateId().slice(0, 8),
      excerpt: input.excerpt.trim(),
      bodyHtml: input.bodyHtml,
      featuredImageUrl: input.featuredImageUrl ?? null,
      categoryId: input.categoryId ?? null,
      tags: input.tags ?? [],
      status: input.status,
      authorId: input.user.id,
      authorName: input.user.fullName || input.user.email,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      scheduledAt: input.scheduledAt ?? null,
      publishedAt: input.status === "published" ? stamp : null,
      commentCount: 0,
      relatedIds: input.relatedIds ?? [],
      createdAt: stamp,
      updatedAt: stamp,
    };
    db.blogPosts.unshift(post);
    savedId = post.id;
  });

  const saved = savedId ? getBlogPostById(savedId) : null;
  if (!saved) throw new CommunicationError("Blog post not found", 404);

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.BLOG_POST_SAVED,
    entityType: "blog_post",
    entityId: saved.id,
    metadata: { status: saved.status },
  });

  return saved;
}

export function createBlogCategory(user: UserProfile, name: string): BlogCategory {
  assertCanManageBlog(user);
  const category: BlogCategory = {
    id: generateId(),
    name: name.trim(),
    slug: slugify(name) || generateId().slice(0, 6),
  };
  writeCommunicationDb((db) => {
    db.blogCategories.push(category);
  });
  return category;
}
