import { auth } from "../services/auth.service";

/**
 * Custom fetch wrapper that automatically attaches the Firebase ID token
 * in the Authorization header when a user is signed in.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});

  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    } catch (err) {
      console.warn("[apiFetch] Failed to retrieve Firebase ID token:", err);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
