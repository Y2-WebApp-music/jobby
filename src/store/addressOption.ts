import type { DistrictProps, ProvinceProps } from "@/types/globalTypes";
import { create } from "zustand";

export type AddressOptionItem = {
  id: number;
  value: string;
};

type AddressOptionState = {
  provinces: ProvinceProps[];
  districts: DistrictProps[];
};

type AddressOptionActions = {
  setProvinces: (provinces: ProvinceProps[]) => void;
  setDistricts: (districts: DistrictProps[]) => void;
  getProvinceOptions: () => AddressOptionItem[];
  getDistrictOptions: (provinceId?: number) => AddressOptionItem[];
  getSubDistrictOptions: (districtId: number) => AddressOptionItem[];
  getPostalCode: (
    districtId: number,
    subDistrictId: number,
  ) => number | undefined;
};

const store = create<AddressOptionState & AddressOptionActions>((set, get) => ({
  provinces: [],
  districts: [],

  setProvinces: (provinces) => set({ provinces }),
  setDistricts: (districts) => set({ districts }),

  getProvinceOptions: () =>
    get().provinces.map((p) => ({
      id: p.province_id,
      value: p.province_eng,
    })),

  getDistrictOptions: (provinceId) => {
    const districts = get().districts;
    if (provinceId == null) {
      return districts.map((d) => ({
        id: d.district_id,
        value: d.district_eng,
      }));
    }
    return districts.map((d) => ({ id: d.district_id, value: d.district_eng }));
  },

  getSubDistrictOptions: (districtId) => {
    const district = get().districts.find((d) => d.district_id === districtId);
    if (!district?.sub_district_list) return [];
    return district.sub_district_list.map((s) => ({
      id: s.sub_district_id,
      value: s.sub_district_eng,
    }));
  },

  getPostalCode: (districtId, subDistrictId) => {
    const district = get().districts.find((d) => d.district_id === districtId);
    const sub = district?.sub_district_list?.find(
      (s) => s.sub_district_id === subDistrictId,
    );
    return sub?.postal_code;
  },
}));

export const useAddressOptionStore = Object.assign(store, {
  setProvinces: (provinces: ProvinceProps[]) =>
    store.getState().setProvinces(provinces),
  setDistricts: (districts: DistrictProps[]) =>
    store.getState().setDistricts(districts),
  getProvinceOptions: () => store.getState().getProvinceOptions(),
  getDistrictOptions: (provinceId?: number) =>
    store.getState().getDistrictOptions(provinceId),
  getSubDistrictOptions: (districtId: number) =>
    store.getState().getSubDistrictOptions(districtId),
  getPostalCode: (districtId: number, subDistrictId: number) =>
    store.getState().getPostalCode(districtId, subDistrictId),
});
