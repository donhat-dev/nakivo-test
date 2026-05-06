import axios from "axios";
import type { OdooSessionInfo } from "../types/api";
import { clearAuthSession } from "../lib/auth-session";

const ODOO_DB = import.meta.env.VITE_ODOO_DB ?? "nakivo_crm";

// Uses /web Odoo session endpoints — proxied by Vite/nginx alongside /api.
// Bare axios with withCredentials so the session cookie is stored/sent correctly.

export async function login(credentials: {
  login: string;
  password: string;
}): Promise<OdooSessionInfo> {
  const { data } = await axios.post(
    "/web/session/authenticate",
    {
      jsonrpc: "2.0",
      method: "call",
      params: {
        db: ODOO_DB,
        login: credentials.login,
        password: credentials.password,
      },
    },
    { withCredentials: true },
  );

  if (!data.result?.uid) {
    throw new Error("Invalid email or password.");
  }

  return data.result as OdooSessionInfo;
}

export async function logout(): Promise<void> {
  await axios
    .post(
      "/web/session/destroy",
      { jsonrpc: "2.0", method: "call", params: {} },
      { withCredentials: true },
    )
    .catch(() => {});
  clearAuthSession();
}
