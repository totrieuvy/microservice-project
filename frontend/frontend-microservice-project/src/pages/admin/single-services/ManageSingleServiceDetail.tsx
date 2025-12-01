import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Spin, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import "./ManageSingleServiceDetail.scss";

interface ServiceDetail {
  id: number;
  serviceName: string;
  type: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function ManageSingleServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: ServiceDetail }>(`/services/${id}`);
      setService(res.data.data);
    } catch (err) {
      const error = err as any;
      toast.error(error?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="detail-error">
        <p>Không tìm thấy dịch vụ</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-btn">
        Quay lại
      </Button>

      <Card title="Chi tiết dịch vụ Grooming" className="detail-card">
        <div className="detail-content">
          <div className="detail-image">
            <img src={service.imageUrl} alt={service.serviceName} />
          </div>

          <div className="detail-info">
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: "30%" }}>
              <Descriptions.Item label="ID">{service.id}</Descriptions.Item>
              <Descriptions.Item label="Tên dịch vụ">{service.serviceName}</Descriptions.Item>
              <Descriptions.Item label="Loại">{service.type}</Descriptions.Item>
              <Descriptions.Item label="Giá gốc">{service.basePrice.toLocaleString("vi-VN")}₫</Descriptions.Item>
              <Descriptions.Item label="Giảm giá">{service.discount}%</Descriptions.Item>
              <Descriptions.Item label="Giá cuối">
                <strong style={{ color: "#ef4444", fontSize: "16px" }}>
                  {service.finalPrice.toLocaleString("vi-VN")}₫
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{service.description}</Descriptions.Item>
              <Descriptions.Item label="Bắt đầu">
                {new Date(service.startDate).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Kết thúc">
                {new Date(service.endDate).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={service.isActive ? "green" : "red"}>
                  {service.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ManageSingleServiceDetail;
