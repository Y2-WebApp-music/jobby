export type SearchTypeCode = 0 | 1 | 2 | null;
export type SortTypeCode = 0 | 1 | 2;

export type SearchJobPayload = {
  user_id: string;
  search_text: string;
  search_type: SearchTypeCode;
  skill: string[];
  category: number[] | null;
  place: {
    province_id: number | null;
    district_id: number | null;
  };
  type: number[] | null;
  option: number[] | null;
  sort_type: SortTypeCode;
  page: number | null;
  limit: number | null;
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
  match_skill_count: number | null;
  status: number | null;
  is_viewed: boolean;
  applied: boolean;
  save: boolean;
};

export type SearchJobResponse = {
  job_result: SearchJobResult[];
  page: number | null;
  total_page: number | null;
  total_result?: number | null;
  total_count?: number | null;
};

export type FilterOptionItem = {
  id: number | null;
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
  province_code: number | null;
  district_code: number | null;
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
