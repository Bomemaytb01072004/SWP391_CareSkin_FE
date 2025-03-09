import React, { useState } from 'react';
import styles from './Dropdown.module.css';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (option) => {
    // Đóng menu
    setIsOpen(false);
    // Gọi callback lên cha
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
        Sort by: Featured <ChevronDown size={16} />
      </button>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('newest')}
            >
              Newest
            </button>
          </li>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('priceLowToHigh')}
            >
              Price: Low to High
            </button>
          </li>
          <li>
            <button
              className={styles.dropdownItem}
              type="button"
              onClick={() => handleMenuClick('priceHighToLow')}
            >
              Price: High to Low
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
