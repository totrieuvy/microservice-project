import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./information.scss";

interface ProfileResponse {
  code: number;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    roleEnum: string;
    isActive: boolean;
  };
}

function Information() {
  const [profile, setProfile] = useState<ProfileResponse["data"] | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get<ProfileResponse>("/auth/profile");

      if (res.data.code === 200) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Đang tải thông tin...</div>;
  }

  return (
    <div className="Information">
      <h2 className="Information__title">Hồ sơ của bạn</h2>

      <div className="Information__card">
        <div className="Information__row">
          <span className="Information__label">Tên:</span>
          <span className="Information__value">{profile.name}</span>
        </div>

        <div className="Information__row">
          <span className="Information__label">Email:</span>
          <span className="Information__value">{profile.email}</span>
        </div>

        <div className="Information__row">
          <span className="Information__label">Vai trò:</span>
          <span className="Information__value">{profile.roleEnum}</span>
        </div>

        <div className="Information__row">
          <span className="Information__label">Trạng thái:</span>
          <span className={`Information__status ${profile.isActive ? "active" : "inactive"}`}>
            {profile.isActive ? "Hoạt động" : "Ngưng hoạt động"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Information;
