import React, { useState } from 'react';
import styles from './Dropdown.module.css';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ onSortChange, sortOption }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (option) => {
    // Close menu
    setIsOpen(false);
    // Call callback to parent
    if (onSortChange) {
      onSortChange(option);
    }
  };

  return (
    <div className={styles.dropdownContainer}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        Sort by: {sortOption || 'Select'} <ChevronDown size={16} />
      </button>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('Newest')}
            >
              Newest
            </button>
          </li>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('Price: Low to High')}
            >
              Price: Low to High
            </button>
          </li>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('Price: High to Low')}
            >
              Price: High to Low
            </button>
          </li>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('Popular')}
            >
              Popular
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
