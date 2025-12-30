import { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../../../config/axios";
import "./VerifyOtp.scss";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

interface VerifyOtpRequest {
  otp: string;
  token: string;
}

interface VerifyOtpResponse {
  code: number;
  message: string;
}

function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  useEffect(() => {
    document.title = "Xác nhận mã OTP";
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) refs.current[index + 1].focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      refs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Mã OTP phải có 6 số!");
      return;
    }

    if (!token) {
      toast.error("Token không hợp lệ!");
      return;
    }

    try {
      const payload: VerifyOtpRequest = {
        otp: otpCode,
        token: token,
      };

      const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", payload);

      if (res.data.code === 200) {
        toast.success(res.data.message);
        navigate("/login");
      } else if (res.data.code === 400) {
        toast.error(res.data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Đã có lỗi xảy ra!");
      } else {
        toast.error("Đã có lỗi xảy ra!");
      }
    }
  };

  return (
    <div className="VerifyOtp">
      <div className="VerifyOtp__card">
        <h2 className="VerifyOtp__title">Nhập mã OTP</h2>

        <form className="VerifyOtp__form" onSubmit={handleVerify}>
          <div className="VerifyOtp__otp-box">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) {
                    refs.current[index] = el;
                  }
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="VerifyOtp__otp-input"
              />
            ))}
          </div>

          <button type="submit" className="VerifyOtp__button">
            Xác nhận
          </button>
        </form>

        <div className="VerifyOtp__footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
