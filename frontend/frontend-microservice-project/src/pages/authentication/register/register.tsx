import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../../config/axios";
import "./Register.scss";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  code: number;
  message: string;
}

function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Đăng ký";
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    const payload: RegisterRequest = { name, email, password };

    try {
      const res = await api.post<RegisterResponse>("/auth/register", payload);

      if (res.data.code === 200) {
        setLoading(false);
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message || "Đã có lỗi xảy ra!");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        toast.error(serverMessage || error.message || "Đã có lỗi xảy ra!");
      } else {
        toast.error("Đã có lỗi xảy ra!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Register">
      <div className="Register__card">
        <h2 className="Register__title">Đăng ký</h2>

        <form className="Register__form" onSubmit={handleRegister}>
          <div className="Register__form__group">
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập họ tên"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="Register__form__group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="Register__form__group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="Register__form__group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="Register__button" disabled={loading}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="loading-spinner"></div>
                Đang đăng ký...
              </div>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <div className="Register__footer">
          <Link to="/login">Đã có tài khoản?</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
