import { create } from "zustand";
import { combine } from "zustand/middleware";

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
      setUser: (user) =>
        set({
          user,
          forceGuestNav: user === null ? get().forceGuestNav : false,
        }),
      setToken: (token) =>
        set({
          token,
          forceGuestNav: token === null ? get().forceGuestNav : false,
        }),
      setForceGuestNav: (forceGuestNav) => set({ forceGuestNav }),
      logout: () => set({ user: null, token: null, forceGuestNav: true }),
    }),
  ),
);
