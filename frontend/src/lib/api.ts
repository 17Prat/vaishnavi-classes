export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/api/v1`
    : "http://127.0.0.1:8000/api/v1");

export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function getReceiptPdfUrl(receiptNumber: string): string {
  const cleanReceipt = receiptNumber.endsWith(".pdf") ? receiptNumber : `${receiptNumber}.pdf`;
  return `${BACKEND_BASE_URL}/receipts-pdf/${cleanReceipt}`;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined"
    ? (localStorage.getItem("vaishnavi_token") || localStorage.getItem("feeflow_token"))
    : null;

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
    // If unauthorized, redirect to login only when in private routes
    localStorage.removeItem("feeflow_token");
    localStorage.removeItem("feeflow_user");
    localStorage.removeItem("vaishnavi_token");
    localStorage.removeItem("vaishnavi_user");
    const p = window.location.pathname;
    if (p !== "/" && !p.startsWith("/login") && !p.startsWith("/verify-receipt")) {
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
