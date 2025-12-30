import "./footer.scss";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="Footer">
      <div className="Footer__container">
        <div className="Footer__content">
          {/* Brand Section */}
          <div className="Footer__section Footer__section--brand">
            <h3 className="Footer__section__title">Pet Grooming</h3>
            <p className="Footer__section__description">
              Dịch vụ chăm sóc thú cưng chuyên nghiệp hàng đầu. Chúng tôi cam kết mang đến những trải nghiệm tốt nhất
              cho những người bạn lông xù của bạn.
            </p>
            <div className="Footer__section__socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Facebook"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Instagram"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Twitter"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Youtube"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="Youtube" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="TikTok"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" />
              </a>
            </div>
          </div>

          {/* Services Section */}
          <div className="Footer__section">
            <h4 className="Footer__section__heading">Dịch vụ</h4>
            <ul className="Footer__section__list">
              <li>
                <a href="/lich-lam-dep">Làm đẹp thường xuyên</a>
              </li>
              <li>
                <a href="/lich-lam-dep">Làm đẹp đặc biệt</a>
              </li>
              <li>
                <a href="/lich-lam-dep">Chăm sóc lông</a>
              </li>
              <li>
                <a href="/lich-lam-dep">Đặt lịch hẹn</a>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="Footer__section">
            <h4 className="Footer__section__heading">Liên kết nhanh</h4>
            <ul className="Footer__section__list">
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/information">Thông tin tài khoản</a>
              </li>
              <li>
                <a href="#">Chính sách riêng tư</a>
              </li>
              <li>
                <a href="#">Điều khoản dịch vụ</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="Footer__section">
            <h4 className="Footer__section__heading">Liên hệ</h4>
            <div className="Footer__section__contact">
              <p>
                <strong>Điện thoại:</strong>
                <a href="tel:+84123456789"> +84 (123) 456 789</a>
              </p>
              <p>
                <strong>Email:</strong>
                <a href="mailto:info@petgrooming.com"> info@petgrooming.com</a>
              </p>
              <p>
                <strong>Địa chỉ:</strong>
                <span> 123 Nguyễn Trãi, Hồ Chí Minh, Việt Nam</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="Footer__bottom">
          <p className="Footer__bottom__copyright">
            &copy; {currentYear} Pet Grooming Service. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
