import { X } from "lucide-react";
import React from "react";

const CategoryViewModal = ({ category, onClose, onEdit }) => {
	if (!category) return null;

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center p-4 border-b">
					<h3 className="text-lg font-semibold">Chi tiết danh mục</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="p-6">
					<div className="flex items-center mb-6">
						{category.imageUrl ? (
							<img
								src={category.imageUrl}
								alt={`${category.name || "Danh mục"} image`}
								className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
							/>
						) : (
							<div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
								Không có ảnh
							</div>
						)}
						<div className="ml-4">
							<h2 className="text-xl font-semibold">
								{category.name}
							</h2>
						</div>
					</div>

					{category.description && (
						<div className="mb-6">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Mô tả
							</h4>
							<p className="text-gray-600">
								{category.description}
							</p>
						</div>
					)}

					<div className="flex justify-end space-x-3 mt-6">
						<button
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
						>
							Đóng
						</button>
						<button
							onClick={() => onEdit(category)}
							className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
						>
							Sửa danh mục
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CategoryViewModal;
