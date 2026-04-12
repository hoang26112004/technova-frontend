import { Edit, Eye, Trash } from "lucide-react";
import React from "react";

const CategoryListItem = ({ category, onView, onEdit, onDelete }) => {
	return (
		<tr className="hover:bg-gray-50">
			<td className="px-4 py-4 whitespace-nowrap">
				<div className="font-medium text-gray-900">{category.name}</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm text-gray-500">
					{category.description || "-"}
				</div>
			</td>
			<td className="px-4 py-4 whitespace-nowrap">
				{category.imageUrl ? (
					<img
						src={category.imageUrl}
						alt={`${category.name || "Category"} image`}
						className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
					/>
				) : (
					<div className="text-sm text-gray-500">No image</div>
				)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
				<div className="flex space-x-2">
					<button
						onClick={() => onView(category)}
						className="cursor-pointer text-blue-600 hover:text-blue-900"
						title="View Details"
					>
						<Eye className="h-4 w-4" />
					</button>
					<button
						onClick={() => onEdit(category)}
						className="cursor-pointer text-orange-500 hover:text-orange-700"
						title="Edit Category"
					>
						<Edit className="h-4 w-4" />
					</button>
					<button
						onClick={() => onDelete(category)}
						className="cursor-pointer text-red-500 hover:text-red-700"
						title="Delete Category"
					>
						<Trash className="h-4 w-4" />
					</button>
				</div>
			</td>
		</tr>
	);
};

export default CategoryListItem;
