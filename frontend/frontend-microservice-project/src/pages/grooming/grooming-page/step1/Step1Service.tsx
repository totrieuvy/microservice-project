import "./Step1Service.scss";
import { useServiceStore } from "../../../../zustand/serviceStore";
import { useNavigate } from "react-router-dom";

function Step1Service({ service }: any) {
  const navigate = useNavigate();
  const setSingle = useServiceStore((s) => s.setSingle);
  const setCombo = useServiceStore((s) => s.setCombo);

  const handleSelect = () => {
    if (service.children) {
      setCombo({
        id: service.id,
        serviceName: service.serviceName,
        finalPrice: service.finalPrice,
      });
    } else {
      setSingle({
        id: service.id,
        serviceName: service.serviceName,
        finalPrice: service.finalPrice,
      });
    }
    navigate("/dat-lich/step-2");
  };

  return (
    <div className="step1-card">
      <img src={service.imageUrl || service.image} alt="" />
      <h3>{service.serviceName}</h3>
      <p className="price">{service.finalPrice.toLocaleString()}₫</p>

      <button className="btn-select" onClick={handleSelect}>
        Chọn dịch vụ
      </button>
    </div>
  );
}

export default Step1Service;
