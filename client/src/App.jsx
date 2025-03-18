import React from 'react';
import './App.css';
import Header from './components/Header';
import CsvImporter from './components/CsvImporter';
import CategoryList from './components/CategoryList';
import SubcategoryList from './components/SubcategoryList';
import ProductTable from './components/ProductTable';
import useCatalogData from './hooks/useCatalogData';

function App() {
  const {
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
    isLoadingProducts, // Destructure the new loading state
  } = useCatalogData();

  return (
    <div className="app">
      <Header />
      <CsvImporter 
        importStatus={importStatus}
        onFileChange={handleFileChange}
        onImport={handleImport}
      />
      <div className="main-content">
        <div className="sidebar">
          {isLoadingCategories ? (
            <div className="loading">
              <p>Loading categories...</p>
            </div>
          ) : (
            <>
              <CategoryList 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
              {selectedCategory && (
                <SubcategoryList
                  subcategories={subcategories}
                  selectedSubcategory={selectedSubcategory}
                  onSubcategorySelect={setSelectedSubcategory}
                />
              )}
            </>
          )}
        </div>
        <div className="product-display">
          {selectedSubcategory ? (
            isLoadingProducts ? (
              <div className="loading">
                <p>Loading products...</p>
              </div>
            ) : (
              <ProductTable
                categoryName={selectedCategory.name}
                subcategoryName={selectedSubcategory.name}
                products={products}
              />
            )
          ) : (
            <div className="no-selection">
              <p>Select a category and subcategory to view products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;