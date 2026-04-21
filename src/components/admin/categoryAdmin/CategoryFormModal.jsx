import React, { useState } from "react";
import CategoryForm from "./CategoryForm";
import { X } from "lucide-react";

const CategoryFormModal = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	formType,
}) => {
	const [formData, setFormData] = useState(initialData);

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "image") {
			setFormData((prev) => ({
				...prev,
				image: files && files.length > 0 ? files[0] : null,
			}));
			return;
		}
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleClearImage = () => {
		setFormData((prev) => ({ ...prev, image: null }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center p-4 border-b">
					<h3 className="text-lg font-semibold">
						{formType === "add" ? "Thêm danh mục" : "Sửa danh mục"}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="p-4">
					<CategoryForm
						formData={formData}
						onChange={handleChange}
						onClearImage={handleClearImage}
						onSubmit={handleSubmit}
						formType={formType}
						onClose={onClose}
					/>
				</div>
			</div>
		</div>
	);
};

export default CategoryFormModal;
