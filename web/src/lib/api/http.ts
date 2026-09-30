import { readSession } from "./session";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const session = readSession();
  const headers = new Headers(init?.headers);
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `El servicio respondió ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* el servicio no devolvió JSON */
    }
    throw new ApiError(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
