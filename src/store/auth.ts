import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthState = {
  user: User | null;
  token: string | null;
  forceGuestNav: boolean;
};

type AuthActions = {
  getUser: () => AuthState["user"];
  getToken: () => AuthState["token"];
  getForceGuestNav: () => AuthState["forceGuestNav"];
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: AuthState["token"]) => void;
  setForceGuestNav: (forceGuestNav: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist(
    combine<AuthState, AuthActions>(
      {
        user: null,
        token: null,
        forceGuestNav: false,
      },
      (set, get) => ({
        getUser: () => get().user,
        getToken: () => get().token,
        getForceGuestNav: () => get().forceGuestNav,
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        setForceGuestNav: (forceGuestNav) => set({ forceGuestNav }),
        logout: () => set({ user: null, token: null, forceGuestNav: false }),
      }),
    ),
    {
      name: "jobby-auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        forceGuestNav: state.forceGuestNav,
      }),
    },
  ),
);
