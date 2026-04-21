import React, { useEffect, useState } from "react";
import LayoutAdmin from "./LayoutAdmin";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { motion } from "framer-motion";
import ProductFilters from "@/components/admin/productAdmin/ProductFilters";
import ProductList from "@/components/admin/productAdmin/ProductList";
import ProductViewModal from "@/components/admin/productAdmin/ProductViewModal";
import ProductFormModal from "@/components/admin/productAdmin/ProductFormModal";
import {
  exportProductsToExcel,
  formatProductForSave,
  getProductStatusCounts,
} from "@/components/admin/productAdmin/productExcel";
import DeleteProductModal from "@/components/admin/productAdmin/DeleteProductModal";
import productApi from "@/utils/api/productApi";
import categoryApi from "@/utils/api/categoryApi";
import { buildVariantLabel, resolveImageUrl } from "@/utils/api/mappers";
import dashboardApi from "@/utils/api/dashboardApi";

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const formatOrdersPerUser = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number(value || 0)
  );

const mapProductToAdmin = (product) => {
  const images =
    product?.images?.map((img) => resolveImageUrl(img?.imageUrl)) || [];
  const variations =
    product?.variants?.length > 0
      ? product.variants.map(buildVariantLabel)
      : [];
  const isActive = Boolean(product?.isActive);
  return {
    id: product?.id,
    name: product?.name || "",
    category: product?.categoryName || "",
    categoryId: product?.categoryId || "",
    price: `$${Number(product?.price || 0).toFixed(2)}`,
    stock: product?.stock ?? 0,
    isActive,
    status: isActive ? "Active" : "Inactive",
    image: images.length ? images : ["/vite.svg"],
    description: product?.description || "",
    sku: product?.id ? String(product.id).slice(0, 8) : "",
    lastUpdated: product?.createdDate
      ? new Date(product.createdDate).toLocaleDateString("en-US")
      : "",
    rating: 0,
    variations,
    variantsRaw: product?.variants || [],
    tags: [],
  };
};

const dataUrlToFile = (dataUrl, filename) => {
  const arr = dataUrl.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const toUploadsPath = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("data:")) return null;
  if (url === "/vite.svg" || url.startsWith("/api/placeholder")) return null;

  if (url.startsWith("/uploads/")) return url;
  if (url.startsWith("uploads/")) return `/${url}`;

  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      return u.pathname && u.pathname.startsWith("/uploads/") ? u.pathname : null;
    } catch {
      return null;
    }
  }

  // Unknown non-data url; only keep it if it looks like an uploads path.
  return url.startsWith("/uploads/") ? url : null;
};

const ProductAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");

  const statusCounts = getProductStatusCounts(products);
  const lowStockThreshold = 5;

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(product.id).toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "All" ||
        (statusFilter === "Active" && product.isActive) ||
        (statusFilter === "Inactive" && !product.isActive) ||
        (statusFilter === "Low Stock" &&
          Number(product.stock || 0) > 0 &&
          Number(product.stock || 0) <= lowStockThreshold) ||
        (statusFilter === "Out of Stock" && Number(product.stock || 0) === 0))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue =
      sortConfig.key === "price"
        ? parseFloat(a[sortConfig.key].replace("$", ""))
        : a[sortConfig.key];
    const bValue =
      sortConfig.key === "price"
        ? parseFloat(b[sortConfig.key].replace("$", ""))
        : b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const refreshProducts = async () => {
    try {
      // Backend currently filters by boolean `status`, so to get "All" in admin
      // we need to load both active and inactive and merge.
      const [activeRes, inactiveRes] = await Promise.all([
        productApi.getProducts({ page: 0, size: 200, status: true }),
        productApi.getProducts({ page: 0, size: 200, status: false }),
      ]);
      const activeItems = activeRes?.data?.data?.content || [];
      const inactiveItems = inactiveRes?.data?.data?.content || [];
      const merged = [...activeItems, ...inactiveItems];
      const byId = new Map();
      merged.forEach((p) => {
        if (p?.id) byId.set(p.id, p);
      });
      setProducts(Array.from(byId.values()).map(mapProductToAdmin));
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  useEffect(() => {
    refreshProducts();
    categoryApi
      .getCategories({ page: 0, size: 50 })
      .then((res) => {
        setCategories(res?.data?.data?.content || []);
      })
      .catch((error) => {
        console.error("Load categories error:", error);
      });

    setDashboardLoading(true);
    dashboardApi
      .getOverview()
      .then((res) => {
        setDashboard(res?.data?.data || null);
      })
      .catch((error) => {
        console.error("Load dashboard overview error:", error);
        setDashboard(null);
      })
      .finally(() => setDashboardLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal("view");
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal("add");
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal("edit");
  };

  const handleDeleteProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal("delete");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productApi.toggleStatus(id);
      await refreshProducts();
    } catch (error) {
      alert("Không thể cập nhật trạng thái sản phẩm.");
    } finally {
      setShowModal(null);
    }
  };

  const handleExportExcel = () => {
    exportProductsToExcel(filteredProducts);
  };

  const handleFormSubmit = async (formData) => {
    const payload = formatProductForSave(formData, selectedProduct);
    const form = new FormData();
    form.append("name", payload.name);
    form.append("description", payload.description || "");
    const priceValue = parseFloat(String(payload.price || 0).replace("$", "")) || 0;
    form.append("price", priceValue);
    form.append("categoryId", formData.categoryId);

    const existingImageUrls = (payload.image || [])
      .map((img) => toUploadsPath(img))
      .filter(Boolean);
    existingImageUrls.forEach((url) => form.append("existingImageUrls", url));

    const newImages = (payload.image || []).filter(
      (img) => typeof img === "string" && img.startsWith("data:")
    );
    newImages.forEach((dataUrl, index) => {
      const file = dataUrlToFile(dataUrl, `upload-${index}.png`);
      form.append("images", file);
    });

    try {
      if (showModal === "add") {
        await productApi.create(form);
      } else if (showModal === "edit") {
        await productApi.update(formData.id, form);
      }
      await refreshProducts();
      setShowModal(null);
    } catch (error) {
      alert("Lưu sản phẩm thất bại.");
    }
  };

  return (
    <LayoutAdmin>
      <div className="flex-1 overflow-auto relative z-10">
        <HeaderAdmin title={"Sản phẩm"} />
        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-5 mb-8 lg:grid-cols-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/*<StatCard*/}
            {/*  name="Tổng doanh số"*/}
            {/*  icon={Zap}*/}
            {/*  value={*/}
            {/*    dashboardLoading*/}
            {/*      ? "..."*/}
            {/*      : formatCurrency(dashboard?.kpis?.totalSales)*/}
            {/*  }*/}
            {/*  color="#6366F1"*/}
            {/*/>*/}
            {/*<StatCard*/}
            {/*  name="Người dùng mới"*/}
            {/*  icon={Users}*/}
            {/*  value={*/}
            {/*    dashboardLoading ? "..." : formatNumber(dashboard?.kpis?.newUsers)*/}
            {/*  }*/}
            {/*  color="#8B5CF6"*/}
            {/*/>*/}
            {/*<StatCard*/}
            {/*  name="Tổng sản phẩm"*/}
            {/*  icon={ShoppingBag}*/}
            {/*  value={*/}
            {/*    dashboardLoading*/}
            {/*      ? "..."*/}
            {/*      : formatNumber(dashboard?.kpis?.totalProducts)*/}
            {/*  }*/}
            {/*  color="#EC4899"*/}
            {/*/>*/}
            {/*<StatCard*/}
            {/*  name="Đơn hàng / người dùng"*/}
            {/*  icon={BarChart2}*/}
            {/*  value={*/}
            {/*    dashboardLoading*/}
            {/*      ? "..."*/}
            {/*      : formatOrdersPerUser(dashboard?.kpis?.ordersPerUser)*/}
            {/*  }*/}
            {/*  color="#10B981"*/}
            {/*/>*/}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onExportExcel={handleExportExcel}
              onAddProduct={handleAddProduct}
              statusCounts={statusCounts}
              totalCount={products.length}
            />

            <ProductList
              products={sortedProducts}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              totalProducts={sortedProducts.length}
              onPageChange={setCurrentPage}
              onProductsPerPageChange={setProductsPerPage}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProductClick}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
            {showModal === "view" && selectedProduct && (
              <ProductViewModal
                product={selectedProduct}
                onClose={() => setShowModal(null)}
                onEdit={handleEditProduct}
              />
            )}

            {(showModal === "add" || showModal === "edit") && (
              <ProductFormModal
                isOpen={true}
                onClose={() => setShowModal(null)}
                onSubmit={handleFormSubmit}
                categories={categories}
                initialData={showModal === "edit" ? selectedProduct : null}
                formType={showModal}
              />
            )}

            {showModal === "delete" && selectedProduct && (
              <DeleteProductModal
                isOpen={true}
                onClose={() => setShowModal(null)}
                onConfirm={handleDeleteProduct}
                product={selectedProduct}
              />
            )}
          </motion.div>
        </main>
      </div>
    </LayoutAdmin>
  );
};

export default ProductAdminPage;
