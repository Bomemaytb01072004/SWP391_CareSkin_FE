import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './SloganCarousel.module.css';
function SloganCarousel() {
  return (
    <div className="SloganCarousel max-w-xl mx-auto p-4 ">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showArrows={false}
        interval={3000}
        emulateTouch
      >
        {/* Slide 1 */}
        <div className="relative">
          <img
            src="/src/assets/sloganimage1.png"
            alt="Slide 1"
            className="w-full h-full rounded-lg"
          />
        </div>
        {/* Slide 2 */}
        <div className="relative">
          <img
            src="/src/assets/sloganimage2.png"
            alt="Slide 2"
            className="w-full rounded-lg"
          />
        </div>
        {/* Slide 3 */}
        <div className="relative">
          <img
            src="/src/assets/sloganimage3.png"
            alt="Slide 3"
            className="w-full rounded-lg"
          />
        </div>
      </Carousel>
    </div>
  );
}

export default SloganCarousel;
