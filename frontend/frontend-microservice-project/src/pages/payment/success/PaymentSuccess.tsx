import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentSuccess.scss";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Confetti effect
  useEffect(() => {
    const confettiCount = 50;
    const colors = ["#52c41a", "#73d13d", "#95de64", "#ffd666", "#ffc53d"];

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + "s";
        confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
        document.querySelector(".payment-wrapper")?.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
      }, i * 30);
    }
  }, []);

  return (
    <div className="payment-wrapper">
      <div className={`payment-card success ${animate ? "animate-in" : ""}`}>
        <div className="checkmark-circle">
          <div className="checkmark-background"></div>
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="title">Thanh toán thành công!</h1>
        <p className="subtitle">Cảm ơn bạn đã tin tùng sử dụng dịch vụ của chúng tôi</p>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
          <button className="btn-primary" onClick={() => navigate("/booking-history")}>
            Xem lịch sử
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
