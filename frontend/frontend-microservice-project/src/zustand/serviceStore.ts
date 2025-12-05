import { create } from "zustand";

interface SingleService {
  id: number;
  serviceName: string;
  finalPrice: number;
}

interface ComboService {
  id: number;
  serviceName: string;
  finalPrice: number;
}

interface ServiceStore {
  selectedSingle: SingleService | null;
  selectedCombo: ComboService | null;

  setSingle: (s: SingleService) => void;
  setCombo: (c: ComboService) => void;

  reset: () => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  selectedSingle: null,
  selectedCombo: null,

  setSingle: (s) => set({ selectedSingle: s, selectedCombo: null }),
  setCombo: (c) => set({ selectedCombo: c, selectedSingle: null }),

  reset: () => set({ selectedSingle: null, selectedCombo: null }),
}));
