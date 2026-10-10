import React from 'react';
import '../styles/Filters.css';

function Filters({ onFilterChange, onExportCSV }) {
  const [filters, setFilters] = React.useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="filters-container">
      <h3>Filters</h3>
      <div className="filters-grid">
        <div className="filter-group">
          <label>Type:</label>
          <select name="type" value={filters.type} onChange={handleChange}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="filter-actions">
          <button onClick={handleReset} className="btn-reset">Reset</button>
          <button onClick={() => onExportCSV(filters)} className="btn-export">Export CSV</button>
        </div>
      </div>
    </div>
  );
}

export default Filters;
