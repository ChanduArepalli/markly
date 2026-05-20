import {
  Bookmark,
  BookmarkCreatePayload,
  BookmarkListResponse,
  BookmarkUpdatePayload,
  Collection,
  CollectionCreatePayload,
  Tag,
  TagCreatePayload,
  User,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include", // send httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  // If unauthorized, attempt to refresh the token and retry once
  if (res.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    try {
      const refreshRes = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry the original request
        const retryRes = await fetch(`${BASE}${path}`, {
          ...init,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...init.headers,
          },
        });

        if (retryRes.ok) {
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json();
        }
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────

export const auth = {
  register: (email: string, password: string, full_name: string, recaptcha_token?: string) =>
    request<any>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name, recaptcha_token }),
    }),

  login: (email: string, password: string, recaptcha_token?: string) =>
    request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, recaptcha_token }),
    }),

  googleAuthUrl: () => request<{ auth_url: string }>("/api/v1/auth/google"),

  logout: () => request("/api/v1/auth/logout", { method: "POST" }),

  me: () => request<User>("/api/v1/auth/me"),

  refresh: () => request("/api/v1/auth/refresh", { method: "POST" }),

  changePassword: (current_password: string, new_password: string) =>
    request("/api/v1/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password }),
    }),

  deleteAccount: () => request("/api/v1/auth/me", { method: "DELETE" }),
};

// ── Bookmarks ─────────────────────────────────────────────────────

export const bookmarks = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<BookmarkListResponse>(`/api/v1/bookmarks${qs}`);
  },

  search: (q: string, params?: Record<string, string | number | boolean>, page = 1, limit = 20) => {
    const qs = new URLSearchParams({ q, page: String(page), limit: String(limit), ...Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])) });
    return request<BookmarkListResponse>(`/api/v1/bookmarks/search?${qs}`);
  },

  get: (id: string) => request<Bookmark>(`/api/v1/bookmarks/${id}`),

  create: (payload: BookmarkCreatePayload) =>
    request<Bookmark>("/api/v1/bookmarks", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: BookmarkUpdatePayload) =>
    request<Bookmark>(`/api/v1/bookmarks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  delete: (id: string) => request(`/api/v1/bookmarks/${id}`, { method: "DELETE" }),
};

// ── Tags ──────────────────────────────────────────────────────────

export const tags = {
  list: () => request<Tag[]>("/api/v1/tags"),
  create: (payload: TagCreatePayload) =>
    request<Tag>("/api/v1/tags", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<TagCreatePayload>) =>
    request<Tag>(`/api/v1/tags/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (id: string) => request(`/api/v1/tags/${id}`, { method: "DELETE" }),
};

// ── Collections ───────────────────────────────────────────────────

export const collections = {
  list: () => request<Collection[]>("/api/v1/collections"),
  get: (id: string) => request<Collection>(`/api/v1/collections/${id}`),
  create: (payload: CollectionCreatePayload) =>
    request<Collection>("/api/v1/collections", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<CollectionCreatePayload>) =>
    request<Collection>(`/api/v1/collections/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (id: string) => request(`/api/v1/collections/${id}`, { method: "DELETE" }),
};
