const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

/**
 * Server-side GET helper for public content.
 * Returns `null` instead of crashing the page when the backend is unavailable.
 */
export async function serverGet(path, options = {}) {
  const payload = await serverGetEnvelope(path, options);
  return payload?.data ?? null;
}

/**
 * Same as `serverGet`, but keeps the pagination envelope. Useful for server
 * components that render a pager.
 */
export async function serverGetWithMeta(path, options = {}) {
  const payload = await serverGetEnvelope(path, options);
  return {
    data: payload?.data ?? null,
    meta: payload?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

async function serverGetEnvelope(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      ...options,
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export { API_BASE };