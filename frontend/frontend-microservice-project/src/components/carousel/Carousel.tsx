import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import "./Carousel.scss";

const images = [
  "https://bizweb.dktcdn.net/100/369/010/themes/1030657/assets/slide-img1.jpg?1763967540927",
  "https://bizweb.dktcdn.net/100/369/010/themes/1030657/assets/slide-img2.jpg?1763967540927",
];

function Carousel() {
  return (
    <div className="carousel-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop={true}
        speed={800}
        className="banner-swiper"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img src={src} alt={`banner-${idx}`} className="banner-img" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Carousel;
