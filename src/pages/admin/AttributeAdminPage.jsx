import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import LayoutAdmin from "./LayoutAdmin";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import productApi from "@/utils/api/productApi";
import attributeApi from "@/utils/api/attributeApi";
import { buildVariantLabel } from "@/utils/api/mappers";

const ATTRIBUTE_TYPES = [
	{ label: "Color", value: "COLOR" },
	{ label: "Size", value: "SIZE" },
	{ label: "Material", value: "MATERIAL" },
	{ label: "Storage", value: "STORAGE" },
	{ label: "RAM", value: "RAM" },
	{ label: "Weight", value: "WEIGHT" },
];

const AttributeAdminPage = () => {
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const initialProductId = query.get("productId") || "";
	const initialVariantId = query.get("variantId") || "";

	const [products, setProducts] = useState([]);
	const [variants, setVariants] = useState([]);
	const [attributes, setAttributes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProductId, setSelectedProductId] = useState(initialProductId);
	const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);
	const [modalOpen, setModalOpen] = useState(false);
	const [formType, setFormType] = useState("add");
	const [formData, setFormData] = useState({
		id: "",
		variantId: "",
		type: "COLOR",
		value: "",
	});

	const buildVariants = (items) =>
		items.flatMap((product) =>
			(product.variants || []).map((variant) => ({
				...variant,
				productId: product.id,
				productName: product.name || variant.productName || "",
			}))
		);

	const refreshProducts = async () => {
		try {
			const res = await productApi.getProducts({ page: 0, size: 100, status: true });
			const items = res?.data?.data?.content || [];
			setProducts(items);
			setVariants(buildVariants(items));
		} catch (error) {
			console.error("Load products error:", error);
		}
	};

	useEffect(() => {
		refreshProducts();
	}, []);

	useEffect(() => {
		if (!selectedVariantId) {
			setAttributes([]);
			return;
		}
		setLoading(true);
		attributeApi
			.getByVariant(selectedVariantId)
			.then((res) => {
				setAttributes(res?.data?.data || []);
			})
			.catch((error) => {
				console.error("Load attributes error:", error);
			})
			.finally(() => setLoading(false));
	}, [selectedVariantId]);

	useEffect(() => {
		if (!selectedProductId || !selectedVariantId) return;
		const variant = variants.find((item) => item.id === selectedVariantId);
		if (variant && variant.productId !== selectedProductId) {
			setSelectedVariantId("");
		}
	}, [selectedProductId, selectedVariantId, variants]);

	const filteredVariants = useMemo(() => {
		return variants.filter((variant) => {
			if (!selectedProductId) return true;
			return variant.productId === selectedProductId;
		});
	}, [variants, selectedProductId]);

	const filteredAttributes = useMemo(() => {
		const queryText = searchQuery.trim().toLowerCase();
		if (!queryText) return attributes;
		return attributes.filter((attr) => {
			return (
				String(attr.type || "").toLowerCase().includes(queryText) ||
				String(attr.value || "").toLowerCase().includes(queryText)
			);
		});
	}, [attributes, searchQuery]);

	const openAddModal = () => {
		if (!selectedVariantId) {
			alert("Chon variant truoc.");
			return;
		}
		setFormType("add");
		setFormData({
			id: "",
			variantId: selectedVariantId,
			type: "COLOR",
			value: "",
		});
		setModalOpen(true);
	};

	const openEditModal = (attr) => {
		setFormType("edit");
		setFormData({
			id: attr.id,
			variantId: selectedVariantId,
			type: attr.type,
			value: attr.value,
		});
		setModalOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.variantId) {
			alert("Chon variant.");
			return;
		}
		if (!formData.value.trim()) {
			alert("Nhap gia tri.");
			return;
		}
		try {
			if (formType === "add") {
				await attributeApi.create(formData.variantId, {
					type: formData.type,
					value: formData.value.trim(),
				});
			} else {
				await attributeApi.update(formData.id, {
					type: formData.type,
					value: formData.value.trim(),
				});
			}
			setModalOpen(false);
			if (selectedVariantId) {
				const res = await attributeApi.getByVariant(selectedVariantId);
				setAttributes(res?.data?.data || []);
			}
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể lưu thuộc tính.";
			alert(message);
		}
	};

	const handleDelete = async (attr) => {
		if (!window.confirm("Xoa thuoc tinh nay?")) return;
		try {
			await attributeApi.remove(attr.id);
			if (selectedVariantId) {
				const res = await attributeApi.getByVariant(selectedVariantId);
				setAttributes(res?.data?.data || []);
			}
		} catch (error) {
			const message =
				error?.response?.data?.data?.message ||
				error?.response?.data?.message ||
				"Không thể xóa thuộc tính.";
			alert(message);
		}
	};

	const selectedVariant = variants.find((item) => item.id === selectedVariantId);

	return (
		<LayoutAdmin>
			<div className="flex-1 overflow-auto relative z-10">
				<HeaderAdmin title={"Attributes"} />
				<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
					<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-1 flex-col gap-3 sm:flex-row">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search by type or value..."
									className="w-full rounded-lg border border-gray-200 px-3 py-2"
								/>
								<select
									value={selectedProductId}
									onChange={(e) => setSelectedProductId(e.target.value)}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 sm:w-64"
								>
									<option value="">All products</option>
									{products.map((product) => (
										<option key={product.id} value={product.id}>
											{product.name || product.id}
										</option>
									))}
								</select>
								<select
									value={selectedVariantId}
									onChange={(e) => setSelectedVariantId(e.target.value)}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 sm:w-72"
								>
									<option value="">Select variant</option>
									{filteredVariants.map((variant) => (
										<option key={variant.id} value={variant.id}>
											{buildVariantLabel(variant)}
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
									Add Attribute
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
											Variant
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Type
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Value
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{!selectedVariantId && (
										<tr>
											<td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
												Chon variant de hien thi thuoc tinh.
											</td>
										</tr>
									)}
									{selectedVariantId && loading && (
										<tr>
											<td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
												Äang táº£i...
											</td>
										</tr>
									)}
									{selectedVariantId &&
										!loading &&
										filteredAttributes.map((attr) => (
											<tr key={attr.id} className="hover:bg-gray-50">
												<td className="px-4 py-4 text-sm text-gray-500">
													{selectedVariant
														? buildVariantLabel(selectedVariant)
														: selectedVariantId}
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{attr.type}
												</td>
												<td className="px-4 py-4 text-sm text-gray-500">
													{attr.value}
												</td>
												<td className="px-4 py-4 text-sm font-medium">
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => openEditModal(attr)}
															className="text-orange-500 hover:text-orange-700"
															title="Edit"
														>
															<Edit className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() => handleDelete(attr)}
															className="text-red-500 hover:text-red-700"
															title="Delete"
														>
															<Trash className="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										))}
									{selectedVariantId && !loading && filteredAttributes.length === 0 && (
										<tr>
											<td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
												KhÃ´ng cÃ³ thuá»™c tÃ­nh.
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
								{formType === "add" ? "Add Attribute" : "Edit Attribute"}
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
								value={formData.variantId}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										variantId: e.target.value,
									}))
								}
								disabled={formType === "edit"}
							>
								<option value="">Select variant</option>
								{filteredVariants.map((variant) => (
									<option key={variant.id} value={variant.id}>
										{buildVariantLabel(variant)}
									</option>
								))}
							</select>
							<select
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								value={formData.type}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, type: e.target.value }))
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
								className="w-full rounded-md border border-gray-200 px-3 py-2"
								placeholder="Value"
								value={formData.value}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, value: e.target.value }))
								}
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setModalOpen(false)}
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
		</LayoutAdmin>
	);
};

export default AttributeAdminPage;

