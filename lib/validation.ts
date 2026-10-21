// Topic validation rules, shared by the client and the server.
export const MAX_TOPIC_LENGTH = 100;

// Returns the trimmed topic, or null if the value is not a valid topic.
// A missing topic means "any joke" and is normalized to an empty string.
export function normalizeTopic(value: unknown): string | null {
  if (value === undefined) return "";
  if (typeof value !== "string") return null;
  const topic = value.trim();
  return topic.length > MAX_TOPIC_LENGTH ? null : topic;
}
