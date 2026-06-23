const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type ApiClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
};

export const createApi = (getToken: () => string | null): ApiClient => {
  const request = async <T>(path: string, options: RequestInit = {}) => {
    const token = getToken();
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(payload.message || "Request failed", response.status);
    }

    return payload as T;
  };

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body || {}) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body || {}) }),
  };
};
