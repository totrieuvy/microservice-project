import "./Step4Confirm.scss";
import { useServiceStore } from "../../../../zustand/serviceStore";
import { useScheduleStore } from "../../../../zustand/scheduleStore";
import { useHamsterStore } from "../../../../zustand/hamsterStore";

function Step4Confirm() {
  const srv = useServiceStore();
  const sch = useScheduleStore();
  const pet = useHamsterStore();

  return (
    <div className="confirm-wrapper">
      <h2>Xác nhận thông tin</h2>

      <div className="confirm-box">
        <h3>Dịch vụ</h3>
        <p>{srv.selectedSingle?.serviceName || srv.selectedCombo?.serviceName}</p>

        <h3>Ngày & giờ</h3>
        <p>{sch.selectedDate}</p>
        <p>
          {sch.selectedSlot?.startTime} - {sch.selectedSlot?.endTime}
        </p>

        <h3>Nhân viên</h3>
        <p>{sch.selectedStaff?.name}</p>

        <h3>Thú cưng</h3>
        <p>{pet.hamster?.name}</p>
      </div>

      <button className="btn-confirm">Xác nhận đặt lịch</button>
    </div>
  );
}

export default Step4Confirm;
