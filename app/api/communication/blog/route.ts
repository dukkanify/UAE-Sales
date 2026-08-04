import { NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  createBlogCategory,
  getBlogPostById,
  getRelatedPosts,
  listBlogCategories,
  listBlogPosts,
  upsertBlogPost,
} from "@/services/communication/blog-service";
import { addComment, listComments, moderateComment } from "@/services/communication/community-service";
import { canManageBlog } from "@/services/communication/access";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { BlogPostStatus } from "@/types/communication";

export async function GET(request: Request) {
  try {
    ensureCommunicationSeeded();
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "1";
    let user = null as Awaited<ReturnType<typeof requireAuth>> | null;
    try {
      user = await requireAuth();
    } catch {
      user = null;
    }

    if (searchParams.get("id")) {
      const post = getBlogPostById(searchParams.get("id")!);
      if (!post) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      if (post.status !== "published" && !(user && canManageBlog(user))) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          post,
          related: getRelatedPosts(post),
          comments: listComments("blog_post", post.id),
          categories: listBlogCategories(),
        },
        error: null,
      });
    }

    const posts = listBlogPosts({
      publicOnly: publicOnly || !(user && canManageBlog(user)),
      status: (searchParams.get("status") as BlogPostStatus | "all" | null) ?? undefined,
      q: searchParams.get("q") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
    });
    return NextResponse.json({
      success: true,
      data: { posts, categories: listBlogCategories() },
      error: null,
    });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (body?.action === "comment") {
      const authUser = await requireAuth();
      const comment = await addComment({
        user: authUser,
        targetType: "blog_post",
        targetId: String(body.postId ?? ""),
        body: String(body.body ?? ""),
        parentId: body.parentId ? String(body.parentId) : null,
      });
      return NextResponse.json({ success: true, data: comment, error: null });
    }

    const user = await requirePermission(PERMISSIONS.BLOG_MANAGE);

    if (body?.action === "category") {
      return NextResponse.json({
        success: true,
        data: createBlogCategory(user, String(body.name ?? "Category")),
        error: null,
      });
    }

    if (body?.action === "moderate_comment") {
      moderateComment(user, String(body.commentId ?? ""), body.status as "visible" | "pending" | "hidden");
      return NextResponse.json({ success: true, data: { ok: true }, error: null });
    }

    const post = await upsertBlogPost({
      user,
      id: body?.id ? String(body.id) : undefined,
      title: String(body?.title ?? "Untitled"),
      excerpt: String(body?.excerpt ?? ""),
      bodyHtml: String(body?.bodyHtml ?? ""),
      featuredImageUrl: (body?.featuredImageUrl as string | null) ?? null,
      categoryId: (body?.categoryId as string | null) ?? null,
      tags: (body?.tags as string[]) ?? [],
      status: (body?.status as BlogPostStatus) ?? "draft",
      seoTitle: (body?.seoTitle as string | null) ?? null,
      seoDescription: (body?.seoDescription as string | null) ?? null,
      scheduledAt: (body?.scheduledAt as string | null) ?? null,
      relatedIds: (body?.relatedIds as string[]) ?? [],
    });
    return NextResponse.json({ success: true, data: post, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
