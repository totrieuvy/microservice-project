import { create } from "zustand";

interface Hamster {
  id: number;
  name: string;
  imageUrl: string;
}

interface HamsterStore {
  hamster: Hamster | null;
  setHamster: (h: Hamster) => void;
  reset: () => void;
}

export const useHamsterStore = create<HamsterStore>((set) => ({
  hamster: null,
  setHamster: (h) => set({ hamster: h }),
  reset: () => set({ hamster: null }),
}));
