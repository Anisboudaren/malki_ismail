export const LOGIN_CODE_COOLDOWN_MS = 90_000;

const STORAGE_KEY = "malki.loginCodeUntil";

export function remainingLoginCooldown(): number {
  if (typeof window === "undefined") return 0;
  const until = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
  if (!Number.isFinite(until) || until <= Date.now()) {
    window.localStorage.removeItem(STORAGE_KEY);
    return 0;
  }
  return Math.ceil((until - Date.now()) / 1000);
}

export function startLoginCooldown(waitMs = LOGIN_CODE_COOLDOWN_MS) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(Date.now() + waitMs));
}
