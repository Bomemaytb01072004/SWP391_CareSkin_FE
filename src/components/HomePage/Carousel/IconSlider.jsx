import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function IconSlider() {
  const settings = {
    infinite: true,
    speed: 5000, // Smooth transition speed
    slidesToShow: 4, // Default number of logos visible at once
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000, // Slower and smoother auto-slide
    cssEase: 'ease-in-out', // Smooth easing
    pauseOnHover: false,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } }, // Medium screens
      { breakpoint: 768, settings: { slidesToShow: 3 } }, // Tablets
      { breakpoint: 480, settings: { slidesToShow: 2 } }, // Mobile
    ],
  };

  // Array of brand logos
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

  return (
    <div className="max-w-full bg-white py-6">
      <Slider {...settings} className="flex items-center">
        {brandLogos.concat(brandLogos).map(
          (
            brand,
            index // Duplicate logos for infinite scrolling effect
          ) => (
            <div key={index} className="flex justify-center">
              <img
                src={brand.src}
                alt={brand.alt}
                className="h-16 md:h-20 sm:h-12 xs:h-10 object-contain mx-4"
                style={{ willChange: 'transform' }} // Enable GPU acceleration
              />
            </div>
          )
        )}
      </Slider>
    </div>
  );
}

export default IconSlider;
