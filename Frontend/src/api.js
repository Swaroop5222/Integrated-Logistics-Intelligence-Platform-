const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("shiptrackToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token missing, invalid, or expired — clear the stale session so the
      // user isn't left in a state where the UI thinks they're logged in
      // but every API call keeps failing.
      localStorage.removeItem("shiptrackToken");
      localStorage.removeItem("shiptrackUser");
    }

    const message =
      data?.message ||
      data?.error ||
      data ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export const API_BASE = API_BASE_URL;
