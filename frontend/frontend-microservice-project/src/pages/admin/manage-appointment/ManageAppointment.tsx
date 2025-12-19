import { useEffect, useState } from "react";
import { Table, Tag, Pagination, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import "./ManageAppointment.scss";

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
  paymentTime: string | null;
  completedTime: string | null;
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

interface BookingResponse {
  content: Booking[];
  page: number;
  totalPages: number;
  totalElements: number;
}

function ManageAppointment() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchBookings = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.get<BookingResponse>(`/booking/all?page=${pageNum}`);
      const data = res.data;
      setBookings(data.content || []);
      setPage(data.page);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "green";
      case "PENDING":
        return "orange";
      case "COMPLETED":
        return "blue";
      case "CANCELLED":
        return "red";
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
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: "Email khách hàng",
      dataIndex: "userId",
      key: "userId",
      width: 220,
      render: (userId: string, record: Booking) => (
        <Button
          type="link"
          style={{ padding: 0, height: "auto", fontWeight: 500 }}
          onClick={() => navigate(`/admin/appointments/${record.id}`)}
        >
          {userId}
        </Button>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Slot",
      key: "slot",
      width: 120,
      render: (_: unknown, record: Booking) => (
        <Tag color="blue">
          {record.startTime} - {record.endTime}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalFinalPrice",
      key: "totalFinalPrice",
      width: 120,
      align: "right" as const,
      render: (price: number) => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>{price.toLocaleString("vi-VN")}₫</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: unknown, record: Booking) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/admin/appointments/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="manage-appointment">
      <div className="page-header">
        <div>
          <h2>Quản lý lịch hẹn</h2>
          <p>Quản lý tất cả các lịch hẹn của khách hàng</p>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          bordered
        />

        <div className="pagination-wrapper">
          <Pagination
            current={page + 1} // BE 0-based → FE 1-based
            total={totalElements}
            pageSize={5} // 🔥 PHẢI KHỚP BE
            onChange={(p) => fetchBookings(p - 1)}
            showTotal={(total) => `Tổng ${total} lịch hẹn`}
            showSizeChanger={false}
            style={{ display: totalElements <= 5 ? "none" : "flex" }}
          />
        </div>
      </div>
    </div>
  );
}

export default ManageAppointment;
