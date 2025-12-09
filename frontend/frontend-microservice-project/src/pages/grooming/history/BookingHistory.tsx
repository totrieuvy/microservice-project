import { useEffect, useState } from "react";
import { Table, Tag, Button, Pagination } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import "./BookingHistory.scss";

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

function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBookings = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.get<BookingResponse>(`/booking/my?page=${pageNum}`);
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
      title: "Email",
      dataIndex: "userId",
      key: "userId",
      width: 200,
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Giờ",
      key: "time",
      width: 120,
      render: (_: unknown, record: Booking) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalFinalPrice",
      key: "totalFinalPrice",
      width: 120,
      render: (price: number) => (
        <span style={{ fontWeight: 600, color: "#ff6f3c" }}>{price.toLocaleString("vi-VN")}₫</span>
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
          onClick={() => console.log("View detail:", record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="booking-history">
      <div className="history-header">
        <h2>Lịch sử đặt lịch</h2>
        <p>Quản lý tất cả các lịch hẹn của bạn</p>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 900 }}
      />

      <div className="pagination-wrapper">
        <Pagination
          current={page + 1}
          total={totalElements}
          pageSize={10}
          onChange={(p) => fetchBookings(p - 1)}
          showTotal={(total) => `Tổng ${total} đơn`}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}

export default BookingHistory;
