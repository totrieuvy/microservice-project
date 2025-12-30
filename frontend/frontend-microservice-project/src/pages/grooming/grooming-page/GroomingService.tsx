import { useEffect, useMemo, useState } from "react";
import "./GroomingService.scss";
import api from "../../../config/axios";
import { Steps, Spin } from "antd";

import { useScheduleStore } from "../../../store/scheduleStore";
import useRealtime from "../../../hooks/useRealTime";

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

interface Staff {
  name: string;
}

interface Slot {
  id?: number;
  startTime: string;
  endTime: string;
  maxSlots?: number;
  availableSlots?: number; // from API
  availableSlot?: number; // from store
  staffs?: Staff[];
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

  /* STEP 1 state (now schedule) */
  const [activeTab, setActiveTab] = useState<"single" | "combo">("single");
  const [services, setServices] = useState<SingleService[]>([]);
  const [combos, setCombos] = useState<ComboService[]>([]);

  const fetchSingles = (p: number) => {
    api
      .get(`/services/active?page=${p}&size=50`)
      .then((res) => {
        const data: PaginationResponse<SingleService> = res.data.data;
        setServices(data.content || []);
      })
      .catch(() => {
        setServices([]);
      });
  };

  const fetchCombos = () => {
    api
      .get("/services/combos")
      .then((res) => setCombos(res.data.data || []))
      .catch(() => setCombos([]));
  };

  /* Schedule state */
  const { setDate, setSlot } = useScheduleStore();
  const [week, setWeek] = useState<DaySchedule[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // selectedSlot: date + slot start time
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string } | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  useRealtime((body) => {
    console.log("Received WebSocket message:", body);
    if (body.body === "CREATE NEW GROOMING") {
      fetchSingles(0);
    }
  });

