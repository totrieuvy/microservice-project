import { Outlet } from "react-router-dom";
import "./ProfileLayout.scss";
import ProfilePanel from "../../components/panel/profilePanel";

function ProfileLayout() {
  return (
    <div className="ProfilePage">
      <aside className="ProfilePage__panel">
        <ProfilePanel />
      </aside>

      <main className="ProfilePage__content">
        <Outlet />
      </main>
    </div>
  );
}

export default ProfileLayout;
