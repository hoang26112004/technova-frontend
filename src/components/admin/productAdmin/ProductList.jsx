import React from "react";
import ProductListItem from "./ProductListItem";
import ProductPagination from "./ProductPagination";

const ProductList = ({
	products,
	currentPage,
	productsPerPage,
	totalProducts,
	onPageChange,
	onProductsPerPageChange,
	onViewProduct,
	onEditProduct,
	onDeleteProduct,
	onSort,
	sortConfig,
}) => {
	const indexOfLastProduct = currentPage * productsPerPage;
	const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
	const currentProducts = products.slice(
		indexOfFirstProduct,
		indexOfLastProduct
	);
	const totalPages = Math.ceil(products.length / productsPerPage);

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Sản phẩm
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Danh mục
							</th>
							<th
								onClick={() => onSort("price")}
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
							>
								Giá{" "}
								{sortConfig.key === "price" &&
									(sortConfig.direction === "asc" ? "↑" : "↓")}
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{currentProducts.map((product) => (
							<ProductListItem
								key={product.id}
								product={product}
								onView={onViewProduct}
								onEdit={onEditProduct}
								onDelete={onDeleteProduct}
							/>
						))}
					</tbody>
				</table>
			</div>

			<ProductPagination
				currentPage={currentPage}
				totalPages={totalPages}
				itemsPerPage={productsPerPage}
				totalItems={totalProducts}
				onPageChange={onPageChange}
				onItemsPerPageChange={onProductsPerPageChange}
				indexOfFirstItem={indexOfFirstProduct}
				indexOfLastItem={indexOfLastProduct}
				itemName="sản phẩm"
			/>
		</div>
	);
};

export default ProductList;
