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
};

type AuthActions = {
  getUser: () => AuthState["user"];
  getToken: () => AuthState["token"];
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: AuthState["token"]) => void;
  logout: () => void;
};

export const useAuthStore = create(
  combine<AuthState, AuthActions>(
    {
      user: null,
      token: null,
    },
    (set, get) => ({
      getUser: () => get().user,
      getToken: () => get().token,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
  ),
);
