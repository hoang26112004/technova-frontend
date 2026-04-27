import authApi from "@/utils/api/authApi";
import { clearAdminFlag } from "@/utils/auth";

export const clearClientAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
  clearAdminFlag();
  try {
    window.dispatchEvent(new CustomEvent("auth:changed"));
  } catch {
    // Ignore non-browser environments.
  }
};

export const performLogout = async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Best-effort server logout; client token clear is what actually logs out in the UI.
    console.error("Logout error:", error);
  } finally {
    clearClientAuth();
  }
};

