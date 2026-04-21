// Keep guest favorites backward-compatible with the old key.
const LEGACY_KEY = "likeProducts";
const KEY_PREFIX = "likeProducts:";
const EVENT = "likeProducts:changed";
const AUTH_EVENT = "auth:changed";

const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = String(token).split(".");
  if (parts.length < 2) return null;
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getUserIdFromAccessToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    const payload = decodeJwtPayload(token);
    const sub = payload?.sub;
    if (sub === undefined || sub === null || String(sub).trim() === "") return null;
    const parsed = Number(sub);
    return Number.isNaN(parsed) ? String(sub) : String(parsed);
  } catch {
    return null;
  }
};

const getStorageKey = () => {
  const userId = getUserIdFromAccessToken();
  // If not logged in (or token doesn't have a usable subject), treat as guest.
  if (!userId) return LEGACY_KEY;
  return `${KEY_PREFIX}${userId}`;
};

const safeParseList = (raw) => {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const readLikeProducts = () => {
  const raw = localStorage.getItem(getStorageKey());
  return safeParseList(raw);
};

export const writeLikeProducts = (list) => {
  const safe = Array.isArray(list) ? list : [];
  localStorage.setItem(getStorageKey(), JSON.stringify(safe));
  // Same-tab notification for components.
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const isLikedProductId = (productId) => {
  if (productId == null) return false;
  const id = String(productId);
  return readLikeProducts().some((p) => String(p?.id) === id);
};

export const toggleLikeProduct = (productCard) => {
  if (!productCard?.id) return { liked: false, list: readLikeProducts() };
  const id = String(productCard.id);
  const list = readLikeProducts();
  const exists = list.some((p) => String(p?.id) === id);
  const next = exists ? list.filter((p) => String(p?.id) !== id) : [productCard, ...list];
  writeLikeProducts(next);
  return { liked: !exists, list: next };
};

export const subscribeLikeProducts = (cb) => {
  const handler = () => cb?.(readLikeProducts());
  const onAuthChanged = () => handler();
  const onStorage = (e) => {
    if (!e) return;
    const key = getStorageKey();
    if (e.key === key) handler();
    if (
      e.key === "accessToken" ||
      e.key === "refreshToken" ||
      e.key === "accessTokenExpiresAt"
    ) {
      handler();
    }
  };

  window.addEventListener(EVENT, handler);
  window.addEventListener(AUTH_EVENT, onAuthChanged);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener(AUTH_EVENT, onAuthChanged);
    window.removeEventListener("storage", onStorage);
  };
};
