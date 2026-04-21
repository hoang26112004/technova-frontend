import React, { useEffect, useMemo, useState } from "react";
import { Edit, Layers, Plus, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LayoutAdmin from "./LayoutAdmin";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import ImageUploader from "@/components/admin/productAdmin/ImageUploader";
import productApi from "@/utils/api/productApi";
import attributeApi from "@/utils/api/attributeApi";
import variantApi from "@/utils/api/variantApi";
import { buildVariantLabel, resolveImageUrl } from "@/utils/api/mappers";

const ATTRIBUTE_TYPES = [
	{ label: "Màu sắc", value: "COLOR" },
	{ label: "Kích thước", value: "SIZE" },
	{ label: "Chất liệu", value: "MATERIAL" },
	{ label: "Bộ nhớ", value: "STORAGE" },
	{ label: "RAM", value: "RAM" },
	{ label: "Khối lượng", value: "WEIGHT" },
];

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

const VariantAdminPage = () => {
	const [products, setProducts] = useState([]);
	const [variants, setVariants] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProductId, setSelectedProductId] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [formType, setFormType] = useState("add");
	const [formData, setFormData] = useState({
		id: "",
		productId: "",
		price: "",
		stock: "",
		imageFile: null,
		imageUrl: "",
		images: [],
	});
	const [attributeDrafts, setAttributeDrafts] = useState([]);

	const navigate = useNavigate();

	const buildVariants = (items) =>
		items.flatMap((product) =>
			(product.variants || []).map((variant) => ({
				...variant,
				productId: product.id,
				productName: product.name || variant.productName || "",
			}))
		);

	const refreshProducts = async () => {
		setLoading(true);
		try {
			const res = await productApi.getProducts({ page: 0, size: 100, status: true });
			const items = res?.data?.data?.content || [];
			setProducts(items);
			setVariants(buildVariants(items));
		} catch (error) {
			console.error("Load products error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refreshProducts();
	}, []);

	const filteredVariants = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return variants.filter((variant) => {
			if (selectedProductId && variant.productId !== selectedProductId) {
				return false;
			}
			if (!query) return true;
			const label = buildVariantLabel(variant).toLowerCase();
			return (
				String(variant.id).toLowerCase().includes(query) ||
				(variant.productName || "").toLowerCase().includes(query) ||
				label.includes(query)
			);
		});
	}, [variants, selectedProductId, searchQuery]);

	const openAddModal = () => {
		setFormType("add");
		setFormData({
			id: "",
			productId: selectedProductId || "",
			price: "",
			stock: "",
			imageFile: null,
			imageUrl: "",
			images: [],
		});
		setAttributeDrafts([]);
		setModalOpen(true);
	};

	const openEditModal = (variant) => {
		const previewImages = variant.imageUrl
			? [resolveImageUrl(variant.imageUrl)]
			: [];
		setFormType("edit");
		setFormData({
			id: variant.id,
			productId: variant.productId || "",
			price: variant.price ?? "",
			stock: variant.stock ?? "",
			imageFile: null,
			imageUrl: variant.imageUrl || "",
			images: previewImages,
		});
		setAttributeDrafts([]);
		setModalOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.productId) {
			alert("Chọn sản phẩm.");
			return;
		}
		if (formData.price === "" || formData.stock === "") {
			alert("Nhập giá và tồn kho.");
			return;
		}
		const existingIds = variants
			.filter((variant) => variant.productId === formData.productId)
			.map((variant) => variant.id);
		const form = new FormData();
		form.append("productId", formData.productId);
		form.append("price", String(formData.price));
		form.append("stock", String(formData.stock));
		if (formData.imageFile) {
			form.append("image", formData.imageFile);
		}
		try {
			if (formType === "add") {
				await variantApi.create(form);
			} else {
				await variantApi.update(formData.id, form);
			}
			if (formType === "add" && attributeDrafts.length > 0) {
				const res = await productApi.getById(formData.productId);
				const product = res?.data?.data;
				const nextVariants = product?.variants || [];
				let createdVariant = nextVariants.find(
					(variant) => !existingIds.includes(variant.id)
				);
				if (!createdVariant) {
					createdVariant = nextVariants.find(
						(variant) =>
							String(variant.price ?? "") === String(formData.price) &&
							String(variant.stock ?? "") === String(formData.stock)
					);
				}
				if (createdVariant) {
					const payloads = attributeDrafts
						.map((attr) => ({
							type: attr.type,
							value: attr.value.trim(),
						}))
						.filter((attr) => attr.value);
					for (const payload of payloads) {
						await attributeApi.create(createdVariant.id, payload);
					}
					navigate(
						`/admin/attributes?variantId=${createdVariant.id}&productId=${formData.productId}`
					);
				}
			}
			setModalOpen(false);
			await refreshProducts();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể lưu biến thể.";
			alert(message);
		}
	};

	const handleDelete = async (variant) => {
		if (!window.confirm("Xóa phiên bản này?")) return;
		try {
			await variantApi.remove(variant.id);
			await refreshProducts();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể xóa biến thể.";
			alert(message);
		}
	};

	const handleImageUpload = (newImages) => {
		const nextImages = newImages.slice(0, 1);
		const first = nextImages[0];
		setFormData((prev) => ({
			...prev,
			images: nextImages,
			imageFile: first && first.startsWith("data:")
				? dataUrlToFile(first, "variant.png")
				: prev.imageFile,
		}));
	};

	const handleImageRemove = () => {
		setFormData((prev) => ({
			...prev,
			images: [],
			imageFile: null,
			imageUrl: "",
		}));
	};

	const handleAddAttributeRow = () => {
		setAttributeDrafts((prev) => [
			...prev,
			{ type: "COLOR", value: "" },
		]);
	};

	const handleUpdateAttributeRow = (index, field, value) => {
		setAttributeDrafts((prev) =>
			prev.map((attr, idx) =>
				idx === index ? { ...attr, [field]: value } : attr
			)
		);
	};

	const handleRemoveAttributeRow = (index) => {
		setAttributeDrafts((prev) => prev.filter((_, idx) => idx !== index));
	};

	return (
		<LayoutAdmin>
			<div className="flex-1 overflow-auto relative z-10">
				<HeaderAdmin title={"Phiên bản"} />
				<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
					<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-1 flex-col gap-3 sm:flex-row">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Tìm kiếm theo phiên bản, sản phẩm hoặc thuộc tính..."
									className="w-full rounded-lg border border-gray-200 px-3 py-2"
								/>
								<select
									value={selectedProductId}
									onChange={(e) => setSelectedProductId(e.target.value)}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 sm:w-64"
								>
									<option value="">Tất cả sản phẩm</option>
									{products.map((product) => (
										<option key={product.id} value={product.id}>
											{product.name || product.id}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={openAddModal}
									className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
								>
									Thêm phiên bản
								</button>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Phiên bản
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Sản phẩm
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Giá
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tồn kho
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Hình ảnh
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{loading ? (
										<tr>
											<td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>
												Đang tải...
											</td>
										</tr>
									) : (
										filteredVariants.map((variant) => (
											<tr key={variant.id} className="hover:bg-gray-50">
												<td className="px-4 py-4 text-sm">
													<div className="font-medium text-gray-900">
														{buildVariantLabel(variant)}
													</div>
													<div className="text-xs text-gray-500">
														{variant.id}
													</div>
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{variant.productName || variant.productId}
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{variant.price ?? "-"}
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{variant.stock ?? "-"}
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{variant.imageUrl ? (
														<img
															src={resolveImageUrl(variant.imageUrl)}
															alt="variant"
															className="h-10 w-10 rounded object-cover"
														/>
													) : (
														<span>-</span>
													)}
												</td>
												<td className="px-4 py-4 text-sm font-medium">
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => openEditModal(variant)}
															className="text-orange-500 hover:text-orange-700"
															title="Sửa"
														>
															<Edit className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() =>
																navigate(
																	`/admin/attributes?variantId=${variant.id}&productId=${variant.productId}`
																)
															}
															className="text-emerald-600 hover:text-emerald-800"
															title="Thuộc tính"
														>
															<Layers className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() => handleDelete(variant)}
															className="text-red-500 hover:text-red-700"
															title="Xóa"
														>
															<Trash className="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										))
									)}
									{!loading && filteredVariants.length === 0 && (
										<tr>
											<td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>
												Không có phiên bản nào.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</main>
			</div>

			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-lg rounded-lg bg-white p-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">
								{formType === "add" ? "Thêm phiên bản" : "Sửa phiên bản"}
							</h3>
							<button
								type="button"
								onClick={() => setModalOpen(false)}
								className="text-gray-500"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="mt-4 space-y-3">
							<select
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								value={formData.productId}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										productId: e.target.value,
									}))
								}
							>
								<option value="">Chọn sản phẩm</option>
								{products.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name || product.id}
									</option>
								))}
							</select>
							<input
								type="number"
								step="0.01"
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								placeholder="Giá"
								value={formData.price}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, price: e.target.value }))
								}
							/>
							<input
								type="number"
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								placeholder="Tồn kho"
								value={formData.stock}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, stock: e.target.value }))
								}
							/>
							<ImageUploader
								images={formData.images}
								onUpload={handleImageUpload}
								onRemove={handleImageRemove}
								maxImages={1}
							/>
							{formType === "add" && (
								<div className="rounded-lg border border-gray-200 p-3">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-gray-700">
											Thuộc tính (tùy chọn)
										</p>
										<button
											type="button"
											onClick={handleAddAttributeRow}
											className="inline-flex items-center gap-2 text-sm text-orange-600"
										>
											<Plus className="h-4 w-4" />
											Thêm
										</button>
									</div>
									{attributeDrafts.length === 0 ? (
										<p className="text-xs text-gray-500 mt-2">
											Chưa có thuộc tính.
										</p>
									) : (
										<div className="mt-3 space-y-2">
											{attributeDrafts.map((attr, index) => (
												<div
													key={`${attr.type}-${index}`}
													className="flex flex-col gap-2 sm:flex-row sm:items-center"
												>
													<select
														className="w-full rounded-md border border-gray-200 px-3 py-2 sm:w-40"
														value={attr.type}
														onChange={(e) =>
															handleUpdateAttributeRow(
																index,
																"type",
																e.target.value
															)
														}
													>
														{ATTRIBUTE_TYPES.map((item) => (
															<option key={item.value} value={item.value}>
																{item.label}
															</option>
														))}
													</select>
													<input
														type="text"
														className="flex-1 rounded-md border border-gray-200 px-3 py-2"
														placeholder="Giá trị"
														value={attr.value}
														onChange={(e) =>
															handleUpdateAttributeRow(
																index,
																"value",
																e.target.value
															)
														}
													/>
													<button
														type="button"
														onClick={() => handleRemoveAttributeRow(index)}
														className="text-xs text-red-500"
													>
														Xóa
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							)}
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setModalOpen(false)}
									className="rounded-md border border-gray-200 px-4 py-2"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="rounded-md bg-emerald-600 px-4 py-2 text-white"
								>
									Lưu
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</LayoutAdmin>
	);
};

export default VariantAdminPage;
