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

  // Logs hold only the error type and status code: never the topic, the joke,
  // the model's text or the full error object (its message may echo the request).
  let joke: string | null;
  try {
    joke = await generateJoke(topic);
  } catch (error) {
    const status = (error as { status?: number }).status;
    // The class name (e.g. NotFoundError, APIConnectionTimeoutError) is more specific than error.name.
    const type = (error as object)?.constructor?.name ?? "UnknownError";
    console.error("joke generation failed", type, status ?? "");
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }

  if (joke === null) {
    console.warn("joke generation: no_joke", 422);
    return Response.json({ error: "no_joke" }, { status: 422 });
  }

  return Response.json({ joke });
}
