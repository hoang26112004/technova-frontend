import React, { useEffect, useRef, useState } from "react";

const CategoryForm = ({
	formData,
	onChange,
	onSubmit,
	formType,
	onClose,
	onClearImage,
}) => {
	const fileInputRef = useRef(null);
	const [previewUrl, setPreviewUrl] = useState("");

	useEffect(() => {
		if (!formData.image) {
			setPreviewUrl("");
			return;
		}
		const url = URL.createObjectURL(formData.image);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [formData.image]);

	const handlePickImage = () => {
		if (fileInputRef.current) fileInputRef.current.click();
	};

	const handleDrop = (event) => {
		event.preventDefault();
		const file = event.dataTransfer.files?.[0];
		if (file) {
			onChange({ target: { name: "image", files: [file] } });
		}
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const activeImageUrl = previewUrl || formData.imageUrl;

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Tên danh mục
				</label>
				<input
					type="text"
					name="name"
					value={formData.name}
					onChange={onChange}
					className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Mô tả
				</label>
				<textarea
					name="description"
					value={formData.description}
					onChange={onChange}
					rows="3"
					className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
				></textarea>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Hình ảnh
				</label>
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					role="button"
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							handlePickImage();
						}
					}}
					onClick={handlePickImage}
					className="mt-1 flex items-center gap-4 rounded-lg border-2 border-dashed border-orange-200 bg-orange-50/40 p-4 transition hover:border-orange-400"
				>
					<div className="flex h-16 w-16 items-center justify-center rounded-lg border border-orange-200 bg-white">
						{activeImageUrl ? (
							<img
								src={activeImageUrl}
								alt={`${formData.name || "Danh mục"} image`}
								className="h-14 w-14 rounded-md object-cover"
							/>
						) : (
							<span className="text-xs text-gray-400">
								Không có ảnh
							</span>
						)}
					</div>
					<div className="flex-1">
						<div className="text-sm font-medium text-gray-700">
							Kéo thả ảnh vào đây hoặc bấm để tải lên
						</div>
						<div className="text-xs text-gray-500">
							PNG, JPG tối đa 5MB
						</div>
						{formData.image?.name && (
							<div className="mt-1 text-xs text-gray-600">
								Đã chọn: {formData.image.name}
							</div>
						)}
					</div>
					{formData.image && (
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								onClearImage();
							}}
							className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
						>
							Gỡ
						</button>
					)}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					name="image"
					accept="image/*"
					onChange={onChange}
					className="hidden"
				/>
			</div>

			<div className="flex justify-end space-x-3 pt-4">
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
				>
					Hủy
				</button>
				<button
					type="submit"
					className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
				>
					{formType === "add" ? "Thêm danh mục" : "Lưu thay đổi"}
				</button>
			</div>
		</form>
	);
};

export default CategoryForm;
