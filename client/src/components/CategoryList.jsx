import PropTypes from 'prop-types';

/**
 * Category list component
 * @param {Object} props - Component props
 * @param {Array} props.categories - List of categories
 * @param {Object} props.selectedCategory - Currently selected category
 * @param {Function} props.onCategorySelect - Category selection handler
 * @returns {JSX.Element} Category list UI
 */
function CategoryList({ categories, selectedCategory, onCategorySelect }) {
  return (
    <>
      <h2>Categories</h2>
      <ul className="category-list">
        {categories.map(category => (
          <li
            key={category.id}
            className={selectedCategory?.id === category.id ? 'selected' : ''}
            onClick={() => onCategorySelect(category)}
          >
            {category.name}
          </li>
        ))}
      </ul>
    </>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedCategory: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onCategorySelect: PropTypes.func.isRequired,
};

export default CategoryList;