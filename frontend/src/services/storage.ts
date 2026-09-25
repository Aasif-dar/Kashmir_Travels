/** Safe localStorage wrapper — never throws (private mode, blocked storage, SSR). */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("zj:storage", { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("zj:storage", { detail: { key } }));
  } catch {
    /* ignore */
  }
}

export function subscribeStorage(key: string, cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onCustom = (e: Event) => {
    if ((e as CustomEvent).detail?.key === key) cb();
  };
  const onNative = (e: StorageEvent) => {
    if (e.key === key) cb();
  };
  window.addEventListener("zj:storage", onCustom);
  window.addEventListener("storage", onNative);
  return () => {
    window.removeEventListener("zj:storage", onCustom);
    window.removeEventListener("storage", onNative);
  };
}
