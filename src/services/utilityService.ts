import apiService from "./apiService";

export type UtilityPhoneRegionItem = {
  id: number;
  dialing_code: string;
  text_th: string;
  text_eng: string;
};

export type UtilityCountryItem = {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
};

export type UtilityProvinceItem = {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
};

export type UtilityDistrictItem = {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
};

export type UtilitySubDistrictItem = {
  sub_district_code: number;
  sub_district_name_th: string;
  sub_district_name_en: string;
  district_id: number;
};

export type UtilityPostalCodeItem = {
  id: number;
  postal_code: string;
  sub_district_id: number;
};

export type GetPhoneRegionResponse = UtilityPhoneRegionItem[];
export type GetProvinceResponse = UtilityProvinceItem[];

export type GetDistrictResponse = UtilityProvinceItem & {
  country: UtilityCountryItem | null;
  districts: UtilityDistrictItem[];
};

export type GetSubDistrictResponse = UtilityDistrictItem & {
  province: UtilityProvinceItem | null;
  sub_districts: UtilitySubDistrictItem[];
};

export type GetPostalCodeResponse = UtilityPostalCodeItem[];

export const UTILITY_ENDPOINT = "/utility";

export const getPhoneRegion = () => {
  return apiService.fetchData<GetPhoneRegionResponse>({
    url: `${UTILITY_ENDPOINT}/phone-region`,
    method: "get",
  });
};

export const getProvince = () => {
  return apiService.fetchData<GetProvinceResponse>({
    url: `${UTILITY_ENDPOINT}/province`,
    method: "get",
  });
};

export const getDistrict = (provinceCode: number | string) => {
  return apiService.fetchData<GetDistrictResponse>({
    url: `${UTILITY_ENDPOINT}/district/${encodeURIComponent(String(provinceCode))}`,
    method: "get",
  });
};

export const getSubDistrict = (districtCode: number | string) => {
  return apiService.fetchData<GetSubDistrictResponse>({
    url: `${UTILITY_ENDPOINT}/sub-district/${encodeURIComponent(String(districtCode))}`,
    method: "get",
  });
};

export const getPostalCode = (subDistrictId: number | string) => {
  return apiService.fetchData<GetPostalCodeResponse>({
    url: `${UTILITY_ENDPOINT}/postal_code/${encodeURIComponent(String(subDistrictId))}`,
    method: "get",
  });
};

const utilityService = {
  getDistrict,
  getPhoneRegion,
  getPostalCode,
  getProvince,
  getSubDistrict,
};

export default utilityService;
