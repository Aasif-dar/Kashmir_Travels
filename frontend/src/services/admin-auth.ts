/**
 * MOCK authentication for the demo admin area — NOT secure and NOT production auth.
 * Replace with a real identity provider / session cookie + server-side authorisation before launch.
 */
export const DEMO_ADMIN = { email: "admin@zabarwan.demo", password: "kashmir-demo" } as const;
const KEY = "zj.admin.session";

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function adminLogin(email: string, password: string): boolean {
  const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
  if (ok) {
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      return false;
    }
  }
  return ok;
}

export function adminLogout() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
