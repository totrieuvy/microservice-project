import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { Tag, Spin, Row, Col, Steps, Divider, Button, Descriptions, Table, Image as AntImage, Card } from "antd";
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import "./BookingHistory.scss";

interface ServiceItem {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  discount: number;
}

interface BookingItem {
  hamsterId: string;
  services: ServiceItem[];
}

interface Timeline {
  bookingTime: string | null;
  checkInUrl: string | null;
  checkInTime: string | null;
  checkOutUrl: string | null;
  checkOutTime: string | null;
  paymentTime: string | null;
  inProgressTime: string | null;
  completedTime: string | null;
  cancelTime: string | null;
  noShowTime: string | null;
  failTime: string | null;
}

interface BookingData {
  id: number;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalBasePrice: number;
  totalFinalPrice: number;
  status: string;
  items: BookingItem[];
  payment: {
    paymentMethod: string | null;
    responseCode: string | null;
  };
  timeline: Timeline;
}

function BookingDetailHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Dùng link ảnh online placeholder cho gọn code demo, bạn thay lại bằng base64 của bạn nhé
  const IMG_VN_PAY = "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png";
  const IMG_ZALO_PAY = "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/booking/${id}`);
        console.log("API Response:", res.data);
        setData(res.data);
      } catch (e) {
        console.error("Error fetching booking detail:", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading || !data)
    return (
      <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );

  // Xử lý logic Timeline cho Steps Component
  const getCurrentStep = () => {
    switch (data.status) {
      case "PENDING":
        return 0;
      case "PAID":
        return 1;
      case "CHECKED_IN":
        return 2;
      case "IN_PROGRESS":
        return 3;
      case "CHECKED_OUT":
      case "COMPLETED":
        return 4;
      case "CANCELLED":
      case "FAILED":
      case "NO_SHOW":
      case "REFUNDED":
        return 1; // Or decide where to show failure
      default:
        return 0;
    }
  };

  const getStepStatus = () => {
    if (["CANCELLED", "FAILED", "NO_SHOW", "REFUNDED"].includes(data.status)) return "error";
    return "process";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "REFUNDED":
        return "green";
      case "PENDING":
        return "orange";
      case "COMPLETED":
      case "CHECKED_OUT":
        return "blue";
      case "CANCELLED":
      case "FAILED":
      case "NO_SHOW":
        return "red";
      case "CHECKED_IN":
      case "IN_PROGRESS":
        return "cyan";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      case "CHECKED_IN":
        return "Đã Check-in";
      case "CHECKED_OUT":
        return "Đã Check-out";
      case "NO_SHOW":
        return "Không đến";
      case "REFUNDED":
        return "Đã hoàn tiền";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      default:
        return status;
    }
  };

  const columnsService = [
    { title: "Tên dịch vụ", dataIndex: "serviceName", key: "name" },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center" as const,
      render: (discount: number) => (discount ? <Tag color="orange">{discount}%</Tag> : "-"),
    },
    {
      title: "Đơn giá",
      dataIndex: "servicePrice",
      key: "price",
      align: "right" as const,
      render: (price: number) => `${price.toLocaleString("vi-VN")}₫`,
    },
  ];

  // Flatten items for summary calculation
  const getAllServices = () => {
    if (!data?.items) return [];
    return data.items.flatMap((item) =>
      item.services.map((s) => ({
        ...s,
        hamsterId: item.hamsterId,
      }))
    );
  };

  return (
    <div className="booking-container">
      {/* Header & Back Button */}
      <div className="detail-page-header">
        <div>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            className="back-btn"
            onClick={() => navigate("/booking-history")}
          >
            Quay lại danh sách
          </Button>
          <h1>
            Đơn đặt lịch <span>#{data?.id || id}</span>
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          {/* Hiển thị status badge to đẹp hơn */}
          <Tag
            color={getStatusColor(data.status)}
            style={{ padding: "6px 16px", fontSize: "14px", borderRadius: "20px" }}
          >
            {getStatusText(data.status)}
          </Tag>
        </div>
      </div>

      <Row gutter={24}>
        {/* Cột trái: Timeline & Thông tin dịch vụ (Chiếm 2/3) */}
        <Col span={24} lg={16}>
          {/* Timeline Process */}
          <div className="card-box">
            <div className="section-title">
              <ClockCircleOutlined /> Tiến trình dịch vụ
            </div>
            <div style={{ padding: "20px 10px" }}>
              <Steps
                current={getCurrentStep()}
                status={getStepStatus()}
                items={[
                  {
                    title: "Đặt lịch",
                    description: data.timeline?.bookingTime
                      ? new Date(data.timeline.bookingTime).toLocaleString("vi-VN")
                      : "...",
                  },
                  {
                    title: "Thanh toán",
                    description: data.timeline?.paymentTime
                      ? new Date(data.timeline.paymentTime).toLocaleString("vi-VN")
                      : "...",
                  },
                  {
                    title: "Check-in",
                    description: data.timeline?.checkInTime
                      ? new Date(data.timeline.checkInTime).toLocaleString("vi-VN")
                      : "...",
                  },
                  {
                    title: "Thực hiện",
                    description: data.timeline?.inProgressTime
                      ? new Date(data.timeline.inProgressTime).toLocaleString("vi-VN")
                      : "...",
                  },
                  {
                    title: "Hoàn thành",
                    icon: <CheckCircleOutlined />,
                    description: data.timeline?.checkOutTime
                      ? new Date(data.timeline.checkOutTime).toLocaleString("vi-VN")
                      : "",
                  },
                ]}
              />
            </div>
          </div>

          {/* Chi tiết dịch vụ theo từng Hamster */}
          <div className="card-box">
            <div className="section-title">
              <ShoppingOutlined /> Chi tiết dịch vụ
            </div>

            {data.items && data.items.length > 0 ? (
              data.items.map((item, index) => (
                <div key={item.hamsterId} className="hamster-service-section">
                  <div className="hamster-header">
                    <span className="hamster-icon">🐹</span>
                    <span className="hamster-name">Hamster #{item.hamsterId}</span>
                    <Tag color="blue">{item.services.length} dịch vụ</Tag>
                  </div>
                  <Table
                    dataSource={item.services}
                    columns={columnsService}
                    pagination={false}
                    rowKey={(record) => `${item.hamsterId}-${record.serviceId}`}
                    size="small"
                    summary={() => {
                      const subtotal = item.services.reduce((acc, s) => acc + s.servicePrice, 0);
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <span style={{ fontWeight: 600 }}>Tổng phụ Hamster #{item.hamsterId}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span style={{ fontWeight: 600 }}>{subtotal.toLocaleString("vi-VN")}₫</span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                  {index < data.items.length - 1 && <Divider style={{ margin: "16px 0" }} />}
                </div>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#999" }}>Không có dịch vụ nào</div>
            )}

            <div className="total-price-box">
              <div className="price-summary">
                <div className="summary-row">
                  <span className="label">Số lượng Hamster:</span>
                  <span className="value">{data.items?.length || 0}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Tổng số dịch vụ:</span>
                  <span className="value">{getAllServices().length}</span>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div className="summary-row">
                  <span className="label">Tổng tiền gốc:</span>
                  <span className="value">{data.totalBasePrice?.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="summary-row total">
                  <span className="label">Tổng cộng thanh toán:</span>
                  <span className="value highlight">{data.totalFinalPrice?.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>
          </div>

          {(data.timeline?.checkInUrl || data.timeline?.checkOutUrl) && (
            <div className="card-box">
              <div className="section-title">
                <CameraOutlined /> Hình ảnh thực tế
              </div>
              <div className="image-gallery">
                {data.timeline.checkInUrl && (
                  <div className="image-item">
                    <p>Ảnh Check-in</p>
                    <AntImage width={"100%"} src={data.timeline.checkInUrl} />
                    <span>{new Date(data.timeline.checkInTime!).toLocaleString("vi-VN")}</span>
                  </div>
                )}
                {data.timeline.checkOutUrl && (
                  <div className="image-item">
                    <p>Ảnh Check-out</p>
                    <AntImage width={"100%"} src={data.timeline.checkOutUrl} />
                    <span>{new Date(data.timeline.checkOutTime!).toLocaleString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Col>

        {/* Cột phải: Thông tin khách hàng & Thanh toán (Chiếm 1/3) */}
        <Col span={24} lg={8}>
          {/* Thông tin thanh toán */}
          <div className="card-box">
            <div className="section-title">
              <CreditCardOutlined /> Thông tin thanh toán
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {data.payment?.paymentMethod === "VNPAY" && (
                <img src={IMG_VN_PAY} alt="VNPAY" className="payment-logo" style={{ height: 60 }} />
              )}
              {data.payment?.paymentMethod === "ZALOPAY" && (
                <img src={IMG_ZALO_PAY} alt="ZALOPAY" className="payment-logo" style={{ height: 60 }} />
              )}
              {!["VNPAY", "ZALOPAY"].includes(data.payment?.paymentMethod) && (
                <Tag color="default" style={{ fontSize: 14, padding: "5px 10px" }}>
                  {data.payment?.paymentMethod || "Tiền mặt"}
                </Tag>
              )}
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Thời gian">
                {data.timeline?.paymentTime
                  ? new Date(data.timeline.paymentTime).toLocaleString("vi-VN")
                  : "Chưa thanh toán"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span>
                  <Tag color={getStatusColor(data.status)}>{getStatusText(data.status)}</Tag>
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Thông tin khách hàng */}
          <div className="card-box">
            <div className="section-title">
              <UserOutlined /> Thông tin đặt lịch
            </div>
            <Descriptions column={1} layout="vertical">
              <Descriptions.Item label="Khách hàng">
                <b>{data.userId}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                <div>{new Date(data.bookingDate).toLocaleDateString("vi-VN")}</div>
                <div>
                  <Tag color="blue">
                    {data.startTime} - {data.endTime}
                  </Tag>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default BookingDetailHistory;
