import type { PhoneRegionProps } from "@/types/globalTypes";
import { create } from "zustand";

export type PhoneRegionOptionItem = {
  id: number;
  label: string;
};

type PropertiesState = {
  phoneRegions: PhoneRegionProps[];
};

type PropertiesActions = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setPhoneRegions: (phoneRegions: PhoneRegionProps[]) => void;
  getPhoneRegionOptions: () => PhoneRegionOptionItem[];
};

const store = create<PropertiesState & PropertiesActions>((set, get) => ({
  phoneRegions: [],
  loading: false,

  setLoading: (loading) => set({ loading }),
  setPhoneRegions: (phoneRegions) => set({ phoneRegions }),

  getPhoneRegionOptions: () =>
    get().phoneRegions.map((r) => ({
      id: r.id,
      label: r.label,
    })),
}));

export const usePropertiesStore = Object.assign(store, {
  getLoading: () => store.getState().loading,
  setLoading: (loading: boolean) => store.getState().setLoading(loading),
  setPhoneRegions: (phoneRegions: PhoneRegionProps[]) =>
    store.getState().setPhoneRegions(phoneRegions),
  getPhoneRegionOptions: () => store.getState().getPhoneRegionOptions(),
});