  // Load schedule when weekOffset changes or on mount (step starts at 0)
  useEffect(() => {
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
        const fallbackDays = getCurrentWeekRange(weekOffset).days;
        setWeek(fallbackDays.map((d) => ({ date: d, slots: [] })));
      })
      .finally(() => setLoadingSchedule(false));
  }, [weekOffset]);

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

  const [hamsters, setHamsters] = useState<Hamster[]>([]);

  // New structure: each hamster has its own services
  interface BookingItem {
    hamsterId: number;
    hamster: Hamster;
    services: (SingleService | ComboService)[];
  }
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);

  useEffect(() => {
    if (step !== 1) return;
    // Fetch hamsters
    api
      .get("/hamsters")
      .then((res) => setHamsters(res.data?.data || []))
      .catch(() => setHamsters([]));
    // Fetch services for selection
    fetchSingles(0);
    fetchCombos();
  }, [step]);

  // Toggle hamster selection
  const toggleHamster = (h: Hamster) => {
    setBookingItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.hamsterId === h.id);
      if (existingIndex > -1) {
        // Remove hamster
        const newArr = [...prev];
        newArr.splice(existingIndex, 1);
        return newArr;
      }
      // Add hamster with empty services
      return [...prev, { hamsterId: h.id, hamster: h, services: [] }];
    });
  };

  // Toggle service for a specific hamster
  const toggleServiceForHamster = (hamsterId: number, service: SingleService | ComboService) => {
    setBookingItems((prev) => {
      return prev.map((item) => {
        if (item.hamsterId !== hamsterId) return item;

        const isCombo = "children" in service;
        const existingIndex = item.services.findIndex((s) => s.id === service.id && "children" in s === isCombo);

        if (existingIndex > -1) {
          // Remove service
          const newServices = [...item.services];
          newServices.splice(existingIndex, 1);
          return { ...item, services: newServices };
        }
        // Add service
        return { ...item, services: [...item.services, service] };
      });
    });
  };

  // Check if service is selected for a hamster
  const isServiceSelectedForHamster = (hamsterId: number, service: SingleService | ComboService) => {
    const item = bookingItems.find((b) => b.hamsterId === hamsterId);
    if (!item) return false;
    const isCombo = "children" in service;
    return item.services.some((s) => s.id === service.id && "children" in s === isCombo);
  };

  // Get booking item for a hamster
  const getBookingItem = (hamsterId: number) => {
    return bookingItems.find((item) => item.hamsterId === hamsterId);
  };

  /* STEP 4 data */
  const schDate = useScheduleStore.getState().selectedDate;
  const schSlot = useScheduleStore.getState().selectedSlot;

  // Calculate total price - sum of all services for all hamsters
  const totalPrice = useMemo(() => {
    return bookingItems.reduce((total, item) => {
      const itemTotal = item.services.reduce((acc, s) => acc + (s.finalPrice || 0), 0);
      return total + itemTotal;
    }, 0);
  }, [bookingItems]);

  // Check if booking is valid (all hamsters have at least 1 service)
  const isBookingValid = useMemo(() => {
    return bookingItems.length > 0 && bookingItems.every((item) => item.services.length > 0);
  }, [bookingItems]);

  /* Confirm booking action */
  const handleConfirm = async () => {
    try {
      if (bookingItems.length === 0 || !schDate || !schSlot) {
        return alert("Thiếu thông tin để đặt lịch!");
      }

      // Check all hamsters have services
      const invalidItems = bookingItems.filter((item) => item.services.length === 0);
      if (invalidItems.length > 0) {
        return alert(`Vui lòng chọn dịch vụ cho: ${invalidItems.map((i) => i.hamster.name).join(", ")}`);
      }

      // Build items array: each hamster has its own services
      const items = bookingItems.map((item) => ({
        hamsterId: String(item.hamsterId),
        services: item.services.map((service) => ({
          serviceId: service.id,
          serviceName: service.serviceName,
          servicePrice: service.finalPrice,
          discount: "discount" in service ? service.discount : 0,
        })),
      }));

      const payload = {
        bookingDate: new Date(schDate).toISOString(),
        startTime: schSlot.startTime,
        endTime: schSlot.endTime,
        paymentMethod: "VNPAY",
        slotId: selectedSlotId,
        items,
      };

      console.log("Payload gửi API:", payload);

      const res = await api.post("/booking", payload);
      const data = res.data;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
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
      <Steps current={step} items={[{ title: "Lịch" }, { title: "Hamster & Dịch vụ" }, { title: "Xác nhận" }]} />

      {/* STEP 1: Chọn lịch */}
      {step === 0 && (
        <div className="step step1">
          <h2 className="step-title">Chọn lịch hẹn</h2>

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
            <button
              className="btn-next"
              disabled={!selectedSlot}
              onClick={() => {
                if (selectedSlot) {
                  const slot = getSlot(selectedSlot.date, selectedSlot.startTime);
                  if (slot) {
                    setDate(selectedSlot.date);
                    // Convert to store format
                    setSlot({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      availableSlot: slot.availableSlots || 0,
                      staffs: slot.staffs || [],
                    });
                    // Save slotId separately
                    if (slot.id) setSelectedSlotId(slot.id);
                    setStep(1);
                  }
                }
              }}
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Chọn Hamster & Dịch vụ */}
      {step === 1 && (
        <div className="step step2">
          <h2 className="step-title">Chọn Hamster & Dịch vụ</h2>
          <p className="step-desc">Click vào hamster để chọn, sau đó chọn dịch vụ riêng cho từng hamster</p>

          {hamsters.length === 0 && <div className="empty-message">Không có hamster. Vui lòng thêm hamster trước.</div>}

          <div className="hamster-booking-list">
            {hamsters.map((h) => {
              const bookingItem = getBookingItem(h.id);
              const isSelected = !!bookingItem;

              return (
                <div key={h.id} className={`hamster-booking-card ${isSelected ? "active" : ""}`}>
                  <div className="hamster-header" onClick={() => toggleHamster(h)}>
                    <div className="hamster-info-row">
                      <div className="hamster-checkbox">{isSelected ? "✓" : ""}</div>
                      <img src={h.imageUrl ?? ""} alt={h.name} className="hamster-avatar" />
                      <div className="hamster-details">
                        <h4>{h.name}</h4>
                        <p>
                          {h.breed ?? h.color ?? "—"} • {h.genderEnum ?? "—"}
                        </p>
                      </div>
                    </div>
                    {isSelected && <div className="service-count">{bookingItem.services.length} dịch vụ đã chọn</div>}
                  </div>

                  {isSelected && (
                    <div className="hamster-services">
                      <h5>Chọn dịch vụ cho {h.name}:</h5>

                      {/* Tabs for Single/Combo */}
                      <div className="service-tabs">
                        <button
                          className={activeTab === "single" ? "tab-btn active" : "tab-btn"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("single");
                          }}
                        >
                          Dịch vụ đơn lẻ
                        </button>
                        <button
                          className={activeTab === "combo" ? "tab-btn active" : "tab-btn"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("combo");
                          }}
                        >
                          Combo
                        </button>
                      </div>

                      {/* Service list */}
                      <div className="service-list">
                        {(activeTab === "single" ? services : combos).map((service) => {
                          const isServiceChosen = isServiceSelectedForHamster(h.id, service);
                          return (
                            <div
                              key={`${h.id}-${service.id}-${"children" in service ? "combo" : "single"}`}
                              className={`service-item ${isServiceChosen ? "selected" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleServiceForHamster(h.id, service);
                              }}
                            >
                              <div className="service-item-check">{isServiceChosen ? "✓" : "+"}</div>
                              <img
                                src={"imageUrl" in service ? service.imageUrl : service.image ?? ""}
                                alt={service.serviceName}
                                className="service-item-img"
                              />
                              <div className="service-item-info">
                                <span className="service-item-name">{service.serviceName}</span>
                                {"children" in service && (
                                  <span className="service-item-combo-children">
                                    {service.children.map((c) => c.serviceName).join(", ")}
                                  </span>
                                )}
                              </div>
                              <span className="service-item-price">{service.finalPrice?.toLocaleString()}₫</span>
                            </div>
                          );
                        })}
                      </div>

                      {bookingItem.services.length === 0 && (
                        <p className="warning-text">⚠️ Vui lòng chọn ít nhất 1 dịch vụ</p>
                      )}

                      {/* Selected services for this hamster */}
                      {bookingItem.services.length > 0 && (
                        <div className="hamster-selected-services">
                          <strong>Đã chọn:</strong>
                          <div className="selected-chips">
                            {bookingItem.services.map((s, idx) => (
                              <span key={`selected-${s.id}-${idx}`} className="selected-chip">
                                {s.serviceName} - {s.finalPrice?.toLocaleString()}₫
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleServiceForHamster(h.id, s);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="hamster-subtotal">
                            Tổng phụ:{" "}
                            {bookingItem.services.reduce((acc, s) => acc + (s.finalPrice || 0), 0).toLocaleString()}₫
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {bookingItems.length > 0 && (
            <div className="booking-summary">
              <h4>📋 Tóm tắt đặt lịch:</h4>
              {bookingItems.map((item) => (
                <div key={item.hamsterId} className="summary-item">
                  <span className="summary-hamster">🐹 {item.hamster.name}:</span>
                  <span className="summary-services">
                    {item.services.length > 0
                      ? item.services.map((s) => s.serviceName).join(", ")
                      : "Chưa chọn dịch vụ"}
                  </span>
                  <span className="summary-price">
                    {item.services.reduce((acc, s) => acc + (s.finalPrice || 0), 0).toLocaleString()}₫
                  </span>
                </div>
              ))}
              <div className="summary-total">
                <span>Tổng cộng:</span>
                <span className="total-price">{totalPrice.toLocaleString()}₫</span>
              </div>
            </div>
          )}

          <div className="step-actions">
            <button className="btn-back" onClick={() => setStep(0)}>
              ← Quay lại
            </button>
            <button className="btn-next" disabled={!isBookingValid} onClick={() => setStep(2)}>
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Xác nhận */}
      {step === 2 && (
        <div className="step step3">
          <h2 className="step-title">Xác nhận thông tin</h2>

          <div className="confirm-box">
            <div className="confirm-section">
              {/* Booking items - each hamster with its services */}
              <div className="confirm-item">
                <div className="confirm-label">🐹 Chi tiết đặt lịch ({bookingItems.length} hamster)</div>
                <div className="confirm-value">
                  {bookingItems.map((item) => (
                    <div key={item.hamsterId} className="confirm-booking-item">
                      <div className="booking-item-header">
                        {item.hamster.imageUrl && (
                          <img src={item.hamster.imageUrl} alt={item.hamster.name} className="booking-item-avatar" />
                        )}
                        <span className="booking-item-name">{item.hamster.name}</span>
                      </div>
                      <ul className="booking-item-services">
                        {item.services.map((s, idx) => (
                          <li key={`${s.id}-${idx}`}>
                            {s.serviceName} - <strong>{s.finalPrice?.toLocaleString()}₫</strong>
                          </li>
                        ))}
                      </ul>
                      <div className="booking-item-subtotal">
                        Tổng phụ: {item.services.reduce((acc, s) => acc + (s.finalPrice || 0), 0).toLocaleString()}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirm-row">
                <div className="confirm-col">
                  <div className="confirm-item">
                    <div className="confirm-label">📅 Ngày hẹn</div>
                    <div className="confirm-value">{schDate ?? "-"}</div>
                  </div>
                </div>
                <div className="confirm-col">
                  <div className="confirm-item">
                    <div className="confirm-label">⏰ Giờ hẹn</div>
                    <div className="confirm-value">{schSlot ? `${schSlot.startTime} - ${schSlot.endTime}` : "-"}</div>
                  </div>
                </div>
              </div>

              <div className="confirm-item total-section">
                <div className="confirm-label">💰 Tổng tiền</div>
                <div className="confirm-value price-value">{totalPrice.toLocaleString()}₫</div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-back" onClick={() => setStep(1)}>
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
