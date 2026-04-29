import { createAuthClient } from "better-auth/client";
import { useAuthStore } from "@/store/auth";

const raw = import.meta.env.VITE_BETTER_AUTH_URL ?? "";
const baseURL = raw.startsWith("/") ? `${window.location.origin}${raw}` : raw;

export const authClient = createAuthClient({ baseURL });

export const clearAuthStore = () => {
  useAuthStore.getState().logout();
};

export const hydrateAuthStoreFromSession = async () => {
  try {
    const sessionResult = (await authClient.getSession()) as any;
    const data = sessionResult?.data ?? sessionResult;
    const user = data?.user;
    const session = data?.session;

    if (!user) {
      clearAuthStore();
      return;
    }

    useAuthStore.getState().setUser({
      id: user.id,
      name: user.name ?? user.email ?? "User",
      email: user.email ?? "",
      role: user.role ?? "user",
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    });
    useAuthStore.getState().setToken(session?.token ?? null);
  } catch {
    clearAuthStore();
  }
};
