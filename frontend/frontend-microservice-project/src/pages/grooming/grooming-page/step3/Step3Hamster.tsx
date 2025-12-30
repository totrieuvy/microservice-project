import "./Step3Hamster.scss";
import { useEffect, useState } from "react";
import api from "../../../../config/axios";
import { useHamsterStore } from "../../../../store/hamsterStore";
import { useNavigate } from "react-router-dom";

function Step3Hamster() {
  const [hamsters, setHamsters] = useState<any[]>([]);
  const setHamster = useHamsterStore((s) => s.setHamster);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/hamsters").then((res) => setHamsters(res.data.data));
  }, []);

  const choose = (h: any) => {
    setHamster(h);
    navigate("/dat-lich/step-4");
  };

  return (
    <div className="hamster-wrapper">
      <h2>Chọn thú cưng</h2>

      <div className="hamster-grid">
        {hamsters.map((h) => (
          <div className="hamster-card" key={h.id} onClick={() => choose(h)}>
            <img src={h.imageUrl} alt="" />
            <h4>{h.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step3Hamster;
