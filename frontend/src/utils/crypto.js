// ── Web Crypto API wrapper for zero-knowledge exercise encryption ──
//
// Pattern: same as 1Password / ProtonMail
//   1. User's password → PBKDF2 → wrapping key (AES-KW)
//   2. Random data key (AES-256-GCM) encrypts exercise fields
//   3. Wrapping key encrypts data key → stored on server as opaque blob
//   4. Server never sees plaintext exercise names or notes

const PBKDF2_ITERATIONS = 600_000;

// ── in-memory key storage (like the access token) ────────
let dataKey = null;

export function setDataKey(key) {
  dataKey = key;
}

export function getDataKey() {
  return dataKey;
}

export function clearDataKey() {
  dataKey = null;
}

export function hasDataKey() {
  return dataKey !== null;
}

// ── key derivation ───────────────────────────────────────

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveWrappingKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-KW", length: 256 },
    false,
    ["wrapKey", "unwrapKey"],
  );
}

// ── data key management ──────────────────────────────────

export async function generateDataKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable so we can wrap it
    ["encrypt", "decrypt"],
  );
}

export async function wrapDataKey(dataKey, wrappingKey) {
  const wrapped = await crypto.subtle.wrapKey("raw", dataKey, wrappingKey, "AES-KW");
  return bufToBase64(new Uint8Array(wrapped));
}

export async function unwrapDataKey(wrappedBase64, wrappingKey) {
  const wrappedBuf = base64ToBuf(wrappedBase64);
  return crypto.subtle.unwrapKey(
    "raw",
    wrappedBuf,
    wrappingKey,
    "AES-KW",
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

// ── encrypt / decrypt strings ────────────────────────────

export async function encrypt(plaintext, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );
  return bufToBase64(iv) + "." + bufToBase64(new Uint8Array(cipherBuf));
}

export async function decrypt(payload, key) {
  const [ivB64, ctB64] = payload.split(".");
  const iv = base64ToBuf(ivB64);
  const cipherBuf = base64ToBuf(ctB64);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBuf,
  );
  return new TextDecoder().decode(plainBuf);
}

// ── exercise-level helpers ───────────────────────────────

export async function encryptExercise(exercise) {
  if (!dataKey) return exercise;
  return {
    ...exercise,
    name: await encrypt(exercise.name, dataKey),
    notes: exercise.notes ? await encrypt(exercise.notes, dataKey) : "",
  };
}

export async function decryptExercise(exercise) {
  if (!dataKey) return exercise;
  // skip decryption if the name doesn't look encrypted (no dot separator)
  if (!exercise.name.includes(".")) return exercise;
  return {
    ...exercise,
    name: await decrypt(exercise.name, dataKey),
    notes: exercise.notes ? await decrypt(exercise.notes, dataKey) : "",
  };
}

export async function decryptExercises(exercises) {
  if (!dataKey) return exercises;
  return Promise.all(exercises.map(decryptExercise));
}

// ── signup: generate and wrap a fresh data key ───────────

export async function createEncryptionKey(password) {
  const salt = generateSalt();
  const wrappingKey = await deriveWrappingKey(password, salt);
  const newDataKey = await generateDataKey();
  const wrappedKey = await wrapDataKey(newDataKey, wrappingKey);
  setDataKey(newDataKey);
  return { encryptedKey: wrappedKey, keySalt: bufToBase64(salt) };
}

// ── login: unwrap the stored data key ────────────────────

export async function unlockEncryptionKey(password, encryptedKey, keySalt) {
  const salt = base64ToBuf(keySalt);
  const wrappingKey = await deriveWrappingKey(password, salt);
  const unwrapped = await unwrapDataKey(encryptedKey, wrappingKey);
  setDataKey(unwrapped);
}

// ── base64 helpers ───────────────────────────────────────

function bufToBase64(buf) {
  let binary = "";
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}
