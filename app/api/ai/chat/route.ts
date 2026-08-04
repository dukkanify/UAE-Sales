import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAiSeeded, getAssistantBootstrap } from "@/services/ai";
import {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
  streamAssistantMessage,
  submitFeedback,
} from "@/services/ai/conversation-service";
import { aiErrorResponse } from "@/app/api/ai/_utils";

export async function GET(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "bootstrap";
    const id = searchParams.get("id");

    if (view === "bootstrap") {
      return NextResponse.json({
        success: true,
        data: getAssistantBootstrap(user),
        error: null,
      });
    }
    if (view === "conversations") {
      return NextResponse.json({
        success: true,
        data: listConversations(user),
        error: null,
      });
    }
    if (view === "messages" && id) {
      return NextResponse.json({
        success: true,
        data: getConversation(user, id),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: getAssistantBootstrap(user),
      error: null,
    });
  } catch (error) {
    return aiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      action?: string;
      message?: string;
      conversationId?: string | null;
      contextCourseId?: string | null;
      title?: string;
      stream?: boolean;
      messageId?: string;
      rating?: "up" | "down";
      comment?: string;
    };

    if (body.action === "feedback" && body.messageId && body.rating) {
      const feedback = await submitFeedback({
        user,
        messageId: body.messageId,
        rating: body.rating,
        comment: body.comment,
      });
      return NextResponse.json({ success: true, data: feedback, error: null });
    }

    if (body.action === "create") {
      const conversation = await createConversation({
        user,
        title: body.title,
        contextCourseId: body.contextCourseId,
      });
      return NextResponse.json({ success: true, data: conversation, error: null });
    }

    if (!body.message?.trim()) {
      return NextResponse.json(
        { success: false, data: null, error: "message required" },
        { status: 400 },
      );
    }

    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of streamAssistantMessage({
              user,
              conversationId: body.conversationId,
              message: body.message!,
            })) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
              );
            }
            controller.close();
          } catch (error) {
            const message = error instanceof Error ? error.message : "Stream failed";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", data: { message } })}\n\n`,
              ),
            );
            controller.close();
          }
        },
      });
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const result = await sendMessage({
      user,
      conversationId: body.conversationId,
      message: body.message,
      contextCourseId: body.contextCourseId,
    });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
