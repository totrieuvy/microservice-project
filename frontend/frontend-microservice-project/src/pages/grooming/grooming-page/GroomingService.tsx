import { useEffect, useMemo, useState } from "react";
import "./GroomingService.scss";
import api from "../../../config/axios";
import { Steps, Spin } from "antd";

import { useServiceStore } from "../../../zustand/serviceStore";
import { useScheduleStore } from "../../../zustand/scheduleStore";
import { useHamsterStore } from "../../../zustand/hamsterStore";

/* -----------------------------------------------------------
   Types
----------------------------------------------------------- */
interface SingleService {
  id: number;
  serviceName: string;
  basePrice: number;
  finalPrice: number;
  discount: number;
  imageUrl: string;
}

interface ComboChild {
  id: number;
  serviceName: string;
  finalPrice: number;
}

interface ComboService {
  id: number;
  serviceName: string;
  finalPrice: number;
  children: ComboChild[];
  image: string;
}

interface PaginationResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
}

interface Slot {
  id: number;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  maxSlots: number;
  availableSlots: number;
}

interface DaySchedule {
  date: string; // "2025-12-01"
  slots: Slot[];
}

/* -----------------------------------------------------------
   Fixed list of times (ensures grid alignment)
   CHANGE THIS LIST if you want different time rows
----------------------------------------------------------- */
const TIME_SLOTS = [
  { start: "09:00", end: "10:00", label: "09:00 - 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00" },
  { start: "13:00", end: "14:00", label: "13:00 - 14:00" },
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
];

/* -----------------------------------------------------------
   Helper: tuần hiện tại (T2..T6)
----------------------------------------------------------- */
function getCurrentWeekRange(weekOffset: number = 0) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const diffToMonday = dow === 0 ? -6 : 1 - dow;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday + weekOffset * 7);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return {
    startDate: fmt(monday),
    endDate: fmt(friday),
    days: [...Array(5)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return fmt(d);
    }),
  };
}

