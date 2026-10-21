import { generateJoke } from "@/lib/joke-service";
import { normalizeTopic } from "@/lib/validation";

export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const topic = normalizeTopic((body as { topic?: unknown }).topic);
  if (topic === null) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const joke = await generateJoke(topic);
    return Response.json({ joke });
  } catch (error) {
    // Log only the error type and status, never the topic or the joke.
    const status = (error as { status?: number }).status;
    console.error("joke generation failed", (error as Error).name, status ?? "");
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
