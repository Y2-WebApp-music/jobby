import { createAuthClient } from "better-auth/client";
import { useAuthStore } from "@/store/auth";

const raw = import.meta.env.VITE_BETTER_AUTH_URL ?? "";
const baseURL = raw.startsWith("/") ? `${window.location.origin}${raw}` : raw;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const clearAuthStore = () => {
  useAuthStore.getState().logout();
};

export const hydrateAuthStoreFromPayload = (payload: unknown) => {
  const data = (payload as any)?.data ?? payload;
  const user = data?.user;
  const token = data?.token ?? data?.session?.token ?? null;

  if (!user) {
    return false;
  }

  useAuthStore.getState().setUser({
    id: user.id,
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    role: user.role ?? "user",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  });
  useAuthStore.getState().setToken(token);
  return true;
};

export const hydrateAuthStoreFromSession = async () => {
  try {
    const sessionResult = (await authClient.getSession()) as any;
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
