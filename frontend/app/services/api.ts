const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

type CustomHeadersInit = HeadersInit & {
  Authorization?: string;
};

const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

const request = async <T>(
  endpoint: string,
  options: ApiOptions = {},
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<T>> => {
  try {
    if (setLoading) setLoading(true);

    // Always get token from localStorage
    const token = localStorage.getItem("token");
    const headers: CustomHeadersInit = {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }), // Conditional Content-Type
      ...(options.headers || {}),
    };

    // Automatically attach token if it exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    const data: T = await response.json();

    return { data };
  } catch (error) {
    return { error: isError(error) ? error.message : "Unknown error occurred" };
  } finally {
    if (setLoading) setLoading(false);
  }
};

const api = {
  get: <T>(
    endpoint: string,
    options: ApiOptions = {},
    setLoading?: (loading: boolean) => void
  ): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, { method: "GET", ...options }, setLoading);
  },

  post: <T>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
    setLoading?: (loading: boolean) => void
  ): Promise<ApiResponse<T>> => {
    return request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
        ...options,
      },
      setLoading
    );
  },

  patch: <T>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
    setLoading?: (loading: boolean) => void
  ): Promise<ApiResponse<T>> => {
    return request<T>(
      endpoint,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        ...options,
      },
      setLoading
    );
  },

  delete: <T>(
    endpoint: string,
    options: ApiOptions = {},
    setLoading?: (loading: boolean) => void
  ): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, { method: "DELETE", ...options }, setLoading);
  },

  // Special method for file uploads (multipart/form-data)
  upload: <T>(
    endpoint: string,
    formData: FormData,
    options: ApiOptions = {},
    setLoading?: (loading: boolean) => void
  ): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem("token")?.trim();
    const headers: CustomHeadersInit = {
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Remove Content-Type to let fetch set it automatically for multipart/form-data
    return request<T>(
      endpoint,
      {
        method: "POST",
        body: formData,
        headers,
        ...options,
      },
      setLoading
    );
  },
};

export default api;
