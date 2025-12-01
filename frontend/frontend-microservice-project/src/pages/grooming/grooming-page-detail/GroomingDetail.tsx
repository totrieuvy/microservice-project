import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import "./GroomingDetail.scss";
import RelatedServices from "../../../components/relatedServices/RelatedServices";

interface ServiceDetail {
  id: number;
  serviceName: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function GroomingDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);

  const fetchDetailService = async (id: string) => {
    const res = await api.get(`/services/active/${id}`);
    setService(res.data.data);
  };

  useEffect(() => {
    if (id) fetchDetailService(id);
  }, [id]);

  if (!service) return <div className="loading">Đang tải...</div>;

  return (
    <div className="detail-page">
      <div className="detail-container">
        {/* LEFT IMAGE */}
        <div className="detail-left">
          <img src={service.imageUrl} alt={service.serviceName} />
        </div>

        {/* RIGHT INFO */}
        <div className="detail-right">
          <h1 className="title">{service.serviceName}</h1>

          <ul className="info-list">
            <li>
              <strong>Giá gốc:</strong> {service.basePrice.toLocaleString("vi-VN")}₫
            </li>
            <li>
              <strong>Giảm giá:</strong> {service.discount}%
            </li>
            <li>
              <strong>Giá sau giảm:</strong> {service.finalPrice.toLocaleString("vi-VN")}₫
            </li>
            <li>
              <strong>Mô tả:</strong> {service.description}
            </li>
            <li>
              <strong>Bắt đầu áp dụng:</strong> {new Date(service.startDate).toLocaleDateString()}
            </li>
            <li>
              <strong>Kết thúc:</strong> {new Date(service.endDate).toLocaleDateString()}
            </li>
          </ul>

          <div className="button-container">
            <button className="book-btn">Đặt lịch làm đẹp</button>
          </div>
        </div>
      </div>

      <RelatedServices currentId={service.id} />
    </div>
  );
}

export default GroomingDetail;
