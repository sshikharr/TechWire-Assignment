const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Get subcategories for a specific category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSubcategories = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId }
    });
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
};