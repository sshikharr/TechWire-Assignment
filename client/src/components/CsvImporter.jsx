import PropTypes from 'prop-types';

/**
 * CSV Importer component
 * @param {Object} props - Component props
 * @param {string} props.importStatus - Current import status message
 * @param {Function} props.onFileChange - File selection handler
 * @param {Function} props.onImport - Import button handler
 * @returns {JSX.Element} CSV importer UI
 */
function CsvImporter({ importStatus, onFileChange, onImport }) {
  return (
    <div className="import-section">
      <h2>Import CSV</h2>
      <input 
        type="file" 
        accept=".csv" 
        onChange={onFileChange} 
      />
      <button onClick={onImport}>Import</button>
      {importStatus && <p className={importStatus.includes('failed') ? 'error' : ''}>{importStatus}</p>}
    </div>
  );
}

CsvImporter.propTypes = {
  importStatus: PropTypes.string.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default CsvImporter;