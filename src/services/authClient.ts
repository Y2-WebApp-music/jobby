import { createAuthClient } from "better-auth/client";
import { useAuthStore } from "@/store/auth";

const raw = import.meta.env.VITE_BETTER_AUTH_URL ?? "";
const proxyTarget = (
  import.meta.env.VITE_BETTER_AUTH_PROXY_TARGET ?? ""
).trim();
const normalizedProxyTarget = proxyTarget.replace(/\/+$/, "");
const baseURL = raw.startsWith("/")
  ? normalizedProxyTarget
    ? `${normalizedProxyTarget}${raw}`
    : `${window.location.origin}${raw}`
  : raw;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const clearAuthStore = () => {
  useAuthStore.getState().logout();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const hydrateAuthStoreFromPayload = (payload: unknown) => {
  const payloadObj = isRecord(payload) ? payload : null;
  const dataCandidate = payloadObj?.data;
  const data = isRecord(dataCandidate) ? dataCandidate : payloadObj;
  const user = isRecord(data?.user) ? data.user : null;
  const session = isRecord(data?.session) ? data.session : null;
  const token =
    (typeof data?.token === "string" ? data.token : null) ??
    (typeof session?.token === "string" ? session.token : null);

  if (!user) {
    return false;
  }

  const permissions =
    Array.isArray(user.permissions) &&
    user.permissions.every((p) => typeof p === "string")
      ? user.permissions
      : [];

  useAuthStore.getState().setUser({
    id: typeof user.id === "string" ? user.id : "",
    name:
      typeof user.name === "string"
        ? user.name
        : typeof user.email === "string"
          ? user.email
          : "User",
    email: typeof user.email === "string" ? user.email : "",
    role: typeof user.role === "string" ? user.role : "user",
    permissions,
  });
  useAuthStore.getState().setToken(token);
  return true;
};

export const hydrateAuthStoreFromSession = async () => {
  try {
    const sessionResult = (await authClient.getSession()) as unknown;
    const hydrated = hydrateAuthStoreFromPayload(sessionResult);
    if (!hydrated) {
      const { user, token } = useAuthStore.getState();
      if (!user && !token) {
        clearAuthStore();
      }
    }
  } catch {
    const { user, token } = useAuthStore.getState();
    if (!user && !token) {
      clearAuthStore();
    }
  }
};
