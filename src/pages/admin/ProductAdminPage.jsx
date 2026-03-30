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

const mapProductToAdmin = (product) => {
  const images =
    product?.images?.map((img) => resolveImageUrl(img?.imageUrl)) || [];
  const variations =
    product?.variants?.length > 0
      ? product.variants.map(buildVariantLabel)
      : [];
  return {
    id: product?.id,
    name: product?.name || "",
    category: product?.categoryName || "",
    price: `$${Number(product?.price || 0).toFixed(2)}`,
    stock: product?.stock ?? 0,
    status: product?.isActive ? "Active" : "Inactive",
    image: images.length ? images : ["/vite.svg"],
    description: product?.description || "",
    sku: product?.id ? String(product.id).slice(0, 8) : "",
    lastUpdated: product?.createdDate
      ? new Date(product.createdDate).toLocaleDateString("en-US")
      : "",
    rating: 0,
    variations,
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

const ProductAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(product.id).toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "All" || product.status === statusFilter)
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
      const res = await productApi.getProducts({ page: 0, size: 50, status: true });
      const items = res?.data?.data?.content || [];
      setProducts(items.map(mapProductToAdmin));
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
      alert("Khong the cap nhat trang thai san pham.");
    } finally {
      setShowModal(null);
    }
  };

  const handleExportExcel = () => {
    exportProductsToExcel(filteredProducts);
  };

  const handleFormSubmit = async (formData) => {
    const category = categories.find(
      (c) => c.name.toLowerCase() === String(formData.category).toLowerCase()
    );
    if (!category) {
      alert("Khong tim thay danh muc.");
      return;
    }

    const payload = formatProductForSave(formData, selectedProduct);
    const form = new FormData();
    form.append("name", payload.name);
    form.append("description", payload.description || "");
    const priceValue = parseFloat(String(payload.price || 0).replace("$", "")) || 0;
    form.append("price", priceValue);
    form.append("categoryId", category.id);

    const existingImageUrls = (payload.image || []).filter(
      (img) => typeof img === "string" && !img.startsWith("data:")
    );
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
      alert("Luu san pham that bai.");
    }
  };

  return (
    <LayoutAdmin>
      <div className="flex-1 overflow-auto relative z-10">
        <HeaderAdmin title={"Products"} />
        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-5 mb-8 lg:grid-cols-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 10, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard
              name="Total Sales"
              icon={Zap}
              value="$12,345"
              color="#6366F1"
            />
            <StatCard
              name="New Users"
              icon={Users}
              value="1,234"
              color="#8B5CF6"
            />
            <StatCard
              name="Total Products"
              icon={ShoppingBag}
              value="567"
              color="#EC4899"
            />
            <StatCard
              name="Conversion Rate"
              icon={BarChart2}
              value="12,5%"
              color="#10B981"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 10, x: 0 }}
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
