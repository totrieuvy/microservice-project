import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

function HomepageLayout() {
  const HEADER_HEIGHT = "90px";
  return (
    <div className="HomepageLayout">
      <div className="HomepageLayout__header">
        <Header />
      </div>
      <div className="HomepageLayout__main" style={{ paddingTop: HEADER_HEIGHT }}>
        <Outlet />
      </div>
      <div className="HomepageLayout__footer">
        <Footer />
      </div>
    </div>
  );
}

export default HomepageLayout;
