import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import variantApi from "@/utils/api/variantApi";
import attributeApi from "@/utils/api/attributeApi";
import productApi from "@/utils/api/productApi";
import { buildVariantLabel, resolveImageUrl } from "@/utils/api/mappers";

const ATTRIBUTE_TYPES = [
	{ label: "Color", value: "COLOR" },
	{ label: "Size", value: "SIZE" },
	{ label: "Material", value: "MATERIAL" },
	{ label: "Storage", value: "STORAGE" },
	{ label: "RAM", value: "RAM" },
	{ label: "Weight", value: "WEIGHT" },
];

const ProductVariantModal = ({
	isOpen,
	onClose,
	product,
	onVariantsUpdated,
}) => {
	const [variants, setVariants] = useState([]);
	const [loading, setLoading] = useState(false);
	const [variantFormOpen, setVariantFormOpen] = useState(false);
	const [variantFormType, setVariantFormType] = useState("add");
	const [variantForm, setVariantForm] = useState({
		id: "",
		price: "",
		stock: "",
		imageFile: null,
		imageUrl: "",
	});

	const [attrModalOpen, setAttrModalOpen] = useState(false);
	const [attrLoading, setAttrLoading] = useState(false);
	const [attributes, setAttributes] = useState([]);
	const [attrEditing, setAttrEditing] = useState(null);
	const [attrForm, setAttrForm] = useState({ type: "COLOR", value: "" });
	const [selectedVariant, setSelectedVariant] = useState(null);

	const refreshVariants = async () => {
		if (!product?.id) return;
		setLoading(true);
		try {
			const res = await productApi.getById(product.id);
			const productData = res?.data?.data;
			setVariants(productData?.variants || []);
			if (onVariantsUpdated) onVariantsUpdated();
		} catch (error) {
			console.error("Load variants error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			refreshVariants();
		}
	}, [isOpen, product?.id]);

	if (!isOpen || !product) return null;

	const openAddVariant = () => {
		setVariantFormType("add");
		setVariantForm({
			id: "",
			price: "",
			stock: "",
			imageFile: null,
			imageUrl: "",
		});
		setVariantFormOpen(true);
	};

	const openEditVariant = (variant) => {
		setVariantFormType("edit");
		setVariantForm({
			id: variant.id,
			price: variant.price ?? "",
			stock: variant.stock ?? "",
			imageFile: null,
			imageUrl: variant.imageUrl || "",
		});
		setVariantFormOpen(true);
	};

	const handleVariantSubmit = async (e) => {
		e.preventDefault();
		if (!product?.id) return;
		if (variantForm.price === "" || variantForm.stock === "") {
			alert("Nhập giá và tồn kho.");
			return;
		}
		const form = new FormData();
		form.append("productId", product.id);
		form.append("price", String(variantForm.price));
		form.append("stock", String(variantForm.stock));
		if (variantForm.imageFile) {
			form.append("image", variantForm.imageFile);
		}
		try {
			if (variantFormType === "add") {
				await variantApi.create(form);
			} else {
				await variantApi.update(variantForm.id, form);
			}
			setVariantFormOpen(false);
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể lưu biến thể.";
			alert(message);
		}
	};

	const handleDeleteVariant = async (variant) => {
		if (!window.confirm("Xóa biến thể này?")) return;
		try {
			await variantApi.remove(variant.id);
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể xóa biến thể.";
			alert(message);
		}
	};

	const openAttributes = async (variant) => {
		setSelectedVariant(variant);
		setAttrModalOpen(true);
		setAttrLoading(true);
		try {
			const res = await attributeApi.getByVariant(variant.id);
			setAttributes(res?.data?.data || []);
		} catch (error) {
			console.error("Load attributes error:", error);
		} finally {
			setAttrLoading(false);
		}
	};

	const handleAddAttribute = async (e) => {
		e.preventDefault();
		if (!selectedVariant) return;
		if (!attrForm.value.trim()) {
			alert("Nhập giá trị.");
			return;
		}
		try {
			const res = await attributeApi.create(selectedVariant.id, {
				type: attrForm.type,
				value: attrForm.value.trim(),
			});
			setAttributes((prev) => [...prev, res?.data?.data].filter(Boolean));
			setAttrForm((prev) => ({ ...prev, value: "" }));
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể thêm thuộc tính.";
			alert(message);
		}
	};

	const startEditAttr = (attr) => {
		setAttrEditing({ ...attr });
	};

	const handleUpdateAttr = async (e) => {
		e.preventDefault();
		if (!attrEditing) return;
		try {
			const res = await attributeApi.update(attrEditing.id, {
				type: attrEditing.type,
				value: attrEditing.value,
			});
			setAttributes((prev) =>
				prev.map((item) => (item.id === attrEditing.id ? res?.data?.data : item))
			);
			setAttrEditing(null);
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể cập nhật thuộc tính.";
			alert(message);
		}
	};

	const handleDeleteAttr = async (attr) => {
		try {
			await attributeApi.remove(attr.id);
			setAttributes((prev) => prev.filter((item) => item.id !== attr.id));
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể xóa thuộc tính.";
			alert(message);
		}
	};

	const closeAttrModal = () => {
		setAttrModalOpen(false);
		setAttrEditing(null);
		setAttributes([]);
		setSelectedVariant(null);
		setAttrForm({ type: "COLOR", value: "" });
	};

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg font-semibold">
							Variants: {product.name || product.id}
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="flex items-center justify-between">
						<label className="block text-sm font-medium text-gray-700">
							Variants
						</label>
						<button
							type="button"
							onClick={openAddVariant}
							className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
						>
							Add Variant
						</button>
					</div>

					{loading ? (
						<p className="text-sm text-gray-500 mt-3">Đang tải...</p>
					) : (
						<div className="mt-3 space-y-2">
							{variants.map((variant) => (
								<div
									key={variant.id}
									className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="text-sm">
										<div className="font-medium">
											{buildVariantLabel(variant)}
										</div>
										<div className="text-gray-500">
											Price: {variant.price ?? "-"} | Stock: {variant.stock ?? "-"}
										</div>
									</div>
									<div className="flex items-center gap-2">
										{variant.imageUrl && (
											<img
												src={resolveImageUrl(variant.imageUrl)}
												alt="variant"
												className="h-10 w-10 rounded object-cover"
											/>
										)}
										<button
											type="button"
											onClick={() => openEditVariant(variant)}
											className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => openAttributes(variant)}
											className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
										>
											Attributes
										</button>
										<button
											type="button"
											onClick={() => handleDeleteVariant(variant)}
											className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
										>
											Delete
										</button>
									</div>
								</div>
							))}
							{variants.length === 0 && (
								<p className="text-sm text-gray-500">Chưa có biến thể.</p>
							)}
						</div>
					)}
				</div>
			</div>

			{variantFormOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-lg rounded-lg bg-white p-6">
						<h3 className="text-lg font-semibold">
							{variantFormType === "add" ? "Add variant" : "Edit variant"}
						</h3>
						<form onSubmit={handleVariantSubmit} className="mt-4 space-y-3">
							<input
								type="number"
								step="0.01"
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								placeholder="Price"
								value={variantForm.price}
								onChange={(e) =>
									setVariantForm((prev) => ({ ...prev, price: e.target.value }))
								}
							/>
							<input
								type="number"
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								placeholder="Stock"
								value={variantForm.stock}
								onChange={(e) =>
									setVariantForm((prev) => ({ ...prev, stock: e.target.value }))
								}
							/>
							{variantForm.imageUrl && (
								<img
									src={resolveImageUrl(variantForm.imageUrl)}
									alt="variant"
									className="h-16 w-16 rounded object-cover"
								/>
							)}
							<input
								type="file"
								accept="image/*"
								onChange={(e) =>
									setVariantForm((prev) => ({
										...prev,
										imageFile: e.target.files?.[0] || null,
									}))
								}
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setVariantFormOpen(false)}
									className="rounded-md border border-gray-200 px-4 py-2"
								>
									Huy
								</button>
								<button
									type="submit"
									className="rounded-md bg-emerald-600 px-4 py-2 text-white"
								>
									Luu
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{attrModalOpen && selectedVariant && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-2xl rounded-lg bg-white p-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">
								Attributes: {selectedVariant.productName || "Variant"}
							</h3>
							<button
								type="button"
								onClick={closeAttrModal}
								className="text-gray-500"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<form onSubmit={handleAddAttribute} className="mt-4 flex gap-2">
							<select
								className="w-40 rounded-md border border-gray-200 px-3 py-2"
								value={attrForm.type}
								onChange={(e) =>
									setAttrForm((prev) => ({ ...prev, type: e.target.value }))
								}
							>
								{ATTRIBUTE_TYPES.map((item) => (
									<option key={item.value} value={item.value}>
										{item.label}
									</option>
								))}
							</select>
							<input
								className="flex-1 rounded-md border border-gray-200 px-3 py-2"
								placeholder="Giá trị"
								value={attrForm.value}
								onChange={(e) =>
									setAttrForm((prev) => ({ ...prev, value: e.target.value }))
								}
							/>
							<button
								type="submit"
								className="rounded-md bg-emerald-600 px-4 py-2 text-white"
							>
								Add
							</button>
						</form>

						{attrLoading ? (
							<p className="mt-4 text-sm text-gray-500">Đang tải...</p>
						) : (
							<div className="mt-4 space-y-2">
								{attributes.map((attr) => (
									<div
										key={attr.id}
										className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="text-sm">
											<strong>{attr.type}</strong>: {attr.value}
										</div>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => startEditAttr(attr)}
												className="rounded-md border border-gray-200 px-3 py-1 text-xs"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => handleDeleteAttr(attr)}
												className="rounded-md border border-gray-200 px-3 py-1 text-xs"
											>
												Delete
											</button>
										</div>
									</div>
								))}
								{attributes.length === 0 && (
									<p className="text-sm text-gray-500">Không có thuộc tính.</p>
								)}
							</div>
						)}

						{attrEditing && (
							<form
								onSubmit={handleUpdateAttr}
								className="mt-4 rounded-md border border-gray-200 p-4"
							>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
									<select
										className="w-full rounded-md border border-gray-200 px-3 py-2 sm:w-40"
										value={attrEditing.type}
										onChange={(e) =>
											setAttrEditing((prev) => ({
												...prev,
												type: e.target.value,
											}))
										}
									>
										{ATTRIBUTE_TYPES.map((item) => (
											<option key={item.value} value={item.value}>
												{item.label}
											</option>
										))}
									</select>
									<input
										className="flex-1 rounded-md border border-gray-200 px-3 py-2"
										value={attrEditing.value}
										onChange={(e) =>
											setAttrEditing((prev) => ({
												...prev,
												value: e.target.value,
											}))
										}
									/>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => setAttrEditing(null)}
											className="rounded-md border border-gray-200 px-3 py-2 text-sm"
										>
											Huy
										</button>
										<button
											type="submit"
											className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
										>
											Luu
										</button>
									</div>
								</div>
							</form>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductVariantModal;


