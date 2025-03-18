import PropTypes from 'prop-types';

/**
 * Subcategory list component
 * @param {Object} props - Component props
 * @param {Array} props.subcategories - List of subcategories
 * @param {Object} props.selectedSubcategory - Currently selected subcategory
 * @param {Function} props.onSubcategorySelect - Subcategory selection handler
 * @returns {JSX.Element} Subcategory list UI
 */
function SubcategoryList({ subcategories, selectedSubcategory, onSubcategorySelect }) {
  return (
    <>
      <h3>Subcategories</h3>
      <ul className="subcategory-list">
        {subcategories.map(subcategory => (
          <li
            key={subcategory.id}
            className={selectedSubcategory?.id === subcategory.id ? 'selected' : ''}
            onClick={() => onSubcategorySelect(subcategory)}
          >
            {subcategory.name}
          </li>
        ))}
      </ul>
    </>
  );
}

SubcategoryList.propTypes = {
  subcategories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedSubcategory: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onSubcategorySelect: PropTypes.func.isRequired,
};

export default SubcategoryList;