import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { demoUsers } from "../data/demoUsers";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const normalizedEmail = String(email || "").trim().toLowerCase();

        const matchedUser = demoUsers.find(
          (item) =>
            item.email.toLowerCase() === normalizedEmail &&
            item.password === password &&
            item.status === "Active"
        );

        if (!matchedUser) {
          return {
            success: false,
            error: "Invalid email or password, or this account is inactive.",
          };
        }

        // Do not store the demo password in the persisted session.
        const safeUser = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        };

        set({
          user: safeUser,
          isAuthenticated: true,
        });

        return { success: true, user: safeUser };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      hasRole: (roles = []) => {
        const role = get().user?.role;
        return roles.includes(role);
      },
    }),
    {
      name: "stockflow-demo-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
