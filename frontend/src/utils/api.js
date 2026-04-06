import { createEncryptionKey, unlockEncryptionKey, clearDataKey } from "./crypto";
import { clearCache } from "./cache";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── token storage (in-memory, not localStorage) ─────────
let accessToken = null;

function setAccessToken(token) {
  accessToken = token;
}

function clearAccessToken() {
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

  // unlock encryption key if user has one (non-demo accounts)
  if (data.user.encryptedKey && data.user.keySalt) {
    await unlockEncryptionKey(password, data.user.encryptedKey, data.user.keySalt);
  }

  return data.user;
}

export async function signup(firstName, lastName, email, password, ageConfirmed) {
  // generate encryption key before signup so we can send it with the request
  const { encryptedKey, keySalt } = await createEncryptionKey(password);

  const data = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password, ageConfirmed, encryptedKey, keySalt }),
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function startDemo() {
  const data = await apiFetch("/api/auth/demo", { method: "POST" });
  setAccessToken(data.accessToken);
  // demo accounts skip encryption — data is throwaway
  return data.user;
}

export async function updatePurpose(purpose) {
  return apiFetch("/api/auth/me/purpose", {
    method: "PATCH",
    body: JSON.stringify({ purpose }),
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
    clearDataKey();
    clearCache().catch(() => {});
  }
}

async function fetchMe() {
  const data = await apiFetch("/api/auth/me");
  return data.user;
}

// attempt to restore session from refresh cookie on app load
// note: can't unlock encryption key here (no password available)
// App.jsx will show cached exercises until user re-enters password
export async function tryRestoreSession() {
  const token = await refreshAccessToken();
  if (!token) return null;
  return fetchMe();
}

// re-export for App.jsx to check vault lock state
export { hasDataKey } from "./crypto";