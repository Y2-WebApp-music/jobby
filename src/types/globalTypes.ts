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
  sub_district_th?: string;
  sub_district_eng?: string;
  district: string;
  district_th?: string;
  district_eng?: string;
  province: string;
  province_th?: string;
  province_eng?: string;
  country: string;
  country_th?: string;
  country_eng?: string;
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
  country_id?: number;
};

export type DistrictProps = {
  district_id: number;
  district_th: string;
  district_eng: string;
  province_id: number;
  sub_district_list?: SubDistrictProps[];
};

export type SubDistrictProps = {
  sub_district_id: number;
  sub_district_th: string;
  sub_district_eng: string;
  district_id: number;
  postal_code?: number;
};

export type PhoneRegionProps = {
  id: number;
  label: string;
  text_th?: string;
  text_eng?: string;
};
