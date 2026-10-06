export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export let csrfToken = "";
export function setCsrf(value: string) {
  csrfToken = value;
}
export async function api<T = any>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      headers: {
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(!["GET", "HEAD"].includes(method) && csrfToken
          ? { "X-CSRF-Token": csrfToken }
          : {}),
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    if (!response.ok)
      throw new ApiError(response.status, result.error || "Request failed.");
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Connection unavailable. Your encrypted offline copy is unchanged.",
    );
  } finally {
    clearTimeout(timer);
  }
}
