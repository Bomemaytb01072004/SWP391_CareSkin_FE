import { useState } from "react";
import styles from "./Dropdown.module.css";
import { ChevronDown } from "lucide-react";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

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
            <button className={styles.dropdownItem} type="button">
              <a href="/">Newest</a>
            </button>
          </li>
          <li>
            <button className={styles.dropdownItem} type="button">
            Price: Low to High
            </button>
          </li>
          <li>
            <button className={styles.dropdownItem} type="button">
            Price: High to Low
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
