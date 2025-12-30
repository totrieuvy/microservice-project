import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Staff {
  name: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  availableSlot: number;
  staffs: Staff[];
}

interface ScheduleStore {
  selectedDate: string | null;
  selectedSlot: Slot | null;
  selectedStaff: Staff | null;

  setDate: (d: string) => void;
  setSlot: (s: Slot) => void;
  setStaff: (s: Staff) => void;

  reset: () => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  devtools<ScheduleStore>(
    (set) => ({
      selectedDate: null,
      selectedSlot: null,
      selectedStaff: null,

      setDate: (d) => set({ selectedDate: d }, false, "schedule/setDate"),
      setSlot: (slot) => set({ selectedSlot: slot }, false, "schedule/setSlot"),
      setStaff: (staff) => set({ selectedStaff: staff }, false, "schedule/setStaff"),

      reset: () =>
        set(
          {
            selectedDate: null,
            selectedSlot: null,
            selectedStaff: null,
          },
          false,
          "schedule/reset"
        ),
    }),
    {
      name: "schedule-store", // 👈 tên hiển thị trong Redux DevTools
    }
  )
);
