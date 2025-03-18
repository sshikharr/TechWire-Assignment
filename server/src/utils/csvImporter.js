const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Import CSV data into the database
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Object>} Statistics about the import
 */
async function importCSVData(filePath) {
  const results = [];
  
  // Read CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const headers = Object.keys(results[0]);
  
  // Find column indices
  const columnIndices = {
    category: headers.findIndex(h => h.toLowerCase().includes('category')),
    subcategory: headers.findIndex(h => h.toLowerCase().includes('subcategory') || h.toLowerCase().includes('sub-category')),
    partNumber: headers.findIndex(h => h.toLowerCase().includes('part')),
    datasheet: headers.findIndex(h => h.toLowerCase().includes('datasheet'))
  };

  // Get attribute columns (excluding main columns)
  const attributeColumns = headers.filter((header, idx) => 
    !Object.values(columnIndices).includes(idx) && 
    header && header.trim() !== '' // Add this validation
  );

  try {
    // Process columns
    const columns = await Promise.all(attributeColumns.map(colName => 
      prisma.column.upsert({
        where: { name: colName },
        update: {},
        create: { name: colName }
      })
    ));
    const columnMap = new Map(columns.map(col => [col.name, col]));

    // Process categories and subcategories
    const { categories, subcategories } = await processCategoriesAndSubcategories(
      results, 
      columnIndices
    );

    // Process products and attributes
    const { products, attributes } = await processProductsAndAttributes(
      results, 
      columnIndices, 
      categories, 
      subcategories, 
      columnMap,
      headers,
      attributeColumns
    );

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    return {
      categories: categories.size,
      subcategories: subcategories.size,
      products: products.length,
      attributes: attributes.length
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Process categories and subcategories from CSV data
 * @param {Array} csvData - Parsed CSV data
 * @param {Object} columnIndices - Column index mappings
 * @returns {Object} Categories and subcategories maps
 */
async function processCategoriesAndSubcategories(csvData, columnIndices) {
  const categories = new Map();
  const subcategories = new Map();

  // First pass: collect unique categories and subcategories
  for (const row of csvData) {
    const values = Object.values(row);
    const categoryName = values[columnIndices.category];
    const subcategoryName = values[columnIndices.subcategory];
    
    if (!categoryName || !subcategoryName) continue;
    
    categories.set(categoryName, null);
    subcategories.set(`${categoryName}:${subcategoryName}`, { 
      name: subcategoryName, 
      categoryName 
    });
  }

  // Create or find categories
  const categoryNames = Array.from(categories.keys());
  const existingCategories = await prisma.category.findMany({
    where: { name: { in: categoryNames } }
  });

  const newCategories = await Promise.all(
    categoryNames
      .filter(name => !existingCategories.some(c => c.name === name))
      .map(name => prisma.category.create({ data: { name } }))
  );

  const allCategories = [...existingCategories, ...newCategories];
  allCategories.forEach(cat => categories.set(cat.name, cat));

  // Create or find subcategories
  const subcategoryData = await processSubcategories(
    Array.from(subcategories.values()), 
    categories
  );

  return { categories, subcategories: subcategoryData };
}

/**
 * Process subcategories creation
 * @param {Array} subcategoryEntries - Subcategory data
 * @param {Map} categories - Categories map
 * @returns {Map} Processed subcategories
 */
async function processSubcategories(subcategoryEntries, categories) {
  const subcategoryByCategory = new Map();
  
  for (const entry of subcategoryEntries) {
    const category = categories.get(entry.categoryName);
    if (!category) continue;
    
    if (!subcategoryByCategory.has(category.id)) {
      subcategoryByCategory.set(category.id, []);
    }
    subcategoryByCategory.get(category.id).push(entry.name);
  }

  const existingSubcategories = await Promise.all(
    Array.from(subcategoryByCategory.entries()).map(([categoryId, names]) => 
      prisma.subcategory.findMany({
        where: { categoryId, name: { in: names } }
      })
    )
  ).then(arrays => arrays.flat());

  const newSubcategories = await prisma.subcategory.createMany({
    data: subcategoryEntries
      .filter(entry => {
        const category = categories.get(entry.categoryName);
        return category && !existingSubcategories.some(
          s => s.name === entry.name && s.categoryId === category.id
        );
      })
      .map(entry => ({
        name: entry.name,
        categoryId: categories.get(entry.categoryName).id
      })),
    skipDuplicates: true
  });

  const allSubcategories = await prisma.subcategory.findMany({
    where: {
      OR: Array.from(subcategoryByCategory.entries()).map(
        ([categoryId, names]) => ({ categoryId, name: { in: names } })
      )
    }
  });

  const subcategoryMap = new Map();
  allSubcategories.forEach(sub => {
    subcategoryMap.set(`${sub.categoryId}:${sub.name}`, sub.id);
  });

  return subcategoryMap;
}

/**
 * Process products and attributes from CSV data
 * @param {Array} csvData - Parsed CSV data
 * @param {Object} columnIndices - Column index mappings
 * @param {Map} categories - Categories map
 * @param {Map} subcategories - Subcategories map
 * @param {Map} columnMap - Columns map
 * @param {Array} headers - CSV headers
 * @param {Array} attributeColumns - Attribute column names
 * @returns {Object} Processed products and attributes
 */
async function processProductsAndAttributes(
  csvData, 
  columnIndices, 
  categories, 
  subcategories, 
  columnMap,
  headers,
  attributeColumns
) {
  const productUpserts = [];
  const attributeData = [];

  // Prepare product upserts
  for (const row of csvData) {
    const values = Object.values(row);
    const categoryName = values[columnIndices.category];
    const subcategoryName = values[columnIndices.subcategory];
    const partNumber = values[columnIndices.partNumber];
    const datasheetUrl = values[columnIndices.datasheet] || null;

    if (!categoryName || !subcategoryName || !partNumber) continue;

    const category = categories.get(categoryName);
    if (!category) continue;

    const subcategoryId = subcategories.get(`${category.id}:${subcategoryName}`);
    if (!subcategoryId) continue;

    productUpserts.push({
      where: { partNumber },
      update: { datasheetUrl, subcategoryId },
      create: { partNumber, datasheetUrl, subcategoryId }
    });
  }

  // Upsert products
  const products = await Promise.all(
    productUpserts.map(upsert => prisma.product.upsert(upsert))
  );
  const productMap = new Map(products.map(p => [p.partNumber, p]));

  // Prepare attributes
  for (const row of csvData) {
    const values = Object.values(row);
    const partNumber = values[columnIndices.partNumber];
    const product = productMap.get(partNumber);
    
    if (!product) continue;

    for (let i = 0; i < attributeColumns.length; i++) {
      const columnName = attributeColumns[i];
      const columnValue = values[headers.indexOf(columnName)];
      const column = columnMap.get(columnName);

      if (columnValue !== undefined && columnValue !== '' && columnValue !== null) {
        attributeData.push({
          productId: product.id,
          columnId: column.id,
          value: columnValue,
          isAssociated: true
        });
      } else if (columnValue === '-') {
        attributeData.push({
          productId: product.id,
          columnId: column.id,
          value: '-',
          isAssociated: true
        });
      }
    }
  }

  // Upsert attributes
  if (attributeData.length > 0) {
    const attributeUpserts = attributeData.map(attr => 
      prisma.attribute.upsert({
        where: {
          productId_columnId: {
            productId: attr.productId,
            columnId: attr.columnId
          }
        },
        update: { value: attr.value },
        create: {
          productId: attr.productId,
          columnId: attr.columnId,
          value: attr.value
        }
      })
    );
    await Promise.all(attributeUpserts);
  }

  return { products, attributes: attributeData };
}

module.exports = { importCSVData };