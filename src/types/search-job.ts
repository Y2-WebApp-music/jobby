export type SearchTypeCode = 0 | 1 | 2;
export type SortTypeCode = 0 | 1 | 2;

export type SearchJobPayload = {
  user_id: string;
  search_text: string;
  search_type: SearchTypeCode;
  skill: string[];
  category: number[];
  place: {
    province_id: number;
    district_id: number;
  };
  type: number[];
  option: number[];
  sort_type: SortTypeCode;
  page: number;
  limit: number;
};

export type SearchJobResult = {
  node_id: string;
  id: string;
  name: string;
  company: {
    id: string;
    name: string;
    logo: string;
  };
  province_name: string;
  district_name: string;
  created_at: string;
  match_skill_count: number;
  status: number;
  is_viewed: boolean;
};

export type SearchJobResponse = {
  job_result: SearchJobResult[];
  page: number;
  total_page: number;
};

export type FilterOptionItem = {
  id: number;
  text_th: string;
  text_eng: string;
};

export type SearchFilterOptionsResponse = {
  category: FilterOptionItem[];
  work_type: FilterOptionItem[];
  work_option: FilterOptionItem[];
};

export type PlaceSearchItem = {
  province_name: string;
  district_name: string;
  province_code: number;
  district_code: number;
};

export type PlaceSearchResponse = {
  search_result: PlaceSearchItem[];
};

export type SearchSuggestItem = {
  type: "job" | "skill";
  id: string;
  name: string;
};

export type SearchSuggestResponse = {
  search_result: SearchSuggestItem[];
};
