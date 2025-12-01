import { useEffect, useState } from "react";
import api from "../../../config/axios";
import "./login.scss";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
  };
}

/**
 * An toàn hơn: xử lý URL-safe base64, padding, và Bearer prefix
 */
const decodeTokenSafe = (rawToken: string | null) => {
  if (!rawToken) return null;
  // Nếu lỡ lưu "Bearer <token>" thì tách
  const token = rawToken.startsWith("Bearer ") ? rawToken.substring(7) : rawToken;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let payload = parts[1];

    // URL-safe -> chuẩn base64
    payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    // padding
    while (payload.length % 4 !== 0) payload += "=";

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

/**
 * Lấy roles linh hoạt từ payload
 */
const getRolesFromPayload = (payload: any): string[] => {
  if (!payload) return [];

  // Keycloak style
  if (Array.isArray(payload?.realm_access?.roles)) return payload.realm_access.roles;

  // custom single role field
  if (typeof payload.role === "string") return [payload.role];
  if (typeof payload.ROLE === "string") return [payload.ROLE];

  // roles can be array or comma-separated string
  if (Array.isArray(payload.roles)) return payload.roles;
  if (typeof payload.roles === "string") return payload.roles.split(",").map((r) => r.trim());

  // authorities style
  if (Array.isArray(payload.authorities)) return payload.authorities;

  return [];
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LoginRequest = { email, password };

    try {
      const res = await api.post<LoginResponse>("/auth/login", payload);

      if (res.data.code === 400) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.code === 200) {
        const token = res.data.data.accessToken;

        // Lưu token (chỉ token raw, không thêm "Bearer ")
        sessionStorage.setItem("token", token);

        toast.success(res.data.message);

        // decode an toàn
        const userData = decodeTokenSafe(token);
        if (!userData) {
          // Nếu decode thất bại, vẫn redirect tới home (không có role)
          console.warn("Không thể decode token, chuyển về trang chủ.");
          navigate("/");
          return;
        }

        const roles: string[] = getRolesFromPayload(userData);

        // Debug: bật console để kiểm tra payload/roles khi cần
        console.debug("Token payload:", userData);
        console.debug("Resolved roles:", roles);

        if (roles.includes("ADMIN")) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error(error);
      // Thông báo lỗi chung
      toast.error(error?.response?.data?.message ?? "Đăng nhập thất bại");
    }
  };

  return (
    <div className="Login">
      <div className="Login__card">
        <h2 className="Login__title">Đăng nhập</h2>

        <form className="Login__form" onSubmit={handleLogin}>
          <div className="Login__form__group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="Login__form__group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          <button type="submit" className="Login__button">
            Đăng nhập
          </button>
        </form>

        <div className="Login__footer">
          <Link to="/register">Đăng ký</Link>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
