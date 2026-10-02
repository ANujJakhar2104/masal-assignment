export type FieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly fields?: FieldErrors,
  ) {
    super(message);
  }
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error ?? `Request failed (${response.status})`, data?.fields);
  }
  return data as T;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
