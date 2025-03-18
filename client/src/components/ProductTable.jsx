import PropTypes from 'prop-types';

/**
 * Product table component
 * @param {Object} props - Component props
 * @param {string} props.categoryName - Selected category name
 * @param {string} props.subcategoryName - Selected subcategory name
 * @param {Array} props.products - List of products
 * @returns {JSX.Element} Product table UI
 */
function ProductTable({ categoryName, subcategoryName, products }) {
  const isColumnAssociated = (product, columnName) => {
    const attribute = product.attributes.find(attr => attr.column.name === columnName);
    return attribute !== undefined;
  };

  const getUniqueColumns = () => {
    const columns = new Set();
    products.forEach(product => {
      product.attributes.forEach(attr => columns.add(attr.column.name));
    });
    return Array.from(columns);
  };

  return (
    <>
      <h2>{categoryName} &gt; {subcategoryName}</h2>
      {products.length > 0 ? (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Datasheet</th>
                {getUniqueColumns().map(column => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.partNumber}</td>
                  <td>
                    {product.datasheetUrl ? (
                      <a href={product.datasheetUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  {getUniqueColumns().map(column => (
                    <td key={`${product.id}-${column}`}>
                      {isColumnAssociated(product, column) ? (
                        <span className="associated">✓</span>
                      ) : (
                        <span className="not-associated">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No products found for this subcategory.</p>
      )}
    </>
  );
}

ProductTable.propTypes = {
  categoryName: PropTypes.string.isRequired,
  subcategoryName: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      partNumber: PropTypes.string.isRequired,
      datasheetUrl: PropTypes.string,
      attributes: PropTypes.arrayOf(
        PropTypes.shape({
          column: PropTypes.shape({
            name: PropTypes.string.isRequired,
          }).isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default ProductTable;