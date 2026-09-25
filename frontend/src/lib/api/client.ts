const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function currentUserId() {
  if (typeof window === "undefined") return "6";
  return window.localStorage.getItem("staybnb_user_id") ?? "6";
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured. Set it to the deployed API base URL.");
  }
  const headers = new Headers(options.headers);
  headers.set("X-User-Id", currentUserId());
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, { ...options, headers, cache: "no-store" });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null) as { detail?: string } | null;
  if (!response.ok) throw new ApiError(payload?.detail ?? `Request failed (${response.status})`, response.status);
  return payload as T;
}

export function setMockUserId(id: number) {
  window.localStorage.setItem("staybnb_user_id", String(id));
}
