const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("feeflow_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && typeof window !== "undefined") {
    // If unauthorized, redirect to login
    localStorage.removeItem("feeflow_token");
    localStorage.removeItem("feeflow_user");
    if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/verify-receipt")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let errorMsg = "An error occurred";
    try {
      const errJson = await res.json();
      errorMsg = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorMsg = await res.text() || res.statusText;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
