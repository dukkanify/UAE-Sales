import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  addComment,
  createPost,
  getCommunity,
  getPost,
  listComments,
  listPosts,
  pinPost,
} from "@/services/communication/community-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const community = getCommunity(id);
    if (!community) {
      return NextResponse.json(
        { success: false, data: null, error: "Community not found" },
        { status: 404 },
      );
    }
    const posts = listPosts(user, id, {
      q: searchParams.get("q") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 30),
      offset: Number(searchParams.get("offset") ?? 0),
    });
    return NextResponse.json({ success: true, data: { community, posts }, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request, context: Ctx) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      action?: "post" | "comment" | "pin";
      title?: string;
      body?: string;
      postId?: string;
      parentId?: string;
      pinned?: boolean;
      isAnnouncement?: boolean;
    } | null;

    if (body?.action === "comment" && body.postId) {
      const post = getPost(body.postId);
      if (!post || post.communityId !== id) {
        return NextResponse.json(
          { success: false, data: null, error: "Post not found" },
          { status: 404 },
        );
      }
      const comment = await addComment({
        user,
        targetType: "community_post",
        targetId: body.postId,
        body: body.body ?? "",
        parentId: body.parentId,
      });
      return NextResponse.json({
        success: true,
        data: { comment, comments: listComments("community_post", body.postId) },
        error: null,
      });
    }

    if (body?.action === "pin" && body.postId) {
      pinPost(user, body.postId, Boolean(body.pinned));
      return NextResponse.json({ success: true, data: { ok: true }, error: null });
    }

    const post = await createPost({
      user,
      communityId: id,
      title: body?.title ?? "Untitled",
      body: body?.body ?? "",
      isAnnouncement: body?.isAnnouncement,
      pinned: body?.pinned,
    });
    return NextResponse.json({ success: true, data: post, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
