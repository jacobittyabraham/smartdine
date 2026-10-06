const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("smartdine_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers,
  cache: "no-store",
});

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "string" ? data : "Request failed"
    );
  }

  return data;
}