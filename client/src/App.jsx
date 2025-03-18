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
        </div>
        <div className="product-display">
          {selectedSubcategory ? (
            <ProductTable
              categoryName={selectedCategory.name}
              subcategoryName={selectedSubcategory.name}
              products={products}
            />
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