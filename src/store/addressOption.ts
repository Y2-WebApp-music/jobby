import type {
  DistrictProps,
  ProvinceProps,
  SubDistrictProps,
} from "@/types/globalTypes";
import { create } from "zustand";

export type AddressOptionItem = {
  id: number;
  value: string;
};

type AddressOptionState = {
  provinces: ProvinceProps[];
  districts: DistrictProps[];
  subDistrictsByDistrict: Record<number, SubDistrictProps[]>;
  postalCodesBySubDistrict: Record<number, number[]>;
};

type AddressOptionActions = {
  setProvinces: (provinces: ProvinceProps[]) => void;
  setDistricts: (districts: DistrictProps[]) => void;
  setSubDistricts: (
    districtId: number,
    subDistricts: SubDistrictProps[],
  ) => void;
  setPostalCodes: (subDistrictId: number, postalCodes: number[]) => void;
  getProvinceOptions: () => AddressOptionItem[];
  getDistrictOptions: (provinceId?: number) => AddressOptionItem[];
  getSubDistrictOptions: (districtId: number) => AddressOptionItem[];
  getPostalCodeOptions: (subDistrictId: number) => AddressOptionItem[];
  getPostalCode: (
    districtId: number,
    subDistrictId: number,
  ) => number | undefined;
};

const store = create<AddressOptionState & AddressOptionActions>((set, get) => ({
  provinces: [],
  districts: [],
  subDistrictsByDistrict: {},
  postalCodesBySubDistrict: {},

  setProvinces: (provinces) => set({ provinces }),
  setDistricts: (districts) => set({ districts }),
  setSubDistricts: (districtId, subDistricts) =>
    set((state) => ({
      subDistrictsByDistrict: {
        ...state.subDistrictsByDistrict,
        [districtId]: subDistricts,
      },
      districts: state.districts.map((district) =>
        district.district_id === districtId
          ? { ...district, sub_district_list: subDistricts }
          : district,
      ),
    })),
  setPostalCodes: (subDistrictId, postalCodes) =>
    set((state) => ({
      postalCodesBySubDistrict: {
        ...state.postalCodesBySubDistrict,
        [subDistrictId]: postalCodes,
      },
      subDistrictsByDistrict: Object.fromEntries(
        Object.entries(state.subDistrictsByDistrict).map(
          ([districtId, subDistricts]) => [
            districtId,
            subDistricts.map((subDistrict) =>
              subDistrict.sub_district_id === subDistrictId
                ? {
                    ...subDistrict,
                    postal_code: postalCodes[0],
                  }
                : subDistrict,
            ),
          ],
        ),
      ) as Record<number, SubDistrictProps[]>,
    })),

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
    return districts
      .filter((d) => d.province_id === provinceId)
      .map((d) => ({ id: d.district_id, value: d.district_eng }));
  },

  getSubDistrictOptions: (districtId) => {
    const subDistricts =
      get().subDistrictsByDistrict[districtId] ??
      get().districts.find((d) => d.district_id === districtId)
        ?.sub_district_list ??
      [];
    return subDistricts.map((s) => ({
      id: s.sub_district_id,
      value: s.sub_district_eng,
    }));
  },

  getPostalCodeOptions: (subDistrictId) =>
    (get().postalCodesBySubDistrict[subDistrictId] ?? []).map((postalCode) => ({
      id: postalCode,
      value: String(postalCode),
    })),

  getPostalCode: (_districtId, subDistrictId) => {
    const directPostalCode = get().postalCodesBySubDistrict[subDistrictId]?.[0];
    if (directPostalCode) return directPostalCode;

    for (const subDistricts of Object.values(get().subDistrictsByDistrict)) {
      const matched = subDistricts.find(
        (item) => item.sub_district_id === subDistrictId,
      );
      if (matched?.postal_code) return matched.postal_code;
    }

    return undefined;
  },
}));

export const useAddressOptionStore = Object.assign(store, {
  setProvinces: (provinces: ProvinceProps[]) =>
    store.getState().setProvinces(provinces),
  setDistricts: (districts: DistrictProps[]) =>
    store.getState().setDistricts(districts),
  setSubDistricts: (districtId: number, subDistricts: SubDistrictProps[]) =>
    store.getState().setSubDistricts(districtId, subDistricts),
  setPostalCodes: (subDistrictId: number, postalCodes: number[]) =>
    store.getState().setPostalCodes(subDistrictId, postalCodes),
  getProvinceOptions: () => store.getState().getProvinceOptions(),
  getDistrictOptions: (provinceId?: number) =>
    store.getState().getDistrictOptions(provinceId),
  getSubDistrictOptions: (districtId: number) =>
    store.getState().getSubDistrictOptions(districtId),
  getPostalCodeOptions: (subDistrictId: number) =>
    store.getState().getPostalCodeOptions(subDistrictId),
  getPostalCode: (districtId: number, subDistrictId: number) =>
    store.getState().getPostalCode(districtId, subDistrictId),
});
