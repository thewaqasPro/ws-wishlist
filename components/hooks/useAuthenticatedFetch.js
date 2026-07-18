import { useCallback } from "react";

export default function useAuthenticatedFetch() {
  return useCallback(async (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body)
      headers.set("Content-Type", "application/json");
    if (typeof window !== "undefined" && window.shopify?.idToken) {
      const token = await window.shopify.idToken();
      headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }, []);
}
