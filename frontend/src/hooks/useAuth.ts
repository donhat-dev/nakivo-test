import { hasAuthSession } from "../lib/auth-session";

export function useAuth() {
  return {
    isAuthenticated: hasAuthSession(),
  };
}
