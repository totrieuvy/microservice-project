import "./profilePanel.scss";
import { NavLink } from "react-router-dom";

function ProfilePanel() {
  const menu = [
    { title: "Hồ sơ của bạn", path: "/information" },
    { title: "Hamster của bạn", path: "/hamsters" },
    { title: "Lịch sử mua sắm", path: "/information/orders" },
    { title: "Lịch đặt làm đẹp", path: "/information/booking-history" },
  ];

  return (
    <div className="ProfilePanel">
      <div className="ProfilePanel__title">Tài khoản của bạn</div>

      <ul className="ProfilePanel__menu">
        {menu.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => "ProfilePanel__menu__link " + (isActive ? "active" : "")}
            >
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePanel;
