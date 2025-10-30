import { NextRequest } from "next/server";

const GRAPHRAG_SERVICE_URL = process.env.GRAPHRAG_SERVICE_URL || "http://localhost:9999";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${GRAPHRAG_SERVICE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from GraphRAG service" }),
        { status: response.status }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "No response stream available" }),
        { status: 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        reader.releaseLock();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("GraphRAG proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

