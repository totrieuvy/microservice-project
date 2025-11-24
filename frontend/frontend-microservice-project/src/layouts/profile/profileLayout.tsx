import { Outlet } from "react-router-dom";
import "./profileLayout.scss";
import ProfilePanel from "../../components/panel/profilePanel";

function ProfilePage() {
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

export default ProfilePage;
