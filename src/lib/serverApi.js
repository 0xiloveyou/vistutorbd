const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

/**
 * Server-side GET helper for public content.
 * Returns `null` instead of crashing the page when the backend is unavailable.
 */
export async function serverGet(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      ...options,
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

export { API_BASE };