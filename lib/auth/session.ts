import { cookies } from "next/headers";

import { getApiUrl } from "@/lib/api/config";

export const accessCookieName = "psicotips_access";
export const refreshCookieName = "psicotips_refresh";

export async function hasValidAccessSession(): Promise<boolean> {
  const apiUrl = getApiUrl();
  const accessToken = (await cookies()).get(accessCookieName)?.value;

  if (!apiUrl || !accessToken) return false;

  try {
    const response = await fetch(`${apiUrl}/api/auth/token/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: accessToken }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
