import React, { useState } from "react";
import './Filters.css'

const Filters = ({ onFilterChange }) => {
  // State để lưu các lựa chọn
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    priceRange: [],
    skinType: [],
  });

  // Danh sách bộ lọc
  const categories = [
    { label: "Cleansers (45)", value: "cleansers" },
    { label: "Moisturizers (32)", value: "moisturizers" },
    { label: "Serums (28)", value: "serums" },
    { label: "Face Masks (19)", value: "face_masks" },
  ];

  const priceRanges = [
    { label: "Under $25", value: "under_25" },
    { label: "$25 - $50", value: "25_50" },
    { label: "$50 - $100", value: "50_100" },
    { label: "Over $100", value: "over_100" },
  ];

  const skinTypes = [
    { label: "Normal", value: "normal" },
    { label: "Dry", value: "dry" },
    { label: "Oily", value: "oily" },
    { label: "Combination", value: "combination" },
  ];

  // Hàm xử lý thay đổi bộ lọc
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
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  };

  return (
    <div className="filters-container">
      <h3>Filters</h3>

      {/* Category Filter */}
      <div className="filter-section">
        <h4>Category</h4>
        {categories.map((item) => (
          <label key={item.value} className="filter-label">
            <input
              type="checkbox"
              value={item.value}
              checked={selectedFilters.category.includes(item.value)}
              onChange={() => handleFilterChange("category", item.value)}
            />
            {item.label}
          </label>
        ))}
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        {priceRanges.map((item) => (
          <label key={item.value} className="filter-label">
            <input
              type="checkbox"
              value={item.value}
              checked={selectedFilters.priceRange.includes(item.value)}
              onChange={() => handleFilterChange("priceRange", item.value)}
            />
            {item.label}
          </label>
        ))}
      </div>

      {/* Skin Type Filter */}
      <div className="filter-section">
        <h4>Skin Type</h4>
        {skinTypes.map((item) => (
          <label key={item.value} className="filter-label">
            <input
              type="checkbox"
              value={item.value}
              checked={selectedFilters.skinType.includes(item.value)}
              onChange={() => handleFilterChange("skinType", item.value)}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Filters;
