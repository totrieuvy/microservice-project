import "./header.scss";
import logo from "../../assets/logo.png";
import navigation from "../../constants/navigation";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface itemType {
  name: string;
  path: string;
}

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getUserFromToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  };

  const user = getUserFromToken();

  return (
    <div className={`Header${scrolled ? " Header--scrolled" : ""}`}>
      <div className="Header__left">
        <img src={logo} alt="logo" className="Header__left__logo" />
      </div>

      <div className="Header__middle">
        <ul className="Header__middle__ul">
          {navigation.map((item: itemType) => (
            <li key={item.path} className="Header__middle__ul__li">
              <NavLink to={item.path} className="Header__middle__ul__li__link">
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="Header__right">
        {user ? (
          <div className="Header__right__dropdown">
            <button className="Header__right__welcomeBtn" onClick={() => setOpen((prev) => !prev)}>
              Hi {user.email}
            </button>

            {open && (
              <div className="Header__right__menu">
                <p onClick={() => navigate("/information")} className="menu-item">
                  Thông tin của bạn
                </p>
                <p
                  className="menu-item logout"
                  onClick={() => {
                    sessionStorage.removeItem("token");
                    navigate("/");
                  }}
                >
                  Đăng xuất
                </p>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate("/login")}>Đăng nhập</button>
        )}
      </div>
    </div>
  );
}

export default Header;
