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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);

  const decodeToken = (token: string) => {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  };

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

        sessionStorage.setItem("token", token);

        toast.success(res.data.message);

        const userData = decodeToken(token);
        const role = userData.role;

        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="Login">
      <div className="Login__card">
        <h2 className="Login__title">Đăng nhập</h2>

        <form className="Login__form" onSubmit={handleLogin}>
          <div className="Login__form__group">
            <label>Email</label>
            <input type="email" placeholder="Nhập email" onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="Login__form__group">
            <label>Mật khẩu</label>
            <input type="password" placeholder="Nhập mật khẩu" onChange={(e) => setPassword(e.target.value)} required />
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
