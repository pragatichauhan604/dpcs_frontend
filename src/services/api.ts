const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://dpcsbackend-production.up.railway.app/api";

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
  download(path: string): Promise<Blob>;
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
      const fieldErrors = payload.errors?.fieldErrors
        ? Object.entries(payload.errors.fieldErrors)
            .flatMap(([field, messages]) =>
              Array.isArray(messages)
                ? messages.map((message) => `${field}: ${message}`)
                : [],
            )
            .join("; ")
        : "";
      const fallback =
        response.status === 409
          ? "This email or license number is already registered."
          : "Request failed";
      const message =
        payload.message === "Already exists: field"
          ? fallback
          : payload.message;
      throw new ApiError(fieldErrors || message || fallback, response.status);
    }

    return payload as T;
  };

  const download = async (path: string) => {
    const token = getToken();
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new ApiError(payload.message || "Download failed", response.status);
    }

    return response.blob();
  };

  return {
    get: (path) => request(path),
    post: (path, body) =>
      request(path, { method: "POST", body: JSON.stringify(body || {}) }),
    patch: (path, body) =>
      request(path, { method: "PATCH", body: JSON.stringify(body || {}) }),
    download,
  };
};
