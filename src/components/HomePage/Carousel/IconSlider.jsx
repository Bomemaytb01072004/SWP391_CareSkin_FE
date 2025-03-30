import React, { useEffect, useState } from 'react';
import styles from './IconSlider.module.css';

function IconSlider() {
  const [brands, setBrands] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/api/Brand`)
      .then((response) => response.json())
      .then((data) => {
        setBrands(data);
      })
      .catch((error) => console.error('Error fetching brand logos:', error));
  }, []);

  // Duplicate the brand list for smooth infinite scrolling
  const logos = [...brands, ...brands];

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderTrack}>
        {logos.map((brand, index) => (
          <div key={index} className={styles.slide}>
            <img
              src={brand.PictureUrl}
              alt={brand.Name}
              className={styles.logo}
              onError={(e) =>
                (e.target.src = '/src/assets/brands/placeholder.png')
              } // Fallback image
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconSlider;
