import React, { useState, useEffect } from 'react';
import './Filters.css';
import SearchProduct from '../SearchProduct/SearchProduct';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchCategories } from '../../utils/api';

const Filters = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    priceRange: [],
    skinType: [],
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();

        const splittedCategories = data.flatMap((item) =>
          item.split(',').map((str) => str.trim())
        );
        const uniqueCategories = Array.from(new Set(splittedCategories));

        const mappedCategories = uniqueCategories.map((cat) => {
          const capitalizedLabel =
            cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          return {
            label: capitalizedLabel,
            value: capitalizedLabel.replace(/\s+/g, '_'),
          };
        });

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    })();
  }, []);

  const priceRanges = [
    { label: 'Under $25', value: 'under_25' },
    { label: '$25 - $50', value: '25_50' },
    { label: '$50 - $100', value: '50_100' },
    { label: 'Over $100', value: 'over_100' },
  ];

  const skinTypes = [
    { label: 'Normal', value: 'normal' },
    { label: 'Dry', value: 'dry' },
    { label: 'Oily', value: 'oily' },
    { label: 'Combination', value: 'combination' },
  ];

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => {
      const updatedFilters = { ...prev };
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[filterType].push(value);
      }
      console.log('Updated Filters:', updatedFilters);
      if (onFilterChange && typeof onFilterChange === 'function') {
        onFilterChange(updatedFilters);
      }
      return updatedFilters;
    });
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            {!isOpen && <SearchProduct />}

            <button
              className="bg-blue-500 text-white px-4 py-3 rounded fixed right-4 top-4 shadow-lg focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FontAwesomeIcon icon={isOpen ? faXmark : faFilter} size="1x" />
            </button>
          </div>
          <div
            className={`
              transition-all duration-300 overflow-hidden 
              ${isOpen ? 'max-h-[auto] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="p-4">
              <div className="filter-section">
                <h4 className="font-semibold">Category</h4>
                {categories.map((item) => (
                  <label key={item.value} className="block my-1">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={selectedFilters.category.includes(item.value)}
                      onChange={() =>
                        handleFilterChange('category', item.value)
                      }
                      className="mr-2"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="filter-section mt-4">
                <h4 className="font-semibold">Price Range</h4>
                {priceRanges.map((item) => (
                  <label key={item.value} className="block my-1">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={selectedFilters.priceRange.includes(item.value)}
                      onChange={() =>
                        handleFilterChange('priceRange', item.value)
                      }
                      className="mr-2"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="filter-section mt-4">
                <h4 className="font-semibold">Skin Type</h4>
                {skinTypes.map((item) => (
                  <label key={item.value} className="block my-1">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={selectedFilters.skinType.includes(item.value)}
                      onChange={() =>
                        handleFilterChange('skinType', item.value)
                      }
                      className="mr-2"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Desktop --- */}
      <div className="hidden md:block">
        <div className="filters-container p-4">
          <h3>Filters</h3>
          <SearchProduct />
          <div className="filter-section mt-4">
            <h4 className="font-semibold">Category</h4>
            {categories.map((item) => (
              <label key={item.value} className="block my-1">
                <input
                  type="checkbox"
                  value={item.value}
                  checked={selectedFilters.category.includes(item.value)}
                  onChange={() => handleFilterChange('category', item.value)}
                  className="mr-2"
                />
                {item.label}
              </label>
            ))}
          </div>
          <div className="filter-section mt-4">
            <h4 className="font-semibold">Price Range</h4>
            {priceRanges.map((item) => (
              <label key={item.value} className="block my-1">
                <input
                  type="checkbox"
                  value={item.value}
                  checked={selectedFilters.priceRange.includes(item.value)}
                  onChange={() => handleFilterChange('priceRange', item.value)}
                  className="mr-2"
                />
                {item.label}
              </label>
            ))}
          </div>
          <div className="filter-section mt-4">
            <h4 className="font-semibold">Skin Type</h4>
            {skinTypes.map((item) => (
              <label key={item.value} className="block my-1">
                <input
                  type="checkbox"
                  value={item.value}
                  checked={selectedFilters.skinType.includes(item.value)}
                  onChange={() => handleFilterChange('skinType', item.value)}
                  className="mr-2"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Filters;
