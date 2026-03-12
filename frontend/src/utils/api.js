const API_BASE = import.meta.env.VITE_API_URL || "";

// ── token storage (in-memory, not localStorage) ─────────
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// ── silent refresh ──────────────────────────────────────
async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends httpOnly cookie
    });

    if (!res.ok) {
      clearAccessToken();
      return null;
    }

    const data = await res.json();
    accessToken = data.accessToken;
    return accessToken;
  } catch {
    clearAccessToken();
    return null;
  }
}

// ── main fetch wrapper ──────────────────────────────────
export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // attach token if we have one
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // if 401, try a silent refresh then retry once
  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || data?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

// ── auth-specific calls ─────────────────────────────────
export async function login(email, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function signup(email, password) {
  const data = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

// attempt to restore session from refresh cookie on app load
export async function tryRestoreSession() {
  const token = await refreshAccessToken();
  return token !== null;
}