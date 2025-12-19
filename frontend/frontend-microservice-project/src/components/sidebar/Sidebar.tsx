import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Sidebar.scss";
import { RiScissorsCutFill } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";

import logo from "../../assets/logo.png";

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

/* ====================================================
   🔥 Decode token (giống bản đã fix ở Login & App.tsx)
   ==================================================== */
const decodeTokenSafe = (rawToken: string | null) => {
  if (!rawToken) return null;

  const token = rawToken.startsWith("Bearer ") ? rawToken.substring(7) : rawToken;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let payload = parts[1];
    payload = payload.replace(/-/g, "+").replace(/_/g, "/");

    while (payload.length % 4 !== 0) payload += "=";

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

/* ====================================================
   🔥 Lấy roles linh hoạt theo mọi kiểu token
   ==================================================== */
const getRolesFromPayload = (payload: any): string[] => {
  if (!payload) return [];

  // Keycloak
  if (Array.isArray(payload?.realm_access?.roles)) {
    return payload.realm_access.roles;
  }

  // Custom single role
  if (typeof payload.role === "string") return [payload.role];
  if (typeof payload.ROLE === "string") return [payload.ROLE];

  // Custom array of roles
  if (Array.isArray(payload.roles)) return payload.roles;

  // Comma separated roles
  if (typeof payload.roles === "string") return payload.roles.split(",").map((r) => r.trim());

  // Spring authorities
  if (Array.isArray(payload.authorities)) return payload.authorities;

  return [];
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const rawToken = sessionStorage.getItem("token");
    const decoded = decodeTokenSafe(rawToken);

    if (!decoded) return;

    const roles = getRolesFromPayload(decoded);

    console.log("SIDEBAR - decoded payload:", decoded);
    console.log("SIDEBAR - roles:", roles);

    if (roles.includes("ADMIN")) {
      buildMenu("ADMIN");
    }
    if (roles.includes("USER")) {
      buildMenu("USER");
    }
  }, []);

  const handleMenuClick = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  /* =====================
     MENU THEO ROLE
     ===================== */
  const buildMenu = (role: string) => {
    if (role === "ADMIN") {
      setMenu([
        {
          icon: <MdDashboard />,
          label: "Dashboard",
          path: "/admin/dashboard",
        },
        {
          icon: <RiScissorsCutFill />,
          label: "Services",
          children: [
            {
              label: "Single Services",
              path: "/admin/services/single",
            },
            {
              label: "Combo Services",
              path: "/admin/services/combo",
            },
          ],
        },
        {
          icon: <RiScissorsCutFill />,
          label: "Accounts",
          path: "/admin/accounts",
        },
        {
          icon: <RiScissorsCutFill />,
          label: "Manage appointment",
          path: "/admin/appointments",
        },
      ]);
    }

    if (role === "USER") {
      setMenu([
        {
          icon: <RiScissorsCutFill />,
          label: "Lịch làm đẹp",
          path: "/lich-lam-dep",
        },
      ]);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const ToggleButton = () => (
    <button onClick={() => setCollapsed(!collapsed)} className="toggle-btn bottom">
      {collapsed ? "➡️ Mở rộng" : "⬅️ Thu gọn"}
    </button>
  );

  return (
    <div className="layout-wrapper">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="logo" />
          {!collapsed && <span className="brand">FPT UNIVERSITY</span>}
        </div>

        <div className="menu-container">
          {menu.map((item, idx) => (
            <div className="menu-group" key={idx}>
              {item.children ? (
                <div
                  className={`menu-title ${openMenuIndex === idx ? "active" : ""}`}
                  onClick={() => handleMenuClick(idx)}
                >
                  <span className="icon">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && <span className="arrow">{openMenuIndex === idx ? "▼" : "▶"}</span>}
                </div>
              ) : (
                <Link to={item.path!} className="menu-title link">
                  <span className="icon">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}

              {!collapsed && item.children && openMenuIndex === idx && (
                <div className="submenu">
                  {item.children.map((c, i) => (
                    <Link key={i} to={c.path} className="submenu-item">
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <ToggleButton />

        <button className="logout-btn" onClick={logout}>
          <span>✖</span>
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
