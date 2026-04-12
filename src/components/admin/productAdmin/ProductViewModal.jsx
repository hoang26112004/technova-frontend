import React from "react";
import { X } from "lucide-react";

const ProductViewModal = ({ product, onClose, onEdit }) => {
	if (!product) return null;

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center p-4 overflow-auto z-10">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg text-gray font-semibold">
							Product Details
						</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="flex flex-col md:flex-row gap-6 mb-6">
						<div className="w-full md:w-1/3">
							<div className="grid grid-cols-2 gap-2">
								{product.image.map((img, index) => (
									<div
										key={index}
										className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
									>
										<img
											src={img}
											alt={`${product.name} - ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						</div>
						<div className="w-full md:w-2/3">
							<h2 className="text-xl font-semibold mb-2">{product.name}</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<div className="text-sm text-gray-500">Product ID</div>
									<div className="font-medium">{product.id}</div>
								</div>
								<div>
									<div className="text-sm text-gray-500">Category</div>
									<div className="font-medium">{product.category}</div>
								</div>
								<div>
									<div className="text-sm text-gray-500">Price</div>
									<div className="font-medium text-lg">{product.price}</div>
								</div>
							</div>
							<div className="mb-4">
								<div className="text-sm text-gray-500 mb-1">Description</div>
								<p className="text-gray-700">{product.description}</p>
							</div>
						</div>
					</div>
					<div className="flex justify-end space-x-3">
						<button
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
						>
							Close
						</button>
						<button
							onClick={() => onEdit(product)}
							className="px-4 py-2 border border-gray-300 bg-orange-500 rounded-lg text-white "
						>
							Edit Product
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductViewModal;
