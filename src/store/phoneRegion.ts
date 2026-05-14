import utilityService, {
  type UtilityPhoneRegionItem,
} from "@/services/utilityService";
import { create } from "zustand";

export type PhoneRegionMetadata = {
  dialCode: string;
  countryTh: string;
  countryEng: string;
  countryId: number;
};

type PhoneRegionState = {
  phoneRegions: UtilityPhoneRegionItem[];
  loading: boolean;
};

type PhoneRegionActions = {
  setPhoneRegions: (phoneRegions: UtilityPhoneRegionItem[]) => void;
  setLoading: (loading: boolean) => void;
  fetchPhoneRegions: () => Promise<UtilityPhoneRegionItem[]>;
  getRegionMetadata: (regionCode: string) => Promise<PhoneRegionMetadata>;
};

const normalizeDialCode = (value: string) => value.replace(/\D/g, "");

const toMetadata = (item: UtilityPhoneRegionItem): PhoneRegionMetadata => ({
  dialCode: normalizeDialCode(item.dialing_code),
  countryTh: item.text_th?.trim() || "",
  countryEng: item.text_eng?.trim() || "",
  countryId: item.id,
});

const store = create<PhoneRegionState & PhoneRegionActions>((set, get) => ({
  phoneRegions: [],
  loading: false,

  setPhoneRegions: (phoneRegions) => set({ phoneRegions }),
  setLoading: (loading) => set({ loading }),

  fetchPhoneRegions: async () => {
    const existing = get().phoneRegions;
    if (existing.length > 0) return existing;

    set({ loading: true });
    try {
      const response = await utilityService.getPhoneRegion();
      const data = response.data ?? [];
      set({ phoneRegions: data });
      return data;
    } finally {
      set({ loading: false });
    }
  },

  getRegionMetadata: async (regionCode) => {
    const normalizedRegionCode = regionCode.trim().toLowerCase();
    const regions =
      get().phoneRegions.length > 0
        ? get().phoneRegions
        : await get().fetchPhoneRegions();
    if (regions.length === 0) {
      throw new Error("Phone region data unavailable");
    }

    const preferredDialCode = normalizeDialCode(normalizedRegionCode);

    const matchedByDial = regions.find(
      (item) => normalizeDialCode(item.dialing_code) === preferredDialCode,
    );
    if (matchedByDial) {
      return toMetadata(matchedByDial);
    }

    const matchedByName = regions.find((item) => {
      const textEng = item.text_eng?.toLowerCase() ?? "";
      const textTh = item.text_th?.toLowerCase() ?? "";
      return (
        textEng === normalizedRegionCode ||
        textEng.includes(normalizedRegionCode) ||
        textTh.includes(normalizedRegionCode)
      );
    });
    if (matchedByName) {
      return toMetadata(matchedByName);
    }

    return toMetadata(regions[0]);
  },
}));

export const usePhoneRegionStore = Object.assign(store, {
  getPhoneRegions: () => store.getState().phoneRegions,
  fetchPhoneRegions: () => store.getState().fetchPhoneRegions(),
  getRegionMetadata: (regionCode: string) =>
    store.getState().getRegionMetadata(regionCode),
});
