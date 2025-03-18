import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

/**
 * Custom hook to manage catalog data and operations
 * @returns {Object} Catalog data and handlers
 */
function useCatalogData() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false); 

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchProducts(selectedSubcategory.id);
    }
  }, [selectedSubcategory]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}/subcategories`);
      setSubcategories(response.data);
      setSelectedSubcategory(null);
      setProducts([]);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async (subcategoryId) => {
    try {
      setIsLoadingProducts(true); // Start loading
      const response = await axios.get(`${API_URL}/subcategories/${subcategoryId}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false); // End loading
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setImportStatus('');
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportStatus('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      setImportStatus('Importing...');
      await axios.post(`${API_URL}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportStatus('Import successful');
      fetchCategories();
      setCsvFile(null);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportStatus('Import failed');
    }
  };

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    subcategories,
    selectedSubcategory,
    setSelectedSubcategory,
    products,
    importStatus,
    handleFileChange,
    handleImport,
    isLoadingCategories,
    isLoadingProducts, 
  };
}

export default useCatalogData;