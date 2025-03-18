const { PrismaClient } = require('@prisma/client');
const { importCSVData } = require('../utils/csvImporter');

const prisma = new PrismaClient();

/**
 * Import products from CSV file
 * @param {Object} req - Express request object with file
 * @param {Object} res - Express response object
 */
exports.importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    const result = await importCSVData(req.file.path);
    res.status(200).json({ 
      message: 'CSV imported successfully',
      stats: result 
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'CSV import failed' });
  }
};

/**
 * Get products by subcategory
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProductsBySubcategory = async (req, res) => {
  try {
    const subcategoryId = parseInt(req.params.subcategoryId);
    const products = await prisma.product.findMany({
      where: { subcategoryId },
      include: {
        attributes: {
          include: { column: true }
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Get product by part number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProductByPartNumber = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { partNumber: req.params.partNumber },
      include: {
        attributes: { include: { column: true } },
        subcategory: { include: { category: true } }
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};