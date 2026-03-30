import adminUserApi from "./api/adminUserApi";

const ADMIN_CACHE_KEY = "isAdmin";

export const getAccessToken = () => localStorage.getItem("accessToken");

export const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  try {
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  const sub = payload?.sub;
  if (sub === undefined || sub === null) return null;
  const parsed = Number(sub);
  return Number.isNaN(parsed) ? sub : parsed;
};

export const getCachedAdminFlag = () => localStorage.getItem(ADMIN_CACHE_KEY);

export const setCachedAdminFlag = (value) => {
  localStorage.setItem(ADMIN_CACHE_KEY, value ? "true" : "false");
};

export const clearAdminFlag = () => {
  localStorage.removeItem(ADMIN_CACHE_KEY);
};

export const ensureAdminStatus = async () => {
  const cached = getCachedAdminFlag();
  if (cached === "true") return true;
  if (cached === "false") return false;

  const token = getAccessToken();
  if (!token) return false;

  const userId = getUserIdFromToken(token);
  if (!userId) return false;

  try {
    await adminUserApi.getById(userId);
    setCachedAdminFlag(true);
    return true;
  } catch {
    setCachedAdminFlag(false);
    return false;
  }
};
