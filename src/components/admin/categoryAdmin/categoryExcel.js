import * as XLSX from "xlsx";

export const exportCategoriesToExcel = (
	categories,
	filename = "Categories_Export"
) => {
	const exportData = categories.map((category) => ({
		ID: category.id,
		Name: category.name,
		Description: category.description || "",
		"Image URL": category.imageUrl || "",
	}));

	const worksheet = XLSX.utils.json_to_sheet(exportData);

	const columnWidths = [
		{ wch: 8 }, // ID
		{ wch: 25 }, // Name
		{ wch: 40 }, // Description
		{ wch: 50 }, // Image URL
	];
	worksheet["!cols"] = columnWidths;

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

	XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const sortCategories = (categories, sortConfig) => {
	if (!sortConfig.key) return categories;

	return [...categories].sort((a, b) => {
		const aValue = a[sortConfig.key] ?? "";
		const bValue = b[sortConfig.key] ?? "";

		if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
		if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
		return 0;
	});
};
