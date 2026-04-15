const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = getApiBase();
  if (!base) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${base}${normalized}`;
};

export const mapProductToCard = (product) => {
  const images =
    product?.images?.map((img) => resolveImageUrl(img?.imageUrl)) || [];
  return {
    id: product?.id,
    name: product?.name || "",
    image: images.length > 0 ? images : ["/vite.svg"],
    discount: 0,
    price: Number(product?.price || 0),
    count: product?.stock ?? 0,
    variants: product?.variants || [],
    categoryName: product?.categoryName || "",
    isActive: product?.isActive,
  };
};

export const mapReviewToComment = (review) => ({
  id: review?.id,
  name: review?.userName || "User",
  rating: Number(review?.rating || 0),
  comment: review?.comment || "",
  avatar: "/vite.svg",
});

export const buildVariantLabel = (variant) => {
  const attrs = variant?.attributes || [];
  if (!attrs.length) return "Default";

  const normalizeAttributeType = (type) => {
    const raw = String(type || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    const aliases = {
      color: "COLOR",
      size: "SIZE",
      material: "MATERIAL",
      storage: "STORAGE",
      ram: "RAM",
      weight: "WEIGHT",
    };
    return aliases[lower] || raw.toUpperCase();
  };

  return attrs
    .map((attr) => {
      const t = normalizeAttributeType(attr?.type);
      return `${t || attr?.type || ""}: ${attr?.value || ""}`.trim();
    })
    .join(" / ");
};
