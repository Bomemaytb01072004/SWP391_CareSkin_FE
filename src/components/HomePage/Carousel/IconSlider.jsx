import React from 'react';
import styles from './IconSlider.module.css';

function IconSlider() {
  const brandLogos = [
    { src: '/src/assets/brands/loreal.png', alt: "L'Oréal" },
    { src: '/src/assets/brands/estee-lauder.png', alt: 'Estée Lauder' },
    { src: '/src/assets/brands/clinique.png', alt: 'Clinique' },
    { src: '/src/assets/brands/the-ordinary.png', alt: 'The Ordinary' },
    { src: '/src/assets/brands/fenty-beauty.png', alt: 'Fenty Beauty' },
    { src: '/src/assets/brands/kiehls.png', alt: 'Kiehl’s' },
    { src: '/src/assets/brands/laneige.png', alt: 'Laneige' },
    { src: '/src/assets/brands/cerave.png', alt: 'CeraVe' },
    { src: '/src/assets/brands/skinceuticals.png', alt: 'SkinCeuticals' },
  ];

  // Nhân đôi danh sách logo để tạo hiệu ứng cuộn liên tục
  const logos = [...brandLogos, ...brandLogos];

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderTrack}>
        {logos.map((brand, index) => (
          <div key={index} className={styles.slide}>
            <img src={brand.src} alt={brand.alt} className={styles.logo} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconSlider;
