//
// Basic API utility for the weather app.
// It resolves the API base URL from available Vite env vars and exposes a typed fetch method.
//
// Priority order: VITE_API_BASE -> VITE_BACKEND_URL -> fallback placeholder.
//
// TODO: Wire this to a real backend endpoint and remove the placeholder once available.
//

// PUBLIC_INTERFACE
export function getApiBase(): string {
  /** Returns API base URL from env, falling back to a placeholder if not set. */
  const base =
    (import.meta as any).env?.VITE_API_BASE ||
    (import.meta as any).env?.VITE_BACKEND_URL ||
    '';

  // Fallback placeholder when no env-based backend URL is provided.
  // This endpoint is a public demo API just for illustrative purposes.
  return base || 'https://api.open-meteo.com/v1';
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/**
 * PUBLIC_INTERFACE
 */
export async function apiGet<T>(pathOrUrl: string, params?: Record<string, any>): Promise<ApiResult<T>> {
  /** Performs a GET request to the resolved API, supports absolute or relative URLs. */
  try {
    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const urlBase = isAbsolute ? '' : getApiBase();
    const url = new URL(isAbsolute ? pathOrUrl : urlBase.replace(/\/+$/, '') + '/' + pathOrUrl.replace(/^\/+/, ''));

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: text || 'Request failed', status: res.status };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}
