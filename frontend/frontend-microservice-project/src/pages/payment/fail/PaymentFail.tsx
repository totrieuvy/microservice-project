import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentFail.scss";

function PaymentFail() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="payment-wrapper">
      <div className={`payment-card fail ${animate ? "animate-in" : ""}`}>
        <div className="error-circle">
          <div className="error-background"></div>
          <svg className="error-icon" viewBox="0 0 52 52">
            <circle className="error-circle-path" cx="26" cy="26" r="25" fill="none" />
            <path className="error-cross error-cross-left" fill="none" d="M16 16 l20 20" />
            <path className="error-cross error-cross-right" fill="none" d="M36 16 l-20 20" />
          </svg>
        </div>

        <h1 className="title">Thanh toán thất bại!</h1>
        <p className="subtitle">Đã có lỗi xảy ra trong quá trình thanh toán</p>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;
