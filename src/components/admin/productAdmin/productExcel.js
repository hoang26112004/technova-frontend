import * as XLSX from 'xlsx';

export const exportProductsToExcel = (products, filename = 'Products_Export') => {
  // Prepare data for export
  const exportData = products.map(product => ({
    'Product ID': product.id,
    'Name': product.name,
    'Category': product.category,
    'Price': product.price,
    'Description': product.description
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // Product ID
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 10 }, // Price
    { wch: 50 }  // Description
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Save as Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};


export const getProductStatusCounts = (products) => {
  const counts = {
    'Active': 0,
    'Inactive': 0,
    'Low Stock': 0,
    'Out of Stock': 0,
  };
  
  products.forEach(product => {
    const stock = Number(product?.stock || 0);
    if (product?.isActive) counts['Active']++;
    else counts['Inactive']++;

    if (stock === 0) counts['Out of Stock']++;
    else if (stock > 0 && stock <= 5) counts['Low Stock']++;
  });
  
  return counts;
};


export const formatProductForSave = (formData, existingProduct = null) => {
  const fromForm = Array.isArray(formData?.images) ? formData.images : [];
  const fallback =
    (existingProduct && (existingProduct.image || existingProduct.images)) || [];
  const productImages = fromForm.length ? fromForm : fallback;

  return {
    id: formData.id,
    name: formData.name,
    categoryId: formData.categoryId,
    price: `$${parseFloat(formData.price).toFixed(2)}`,
    image: productImages,
    description: formData.description,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    rating: existingProduct ? existingProduct.rating : 0,
  };
};
