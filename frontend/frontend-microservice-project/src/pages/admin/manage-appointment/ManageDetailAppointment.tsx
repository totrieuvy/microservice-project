import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { Tag, Spin, Row, Col, Steps, Button, Descriptions, Table, Modal, Image, Upload } from "antd";
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CameraOutlined,
  UploadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "./ManageDetailAppointment.scss";
import { toast } from "react-toastify";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload";

const CLOUDINARY_CLOUD_NAME = "duikwluky";
const CLOUDINARY_UPLOAD_PRESET = "hamster_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface BookingDetail {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  discount: number;
}

interface Payment {
  paymentMethod: string;
  responseCode: string;
}

interface Timeline {
  checkInUrl: string | null;
  checkInTime: string | null;
  checkOutUrl: string | null;
  checkOutTime: string | null;
  paymentTime: string | null;
  inProgressTime: string | null;
  completedTime: string | null; // Assuming this might still exist or be added back
  cancelTime: string | null;
  noShowTime: string | null;
  failTime: string | null;
}

interface Booking {
  id: number;
  userId: string;
  hamsterId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalBasePrice: number;
  totalFinalPrice: number;
  status: string;
  details: BookingDetail[];
  payment: Payment | null;
  timeline: Timeline | null;
}

function ManageDetailAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const IMG_VN_PAY = "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png";
  const IMG_ZALO_PAY = "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png";

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/booking/${id}`);
      setData(res.data);
    } catch (e) {
      console.error("Error fetching booking detail:", e);
      toast.error("Không thể tải thông tin lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: RcFile): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadToCloudinary(file as RcFile);
      onSuccess?.({ secure_url: url });
    } catch (err) {
      onError?.(err);
      toast.error("Upload ảnh thất bại");
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleCheckin = async () => {
    const imageUrl = fileList[0]?.response?.secure_url;

    if (!imageUrl) {
      toast.error("Ảnh chưa upload thành công");
      return;
    }

    setUploading(true);
    try {
      await api.put(`/booking/${id}/check-in`, { imageUrl });
      toast.success("Check-in thành công!");
      setIsCheckinModalOpen(false);
      setFileList([]);
      fetchDetail();
    } catch (err) {
      toast.error("Check-in thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleCheckout = async () => {
    const imageUrl = fileList[0]?.response?.secure_url;

    if (!imageUrl) {
      toast.error("Ảnh chưa upload thành công");
      return;
    }

    setUploading(true);
    try {
      await api.put(`/booking/${id}/check-out`, { imageUrl });
      toast.success("Check-out thành công!");
      setIsCheckoutModalOpen(false);
      setFileList([]);
      fetchDetail();
    } catch (err) {
      toast.error("Check-out thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSetInProgress = async () => {
    try {
      await api.put(`/booking/${id}/status?status=IN_PROGRESS`);
      toast.success("Đã cập nhật trạng thái thành 'Đang thực hiện'");
      fetchDetail();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại.");
      console.error(error);
    }
  };

  const uploadProps: UploadProps = {
    listType: "picture-card",
    maxCount: 1,
    customRequest: handleUpload,
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
  };

  if (loading || !data)
    return (
      <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );

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
      title: "Đơn giá",
      dataIndex: "servicePrice",
      key: "price",
      align: "right" as const,
      render: (price: number) => `${price.toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center" as const,
      render: (discount: number) => (discount ? `${discount}%` : "-"),
    },
  ];

  return (
    <div className="manage-detail-appointment">
      <div className="detail-page-header">
        <div>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            className="back-btn"
            onClick={() => navigate("/admin/appointments")}
          >
            Quay lại danh sách
          </Button>
          <h1>
            Chi tiết lịch hẹn <span>#{data?.id || id}</span>
          </h1>
        </div>
        <div className="header-actions">
          {data.status === "PAID" && (
            <Button
              type="primary"
              icon={<CameraOutlined />}
              className="checkin-btn"
              onClick={() => {
                setFileList([]);
                setIsCheckinModalOpen(true);
              }}
            >
              Check-in
            </Button>
          )}
          {data.status === "CHECKED_IN" && (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleSetInProgress}>
              Bắt đầu thực hiện
            </Button>
          )}
          {data.status === "IN_PROGRESS" && (
            <Button
              type="primary"
              danger
              icon={<CameraOutlined />}
              onClick={() => {
                setFileList([]);
                setIsCheckoutModalOpen(true);
              }}
            >
              Check-out
            </Button>
          )}
          <Tag
            color={getStatusColor(data.status)}
            style={{ padding: "6px 16px", fontSize: "14px", borderRadius: "20px" }}
          >
            {getStatusText(data.status)}
          </Tag>
        </div>
      </div>

      <Row gutter={24}>
        <Col span={24} lg={16}>
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
                    description: `Ngày ${new Date(data.bookingDate).toLocaleDateString("vi-VN")}`,
                  },
                  {
                    title: "Thanh toán",
                    description: data.timeline?.paymentTime
                      ? new Date(data.timeline.paymentTime).toLocaleString("vi-VN")
                      : "Chờ xử lý",
                  },
                  {
                    title: "Check-in",
                    description: data.timeline?.checkInTime
                      ? new Date(data.timeline.checkInTime).toLocaleString("vi-VN")
                      : "Chờ xử lý",
                  },
                  {
                    title: "Thực hiện",
                    description: data.timeline?.inProgressTime
                      ? new Date(data.timeline.inProgressTime).toLocaleString("vi-VN")
                      : "Chờ xử lý",
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

          <div className="card-box">
            <div className="section-title">
              <ShoppingOutlined /> Chi tiết dịch vụ
            </div>
            <Table
              dataSource={data.details}
              columns={columnsService}
              pagination={false}
              rowKey="serviceId"
              bordered
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <span style={{ fontWeight: 600 }}>Tổng tạm tính</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span style={{ fontWeight: 600 }}>{data.totalFinalPrice.toLocaleString("vi-VN")}₫</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <div className="total-price-box">
              <span className="label">Tổng cộng thanh toán:</span>
              <span className="value">{data.totalFinalPrice.toLocaleString("vi-VN")}₫</span>
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
                    <Image width={"100%"} src={data.timeline.checkInUrl} />
                    <span>{new Date(data.timeline.checkInTime!).toLocaleString("vi-VN")}</span>
                  </div>
                )}
                {data.timeline.checkOutUrl && (
                  <div className="image-item">
                    <p>Ảnh Check-out</p>
                    <Image width={"100%"} src={data.timeline.checkOutUrl} />
                    <span>{new Date(data.timeline.checkOutTime!).toLocaleString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Col>

        <Col span={24} lg={8}>
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
              {data.payment?.paymentMethod && !["VNPAY", "ZALOPAY"].includes(data.payment.paymentMethod) && (
                <Tag color="default" style={{ fontSize: 14, padding: "5px 10px" }}>
                  {data.payment.paymentMethod}
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
                <span
                  style={{ color: ["PAID", "REFUNDED"].includes(data.status) ? "green" : "orange", fontWeight: 600 }}
                >
                  {["PAID", "REFUNDED"].includes(data.status) ? "Thành công" : "Đang xử lý"}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className="card-box">
            <div className="section-title">
              <UserOutlined /> Thông tin khách hàng
            </div>
            <Descriptions column={1} layout="vertical">
              <Descriptions.Item label="Email khách hàng">
                <b>{data.userId}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Hamster ID">
                <Tag color="blue">#{data.hamsterId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày & Giờ">
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

      <Modal
        title="Check-in cho Lịch hẹn"
        open={isCheckinModalOpen}
        onOk={handleCheckin}
        onCancel={() => setIsCheckinModalOpen(false)}
        confirmLoading={uploading}
        okText="Xác nhận Check-in"
        cancelText="Hủy"
        destroyOnClose
      >
        <p>Vui lòng tải lên hình ảnh của hamster để xác nhận check-in.</p>
        <Upload {...uploadProps}>
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
          </div>
        </Upload>
      </Modal>

      <Modal
        title="Check-out cho Lịch hẹn"
        open={isCheckoutModalOpen}
        onOk={handleCheckout}
        onCancel={() => setIsCheckoutModalOpen(false)}
        confirmLoading={uploading}
        okText="Xác nhận Check-out"
        cancelText="Hủy"
        destroyOnClose
      >
        <p>Vui lòng tải lên hình ảnh của hamster khi hoàn thành dịch vụ để xác nhận check-out.</p>
        <Upload {...uploadProps}>
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
          </div>
        </Upload>
      </Modal>
    </div>
  );
}

export default ManageDetailAppointment;
