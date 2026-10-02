import { APICallError, LoadAPIKeyError, NoObjectGeneratedError, RetryError } from "ai";
import { z } from "zod";

export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

export function invalidInput(error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return Response.json(
    { error: formErrors[0] ?? "Please fix the highlighted fields.", fields: fieldErrors },
    { status: 400 },
  );
}

export function leadNotFound() {
  return Response.json({ error: "Lead not found" }, { status: 404 });
}

/** Turns AI SDK failures into something a salesperson can act on. Details go to the server log. */
export function describeAiError(error: unknown): { status: number; message: string } {
  const cause = RetryError.isInstance(error) ? error.lastError : error;

  if (APICallError.isInstance(cause) && (cause.statusCode === 429 || cause.statusCode === 503)) {
    return { status: 503, message: "The AI model is busy or at its free-tier limit. Try again in a minute." };
  }
  if (NoObjectGeneratedError.isInstance(cause)) {
    return { status: 502, message: "The AI returned an incomplete answer. Try again." };
  }
  if (LoadAPIKeyError.isInstance(cause)) {
    return { status: 500, message: "The AI model is not configured on the server." };
  }
  return { status: 502, message: "Couldn't reach the AI model. Try again." };
}

export function aiErrorResponse(error: unknown) {
  console.error(error);
  const { status, message } = describeAiError(error);
  return Response.json({ error: message }, { status });
}
