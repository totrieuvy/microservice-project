import { create } from "zustand";

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

export const useScheduleStore = create<ScheduleStore>((set) => ({
  selectedDate: null,
  selectedSlot: null,
  selectedStaff: null,

  setDate: (d) => set({ selectedDate: d }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setStaff: (staff) => set({ selectedStaff: staff }),

  reset: () =>
    set({
      selectedDate: null,
      selectedSlot: null,
      selectedStaff: null,
    }),
}));