/* -----------------------------------------------------------
   Component
----------------------------------------------------------- */
function GroomingService() {
  const [step, setStep] = useState<number>(0);

  /* STEP 1 state */
  const [activeTab, setActiveTab] = useState<"single" | "combo">("single");
  const [services, setServices] = useState<SingleService[]>([]);
  const [combos, setCombos] = useState<ComboService[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const serviceStore = useServiceStore();

  const fetchSingles = (p: number) => {
    api
      .get(`/services/active?page=${p}&size=8`)
      .then((res) => {
        const data: PaginationResponse<SingleService> = res.data.data;
        setServices(data.content || []);
        setPage(data.number ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => {
        setServices([]);
        setPage(0);
        setTotalPages(1);
      });
  };

  const fetchCombos = () => {
    api
      .get("/services/combos")
      .then((res) => setCombos(res.data.data || []))
      .catch(() => setCombos([]));
  };

  useEffect(() => {
    fetchSingles(0);
  }, []);

  const [selectedService, setSelectedService] = useState<SingleService | ComboService | null>(null);

  const selectService = (s: SingleService | ComboService) => {
    setSelectedService(s);
  };

  /* STEP 2 state */
  const { setDate, setSlot } = useScheduleStore();
  const [week, setWeek] = useState<DaySchedule[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // selectedSlot: date + slot start time
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string } | null>(null);

  useEffect(() => {
    if (step !== 1) return;

    const { startDate, endDate, days } = getCurrentWeekRange(weekOffset);
    setWeekDays(days);

    setLoadingSchedule(true);
    api
      .get(`/schedules?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => {
        // Res is array of DaySchedule
        const data: DaySchedule[] = res.data || [];
        // normalize: ensure every day exists (in case API returns fewer)
        const normalized = days.map((d) => {
          const found = (data || []).find((x) => x.date === d);
          return found ?? { date: d, slots: [] };
        });
        setWeek(normalized);
      })
      .catch(() => {
        // fallback: empty week (all slots empty)
        const { days } = getCurrentWeekRange(weekOffset);
        setWeek(days.map((d) => ({ date: d, slots: [] })));
      })
      .finally(() => setLoadingSchedule(false));
  }, [step, weekOffset]);

  // helper: find slot by date & start
  const getSlot = (date: string, start: string) => {
    const day = week.find((d) => d.date === date);
    if (!day) return undefined;
    return day.slots.find((s) => s.startTime === start);
  };

  const chooseTimeSlot = (date: string, startTime: string) => {
    const slot = getSlot(date, startTime);
    if (!slot || slot.availableSlots === 0) {
      setSelectedSlot(null);
      return;
    }

    // Check if date is in the past
    const slotDate = new Date(date + "T" + startTime);
    const now = new Date();
    if (slotDate < now) {
      alert("Không thể chọn ngày/giờ trong quá khứ!");
      return;
    }

    setSelectedSlot({ date, startTime });
  };

  /* STEP 3 state */
  interface Hamster {
    id: number;
    name: string;
    imageUrl: string;
    breed?: string;
    color?: string;
    genderEnum?: string;
  }

  const hamsterStore = useHamsterStore();
  const [hamsters, setHamsters] = useState<Hamster[]>([]);
  const [selectedHamsterId, setSelectedHamsterId] = useState<number | null>(null);

  useEffect(() => {
    if (step !== 2) return;
    api
      .get("/hamsters")
      .then((res) => setHamsters(res.data?.data || []))
      .catch(() => setHamsters([]));
  }, [step]);

  const chooseHamster = (h: Hamster) => {
    setSelectedHamsterId(h?.id ?? null);
  };

  /* STEP 4 data from zustand */
  const sSingle = serviceStore.selectedSingle;
  const sCombo = serviceStore.selectedCombo;
  const schDate = useScheduleStore.getState().selectedDate;
  const schSlot = useScheduleStore.getState().selectedSlot;
  const hm = hamsterStore.hamster;

  /* Confirm booking action (placeholder) */
  const handleConfirm = async () => {
    try {
      if (!hm || !schDate || !schSlot) {
        return alert("Thiếu thông tin để đặt lịch!");
      }

      const service = sSingle ?? sCombo;
      if (!service) {
        return alert("Vui lòng chọn dịch vụ!");
      }

      const payload = {
        hamsterId: hm.id,
        bookingDate: new Date(schDate).toISOString(),
        startTime: schSlot.startTime,
        endTime: schSlot.endTime,
        paymentMethod: "VNPAY",
        slotId: schSlot.id,
        services: [
          {
            serviceId: service.id,
            serviceName: service.serviceName,
            servicePrice: service.finalPrice,
            discount: "discount" in service ? service.discount : 0,
          },
        ],
      };

      console.log("Payload gửi API:", payload);

      const res = await api.post("/booking", payload);
      const data = res.data;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl; // redirect sang VNPAY
      } else {
        alert("Không nhận được paymentUrl từ server!");
      }
    } catch (err) {
      console.error(err);
      alert("Đặt lịch thất bại!");
    }
  };

  /* render helpers */
  const formattedWeekTitle = useMemo(() => {
    if (!weekDays || weekDays.length !== 5) return "";
    return `${weekDays[0]} → ${weekDays[4]}`;
  }, [weekDays]);

  /* -----------------------------------------------------------
     JSX
  ----------------------------------------------------------- */
  return (
    <div className="grooming-wrapper">
      <Steps
        current={step}
        items={[{ title: "Dịch vụ" }, { title: "Lịch" }, { title: "Hamster" }, { title: "Xác nhận" }]}
      />

      {/* STEP 1 */}
      {step === 0 && (
        <div className="step step1">
          <h2 className="step-title">Dịch vụ Spa & Grooming</h2>

          <div className="tab-buttons">
            <button
              className={activeTab === "single" ? "active" : ""}
              onClick={() => {
                setActiveTab("single");
                fetchSingles(0);
              }}
            >
              Dịch vụ đơn lẻ
            </button>
            <button
              className={activeTab === "combo" ? "active" : ""}
              onClick={() => {
                setActiveTab("combo");
                fetchCombos();
              }}
            >
              Gói Combo Tiết Kiệm
            </button>
          </div>

          <div className="service-grid">
            {(activeTab === "single" ? services : combos).map((item) => (
              <div
                key={item.id}
                className={`service-card ${selectedService?.id === item.id ? "selected" : ""}`}
                onClick={() => selectService(item)}
              >
                <img className="service-img" src={item.imageUrl ?? item.image ?? ""} alt={item.serviceName} />

                <div className="service-info">
                  <h3>{item.serviceName}</h3>

                  {item.finalPrice != null && <p className="price">{item.finalPrice.toLocaleString()}₫</p>}

                  {"children" in item && item.children && (
                    <ul className="combo-list">
                      {item.children.map((c) => (
                        <li key={c.id}>{c.serviceName}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button
              className="btn-next"
              disabled={!selectedService}
              onClick={() => {
                if (selectedService) {
                  if (selectedService.children) {
                    serviceStore.setCombo(selectedService);
                  } else {
                    serviceStore.setSingle(selectedService);
                  }
                  setStep(1);
                }
              }}
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div className="step step2">
          <h2 className="step-title">Chọn lịch</h2>

          {loadingSchedule && <Spin />}

          <div className="week-header">
            <button className="week-nav-btn" onClick={() => setWeekOffset(weekOffset - 1)} disabled={weekOffset <= 0}>
              ← Tuần trước
            </button>
            <h3>Tuần {formattedWeekTitle}</h3>
            <button className="week-nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>
              Tuần sau →
            </button>
          </div>

          <div className="legend">
            <span>
              <span className="dot free" /> Còn trống
            </span>
            <span>
              <span className="dot selected" /> Đã chọn
            </span>
            <span>
              <span className="dot full" /> Hết chỗ
            </span>
          </div>

          <div className="weekly-grid">
            {/* time column */}
            <div className="time-col">
              <div className="time-header">Giờ</div>
              {TIME_SLOTS.map((t) => (
                <div key={t.start} className="time-cell">
                  {t.label}
                </div>
              ))}
            </div>

            {/* day columns */}
            {weekDays.map((d) => (
              <div className="day-col" key={d}>
                <div className="day-header">
                  {new Date(d).toLocaleDateString("vi-VN", { weekday: "short" })}
                  <br />
                  {new Date(d).toLocaleDateString("vi-VN")}
                </div>

                {TIME_SLOTS.map((t) => {
                  const slot = getSlot(d, t.start);
                  const isSelected = selectedSlot?.date === d && selectedSlot?.startTime === t.start;

                  // Check if this slot is in the past
                  const slotDateTime = new Date(d + "T" + t.start);
                  const isPast = slotDateTime < new Date();

                  const className =
                    slot == null || isPast
                      ? "slot-btn full"
                      : slot.availableSlots === 0
                      ? "slot-btn full"
                      : isSelected
                      ? "slot-btn selected"
                      : "slot-btn free";

                  return (
                    <button
                      key={t.start}
                      className={className}
                      disabled={!slot || slot.availableSlots === 0 || isPast}
                      onClick={() => chooseTimeSlot(d, t.start)}
                    >
                      {isPast ? "Đã qua" : slot ? `Còn trống ${slot.availableSlots}` : "--"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-back" onClick={() => setStep(0)}>
              ← Quay lại
            </button>
            <button
              className="btn-next"
              disabled={!selectedSlot}
              onClick={() => {
                if (selectedSlot) {
                  const slot = getSlot(selectedSlot.date, selectedSlot.startTime);
                  if (slot) {
                    setDate(selectedSlot.date);
                    setSlot(slot);
                    setStep(2);
                  }
                }
              }}
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div className="step step3">
          <h2 className="step-title">Chọn Hamster</h2>

          <div className="hamster-grid">
            {hamsters.length === 0 && <div>Không có hamster</div>}
            {hamsters.map((h) => (
              <div
                key={h.id}
                className={`hamster-card ${selectedHamsterId === h.id ? "active" : ""}`}
                onClick={() => chooseHamster(h)}
              >
                <div className="hamster-img-wrap">
                  <img src={h.imageUrl ?? ""} alt={h.name} />
                </div>

                <div className="hamster-info">
                  <h4>{h.name}</h4>
                  <p>Loại: {h.breed ?? h.color ?? "—"}</p>
                  <p>Giới tính: {h.genderEnum ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-back" onClick={() => setStep(1)}>
              ← Quay lại
            </button>
            <button
              className="btn-next"
              disabled={selectedHamsterId === null}
              onClick={() => {
                const selected = hamsters.find((h) => h.id === selectedHamsterId);
                if (selected) {
                  hamsterStore.setHamster(selected);
                  setStep(3);
                }
              }}
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div className="step step4">
          <h2 className="step-title">Xác nhận thông tin</h2>

          <div className="confirm-box">
            <div className="confirm-row">
              <div className="confirm-col">
                <div className="confirm-item">
                  <div className="confirm-label">🐹 Hamster</div>
                  <div className="confirm-value hamster-value">
                    {hm?.imageUrl && <img src={hm.imageUrl} alt={hm?.name} />}
                    <span>{hm?.name ?? "-"}</span>
                  </div>
                </div>

                <div className="confirm-item">
                  <div className="confirm-label">✨ Dịch vụ</div>
                  <div className="confirm-value">{sSingle?.serviceName ?? sCombo?.serviceName ?? "-"}</div>
                </div>

                <div className="confirm-item">
                  <div className="confirm-label">💰 Giá tiền</div>
                  <div className="confirm-value price-value">
                    {(sSingle?.finalPrice ?? sCombo?.finalPrice)?.toLocaleString() ?? "-"}₫
                  </div>
                </div>
              </div>

              <div className="confirm-col">
                <div className="confirm-item">
                  <div className="confirm-label">📅 Ngày hẹn</div>
                  <div className="confirm-value">{schDate ?? "-"}</div>
                </div>

                <div className="confirm-item">
                  <div className="confirm-label">⏰ Giờ hẹn</div>
                  <div className="confirm-value">{schSlot ? `${schSlot.startTime} - ${schSlot.endTime}` : "-"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-back" onClick={() => setStep(2)}>
              ← Quay lại
            </button>
            <button className="btn-confirm" onClick={handleConfirm}>
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroomingService;
