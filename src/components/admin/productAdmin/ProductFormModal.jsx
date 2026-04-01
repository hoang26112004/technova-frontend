import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ImageUploader from "./ImageUploader";
import variantApi from "@/utils/api/variantApi";
import attributeApi from "@/utils/api/attributeApi";
import productApi from "@/utils/api/productApi";
import { buildVariantLabel, resolveImageUrl } from "@/utils/api/mappers";

const ProductFormModal = ({
	isOpen,
	onClose,
	onSubmit,
	onVariantsUpdated,
	initialData,
	formType = "add",
}) => {
	const [formData, setFormData] = useState(
		initialData || {
			id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
			name: "",
			category: "",
			price: "",
			stock: "",
			status: "Active",
			description: "",
			sku: "",
			variations: [],
			tags: [],
			images: [],
		}
	);

	const [newTag, setNewTag] = useState("");
	const [variants, setVariants] = useState(initialData?.variantsRaw || []);
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

	const ATTRIBUTE_TYPES = [
		{ label: "Color", value: "COLOR" },
		{ label: "Size", value: "SIZE" },
		{ label: "Material", value: "MATERIAL" },
		{ label: "Storage", value: "STORAGE" },
		{ label: "RAM", value: "RAM" },
		{ label: "Weight", value: "WEIGHT" },
	];

	if (!isOpen) return null;

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddTag = () => {
		if (newTag.trim()) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag("");
		}
	};

	const handleRemoveTag = (index) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((_, i) => i !== index),
		}));
	};

	const handleImageUpload = (newImages) => {
		setFormData((prev) => ({
			...prev,
			images: [...prev.images, ...newImages].slice(0, 4),
		}));
	};

	const handleImageRemove = (index) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const priceNum = parseFloat(formData.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			alert("Please enter a valid price.");
			return;
		}
		if (!formData.name.trim() || !formData.category.trim()) {
			alert("Name and category are required.");
			return;
		}

		onSubmit(formData);
	};

	const refreshVariants = async () => {
		if (!initialData?.id) return;
		try {
			const res = await productApi.getById(initialData.id);
			const product = res?.data?.data;
			setVariants(product?.variants || []);
			if (onVariantsUpdated) onVariantsUpdated();
		} catch (error) {
			console.error("Load variants error:", error);
		}
	};

	useEffect(() => {
		setVariants(initialData?.variantsRaw || []);
	}, [initialData?.id]);

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
		if (!initialData?.id) return;
		if (variantForm.price === "" || variantForm.stock === "") {
			alert("Nhap gia va ton kho.");
			return;
		}
		const form = new FormData();
		form.append("productId", initialData.id);
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
				"Khong the luu variant.";
			alert(message);
		}
	};

	const handleDeleteVariant = async (variant) => {
		if (!window.confirm("Xoa variant nay?")) return;
		try {
			await variantApi.remove(variant.id);
			await refreshVariants();
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Khong the xoa variant.";
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
			alert("Nhap gia tri.");
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
				"Khong the them thuoc tinh.";
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
				"Khong the cap nhat thuoc tinh.";
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
				"Khong the xoa thuoc tinh.";
			alert(message);
		}
	};

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit} className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg font-semibold">
							{formType === "add"
								? "Add Product"
								: "Edit Product"}
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Product Name
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleFormChange}
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Category
							</label>
							<input
								type="text"
								name="category"
								value={formData.category}
								onChange={handleFormChange}
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Price ($)
							</label>
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleFormChange}
								step="0.01"
								min="0"
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Stock
							</label>
							<input
								type="number"
								name="stock"
								value={formData.stock}
								onChange={handleFormChange}
								min="0"
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Status
							</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleFormChange}
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
							>
								<option value="Active">Active</option>
								<option value="Low Stock">Low Stock</option>
								<option value="Out of Stock">
									Out of Stock
								</option>
								<option value="Clearance">Clearance</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								SKU
							</label>
							<input
								type="text"
								name="sku"
								value={formData.sku}
								onChange={handleFormChange}
								className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
						</div>
					</div>
					<div className="mt-6">
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleFormChange}
							className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
							rows="4"
						></textarea>
					</div>

					<ImageUploader
						images={formData.images}
						onUpload={handleImageUpload}
						onRemove={handleImageRemove}
						maxImages={4}
					/>

					<div className="mt-6">
						<div className="flex items-center justify-between">
							<label className="block text-sm font-medium text-gray-700">
								Variants
							</label>
							{formType === "edit" && (
								<button
									type="button"
									onClick={openAddVariant}
									className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
								>
									Add Variant
								</button>
							)}
						</div>
						{formType !== "edit" ? (
							<p className="text-sm text-gray-500 mt-2">
								Luu san pham truoc, sau do them variants.
							</p>
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
									<p className="text-sm text-gray-500">Chua co variant.</p>
								)}
							</div>
						)}
					</div>

					<div className="mt-6">
						<label className="block text-sm font-medium text-gray-700">
							Tags
						</label>
						<div className="flex gap-2 mt-1">
							<input
								type="text"
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								className="block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
								placeholder="Enter tag (e.g., Summer, Casual)"
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
							>
								Add
							</button>
						</div>
						<div className="mt-2 flex flex-wrap gap-2">
							{formData.tags.map((tag, index) => (
								<div
									key={index}
									className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-800 text-sm"
								>
									{tag}
									<button
										type="button"
										onClick={() => handleRemoveTag(index)}
										className="ml-2 text-red-500 hover:text-red-700"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
						>
							{formType === "add"
								? "Add Product"
								: "Save Changes"}
						</button>
					</div>
				</form>
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
								onClick={() => setAttrModalOpen(false)}
								className="text-gray-500"
							>
								✕
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
								placeholder="Gia tri"
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
							<p className="mt-4 text-sm text-gray-500">Dang tai...</p>
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
									<p className="text-sm text-gray-500">Khong co thuoc tinh.</p>
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

export default ProductFormModal;
