import { useEffect, useState } from "react";
import "./GroomingService.scss";
import api from "../../../config/axios";
import { Link } from "react-router-dom";
import { Tabs } from "antd";

// ... (Giữ nguyên các interface không thay đổi) ...
interface SingleService {
  id: number;
  serviceName: string;
  basePrice: number;
  finalPrice: number;
  discount: number;
  imageUrl: string;
  isActive: boolean;
}

interface ComboChild {
  id: number;
  serviceName: string;
  basePrice: number;
  finalPrice: number;
}

interface ComboService {
  id: number;
  serviceName: string;
  finalPrice: number;
  children: ComboChild[];
}

interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function GroomingService() {
  const [activeTab, setActiveTab] = useState<string>("single");
  const [services, setServices] = useState<SingleService[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [combos, setCombos] = useState<ComboService[]>([]);

  const fetchSingle = (pageIndex: number) => {
    api
      .get<ApiResponse<PaginationResponse<SingleService>>>(`/services/active?page=${pageIndex}&size=8`)
      .then((res) => {
        const data = res.data.data;
        const filtered = data.content.filter((item) => item.isActive === true);
        setServices(filtered);
        setTotalPages(data.totalPages);
        setPage(data.number);
      })
      .catch((err) => console.log(err));
  };

  const fetchCombos = () => {
    api
      .get<ApiResponse<ComboService[]>>(`/services/combos`)
      .then((res) => {
        setCombos(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchSingle(0);
    document.title = "Dịch Vụ Chăm Sóc & Vệ Sinh";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "single") {
      fetchSingle(0);
    } else if (key === "combo") {
      fetchCombos();
    }
  };

  return (
    <div className="grooming-container">
      {/* Header Section mới */}
      <div className="header-section">
        <h2 className="title">Dịch Vụ Spa & Grooming</h2>
        <p className="subtitle">Chăm sóc toàn diện cho thú cưng của bạn với các gói dịch vụ tốt nhất</p>
      </div>

      <Tabs
        defaultActiveKey="single"
        onChange={handleTabChange}
        items={[
          { key: "single", label: "Dịch vụ lẻ" },
          { key: "combo", label: "Combo Tiết Kiệm" },
        ]}
      />

      {activeTab === "single" && (
        <>
          <div className="grooming-grid">
            {services.map((item) => (
              <div className="grooming-card" key={item.id}>
                {/* Badge mới đẹp hơn */}
                {item.discount > 0 && <div className="discount-badge">-{item.discount}%</div>}

                <div className="image-box">
                  <Link to={`/lich-lam-dep/${item.id}`}>
                    <img src={item.imageUrl} alt={item.serviceName} />
                  </Link>
                </div>

                <div className="card-info">
                  <Link to={`/lich-lam-dep/${item.id}`} style={{ textDecoration: "none" }}>
                    <h3 className="service-name">{item.serviceName}</h3>
                  </Link>

                  <div className="price-box">
                    {item.discount > 0 && <span className="base-price">{item.basePrice.toLocaleString("vi-VN")}₫</span>}
                    <span className="final-price">{item.finalPrice.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>

                {/* Nút giả lập hành động */}
                <Link to={`/lich-lam-dep/${item.id}`} className="view-btn">
                  Đặt lịch ngay
                </Link>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => fetchSingle(page - 1)}>
              &lt;
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx} className={page === idx ? "active" : ""} onClick={() => fetchSingle(idx)}>
                {idx + 1}
              </button>
            ))}
            <button disabled={page === totalPages - 1} onClick={() => fetchSingle(page + 1)}>
              &gt;
            </button>
          </div>
        </>
      )}

      {activeTab === "combo" && (
        <div className="grooming-grid">
          {combos.map((combo) => (
            <div className="grooming-card" key={combo.id}>
              {/* Badge cho combo */}
              <div className="discount-badge" style={{ background: "#ffa502" }}>
                Combo HOT
              </div>

              <div className="image-box">
                <Link to={`/lich-lam-dep/${combo.id}`}>
                  {/* Nếu bạn có ảnh riêng cho combo thì thay thế dòng dưới, nếu không dùng ảnh mặc định đẹp hơn */}
                  <img
                    src="https://media.istockphoto.com/id/1068118124/photo/professional-cares-for-a-dog-in-a-specialized-salon-groomers-holding-tools-at-the-hands.jpg?s=612x612&w=0&k=20&c=GIULBrZSjpT-HrHFfSwE6qjR_unw9lRuRkauu4gWDZE="
                    alt={combo.serviceName}
                  />
                </Link>
              </div>

              <div className="card-info">
                <h3 className="service-name">{combo.serviceName}</h3>

                <div className="price-box">
                  <span className="final-price">{combo.finalPrice.toLocaleString("vi-VN")}₫</span>
                </div>

                <div className="combo-children">
                  {combo.children.map((child) => (
                    <p key={child.id}>{child.serviceName}</p>
                  ))}
                </div>
              </div>
              <Link to={`/lich-lam-dep/${combo.id}`} className="view-btn">
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroomingService;
