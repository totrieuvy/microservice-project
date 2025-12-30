import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./RelatedServices.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
// @ts-expect-error - swiper CSS has no type declarations
import "swiper/css";
// @ts-expect-error - swiper CSS has no type declarations
import "swiper/css/pagination";
import { Link } from "react-router-dom";

interface Service {
  id: number;
  serviceName: string;
  imageUrl: string;
  finalPrice: number;
}

function RelatedServices({ currentId }: { currentId: number }) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const res = await api.get("/services/all");
      const filtered = res.data.data.filter((s: Service) => s.id !== currentId);
      setServices(filtered);
    };

    fetchAll();
  }, [currentId]);

  return (
    <div className="related-wrapper">
      <h2 className="related-title">CÁC DỊCH VỤ KHÁC</h2>

      <Swiper
        slidesPerView={4}
        spaceBetween={25}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="related-swiper"
      >
        {services.map((s) => (
          <SwiperSlide key={s.id}>
            <div className="related-card">
              <Link to={`/lich-lam-dep/${s.id}`}>
                <img src={s.imageUrl} alt={s.serviceName} />
              </Link>
              <h3>{s.serviceName}</h3>
              <p className="price">{s.finalPrice.toLocaleString("vi-VN")}₫</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default RelatedServices;
