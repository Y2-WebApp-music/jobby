export type SkillProps = {
  id: string;
  name: string;
};

export type AddressProps = {
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district: string;
  district: string;
  province: string;
  country: string;
  sub_district_id?: number;
  district_id?: number;
  province_id?: number;
  country_id?: number;
  postal_code?: number;
};

export type ProvinceProps = {
  province_id: number;
  province_th: string;
  province_eng: string;
};

export type DistrictProps = {
  district_id: number;
  district_th: string;
  district_eng: string;
  sub_district_list: SubDistrictProps[];
};

export type SubDistrictProps = {
  sub_district_id: number;
  sub_district_th: string;
  sub_district_eng: string;
  postal_code: number;
};

export type PhoneRegionProps = {
  id: number;
  label: string;
};
