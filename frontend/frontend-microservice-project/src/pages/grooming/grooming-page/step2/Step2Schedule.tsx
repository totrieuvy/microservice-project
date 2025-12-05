import "./Step2Schedule.scss";
import { useEffect, useState } from "react";
import api from "../../../../config/axios";
import { useServiceStore } from "../../../../zustand/serviceStore";
import { useScheduleStore } from "../../../../zustand/scheduleStore";
import { useNavigate } from "react-router-dom";

function Step2Schedule() {
  const navigate = useNavigate();
  const service = useServiceStore();
  const { setDate, setSlot, setStaff } = useScheduleStore();

  const [week, setWeek] = useState<any[]>([]);
  const [selectedDate, selectDate] = useState<string | null>(null);
  const [selectedSlot, selectSlot] = useState<any>(null);

  // Call API generate
  useEffect(() => {
    const srv = service.selectedSingle || service.selectedCombo;
    api
      .post("/schedules/generate", { serviceId: srv?.id })
      .then((res) => setWeek(res.data))
      .catch(console.error);
  }, []);

  const handleNext = () => {
    if (!selectedDate || !selectedSlot) return;

    setDate(selectedDate);
    setSlot(selectedSlot);
    navigate("/dat-lich/step-3"); // qua chọn staff + hamster
  };

  return (
    <div className="schedule-wrapper">
      <h2>Chọn lịch làm đẹp</h2>

      <div className="date-row">
        {week.map((d) => (
          <div
            key={d.date}
            className={`date-box ${selectedDate === d.date ? "active" : ""}`}
            onClick={() => selectDate(d.date)}
          >
            {d.date}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="slot-grid">
          {week
            .find((d) => d.date === selectedDate)
            ?.slots.map((slot: any) => (
              <div
                key={slot.startTime}
                className={`slot-box ${selectedSlot === slot ? "active" : ""}`}
                onClick={() => selectSlot(slot)}
              >
                <p>
                  {slot.startTime} - {slot.endTime}
                </p>
                <span>Slot còn: {slot.availableSlot}</span>
              </div>
            ))}
        </div>
      )}

      {selectedSlot && (
        <div className="staff-row">
          {selectedSlot.staffs.map((st: any) => (
            <button
              key={st.name}
              className="staff-btn"
              onClick={() => {
                setStaff(st);
                handleNext();
              }}
            >
              {st.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Step2Schedule;
