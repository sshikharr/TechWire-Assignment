const express = require('express');
const multer = require('multer');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Category routes
router.get('/categories', categoryController.getCategories);
router.get('/categories/:categoryId/subcategories', categoryController.getSubcategories);

// Product routes
router.post('/import', upload.single('csv'), productController.importCSV);
router.get('/subcategories/:subcategoryId/products', productController.getProductsBySubcategory);
router.get('/products/:partNumber', productController.getProductByPartNumber);

module.exports = router;