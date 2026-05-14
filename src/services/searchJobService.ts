import type { ResumeListItem } from "@/types/resumeType";
import type {
  PlaceSearchResponse,
  SearchFilterOptionsResponse,
  SearchJobPayload,
  SearchJobResponse,
  SearchSuggestResponse,
  SearchTypeCode,
} from "@/types/search-job";
import type { SuccessResponse } from "@/types/apiServiceTypes";
import type { ApplyDialogJob, ApplyPayload } from "@/types/searchJob";
import apiService from "./apiService";

export type SearchJobLookupLabel = {
  text_th: string;
  text_eng: string;
};

export type SearchJobLookupCountry = {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
};

export type SearchJobLookupProvince = {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
};

export type SearchJobLookupDistrict = {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
};

export type SearchJobSkillItem = {
  eid: string;
  name: string;
};

export type SearchJobDetailResponse = {
  id: string;
  eid: string;
  status: number;
  created_at: string;
  name: string;
  description: string | null;
  description_rtf: string | null;
  start_apply: string | null;
  end_apply: string | null;
  cover_letter: boolean;
  work_experience: boolean;
  education: boolean;
  address_line: string | null;
  no: string | null;
  moo: string | null;
  soi: string | null;
  street: string | null;
  company_id: string;
  sub_district_code: number | null;
  district_code: number | null;
  province_code: number | null;
  country_code: number | null;
  postal_code: string | null;
  country: SearchJobLookupCountry | null;
  province: SearchJobLookupProvince | null;
  district: SearchJobLookupDistrict | null;
  sub_district: unknown | null;
  postal_code_ref: unknown | null;
  categories: SearchJobLookupLabel[];
  skills: {
    index: number;
    skill_id: string;
    skill_name: string;
  }[];
  work_options: SearchJobLookupLabel[];
  work_types: SearchJobLookupLabel[];
  applied: boolean;
  save: boolean;
  is_viewed: boolean;
};

export type SearchAddressOptionsParams = {
  search_text: string;
  search_type?: string;
  limit?: number;
};

export type SearchNameOptionsParams = {
  search_text: string;
  search_type?: SearchTypeCode | string;
};

export type SearchJobApplyNeedQuestionOption = {
  id: number;
  label: string;
};

export type SearchJobApplyNeedQuestion = {
  id: number;
  type: number;
  question: string;
  options: SearchJobApplyNeedQuestionOption[];
  max_select: number;
};

export type SearchJobApplyNeedFile = {
  id: number;
  type: number;
  label: string;
  description: string;
};

export type SearchJobApplyNeedResponse = {
  id: string;
  first_name: string;
  last_name: string;
  logo: string;
  phone: string;
  email: string;
  has_cover_letter: boolean;
  addition_questions: SearchJobApplyNeedQuestion[];
  addition_file: SearchJobApplyNeedFile[];
};

export type SearchJobUserResumeItem = {
  id: string;
  name: string;
  create_date: string;
  theme: number;
  color: number;
  first_name: string;
  last_name: string;
  logo: string;
  email: string;
  phone: string;
  phone_region: string;
  user_id: string;
};

export type SearchJobUserResumeListResponse = SearchJobUserResumeItem[];
export type SearchJobApplyResponse = Record<string, unknown>;
export type SaveJobResponse = Record<string, unknown>;
export type UnsaveJobResponse = Record<string, unknown>;
export type ViewedJobResponse = Record<string, unknown>;

export const SEARCH_ENDPOINT = "/search";
export const SEARCH_JOB_ENDPOINT = "/search/job";
export const SEARCH_JOB_USER_ENDPOINT = "/search/user";

const emptySearchFilterOptions: SearchFilterOptionsResponse = {
  category: [],
  work_type: [],
  work_option: [],
};

const emptyPlaceSearchResponse: PlaceSearchResponse = {
  search_result: [],
};

const emptySearchSuggestResponse: SearchSuggestResponse = {
  search_result: [],
};

const emptySearchJobResponse: SearchJobResponse = {
  job_result: [],
  page: 0,
  total_page: 0,
  total_result: 0,
  total_count: 0,
};

const buildSearchJobPayload = (payload: SearchJobPayload) => {
  const trimmedUserId = payload.user_id.trim();

  return {
    ...(trimmedUserId ? { user_id: trimmedUserId } : {}),
    search_text: payload.search_text,
    search_type: payload.search_type,
    skill: payload.skill,
    category: payload.category,
    place: payload.place,
    type: payload.type,
    option: payload.option,
    sort_type: payload.sort_type,
    page: payload.page,
    limit: payload.limit,
  };
};

const normalizeSearchTypeParam = (searchType?: SearchTypeCode | string) => {
  if (searchType === 1 || searchType === "skill") return "skill";
  if (searchType === 2 || searchType === "job") return "job";
  return "any";
};

const withDefaultData = <T>(
  response: SuccessResponse<T | undefined>,
  fallback: T,
): SuccessResponse<T> => ({
  ...response,
  data: response.data ?? fallback,
});

export const getSearchFilterOptions = () => {
  return apiService
    .fetchData<SearchFilterOptionsResponse | undefined>({
      url: `${SEARCH_ENDPOINT}/filter-options`,
      method: "get",
    })
    .then((response) => withDefaultData(response, emptySearchFilterOptions));
};

export const getSearchAddressOptions = (params: SearchAddressOptionsParams) => {
  return apiService
    .fetchData<PlaceSearchResponse | undefined>({
      url: `${SEARCH_ENDPOINT}/address-options`,
      method: "get",
      params: {
        search_text: params.search_text,
        search_type: params.search_type ?? "any",
        ...(typeof params.limit === "number" ? { limit: params.limit } : {}),
      },
    })
    .then((response) => withDefaultData(response, emptyPlaceSearchResponse));
};

export const getSearchNameOptions = (params: SearchNameOptionsParams) => {
  return apiService
    .fetchData<SearchSuggestResponse | undefined>({
      url: `${SEARCH_ENDPOINT}/options`,
      method: "get",
      params: {
        search_text: params.search_text,
        search_type: normalizeSearchTypeParam(params.search_type),
      },
    })
    .then((response) => withDefaultData(response, emptySearchSuggestResponse));
};

export const searchJobs = (payload: SearchJobPayload) => {
  return apiService
    .fetchData<SearchJobResponse | undefined>({
      url: SEARCH_JOB_ENDPOINT,
      method: "post",
      data: buildSearchJobPayload(payload),
    })
    .then((response) => withDefaultData(response, emptySearchJobResponse));
};

export const getSearchJobDetail = (jobId: string, user_id: string) => {
  return apiService.fetchData<SearchJobDetailResponse>({
    url: `${SEARCH_JOB_ENDPOINT}/${encodeURIComponent(jobId)}?user_id=${user_id}`,
    method: "get",
  });
};

export const getApplyNeed = (userId: string, jobId: string) => {
  return apiService.fetchData<SearchJobApplyNeedResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/apply-detail-need/${encodeURIComponent(jobId)}`,
    method: "get",
  });
};

export const getUserResumesForSearchJob = (userId: string) => {
  return apiService.fetchData<SearchJobUserResumeListResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/resumes`,
    method: "get",
  });
};

export const saveJob = (userId: string, jobId: string) => {
  return apiService.fetchData<SaveJobResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/save-job/${encodeURIComponent(jobId)}`,
    method: "post",
  });
};

export const unsaveJob = (userId: string, jobId: string) => {
  return apiService.fetchData<UnsaveJobResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/save-job/${encodeURIComponent(jobId)}`,
    method: "delete",
  });
};

export const viewedJob = (userId: string, jobId: string) => {
  return apiService.fetchData<ViewedJobResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/viewed-job/${encodeURIComponent(jobId)}`,
    method: "post",
  });
};

export const mapApplyNeedToDialogJob = (
  detail: SearchJobApplyNeedResponse,
  jobMeta: {
    jobId: string;
    companyName: string;
    jobTitle: string;
  },
): ApplyDialogJob => ({
  id: jobMeta.jobId,
  company_name: jobMeta.companyName,
  job_title: jobMeta.jobTitle,
  first_name: detail.first_name,
  last_name: detail.last_name,
  logo: detail.logo,
  email: detail.email,
  phone: detail.phone,
  has_cover_letter: detail.has_cover_letter,
  addition_questions: detail.addition_questions ?? [],
  addition_file: detail.addition_file ?? [],
});

export const createApplyPayloadFromNeed = (
  detail: SearchJobApplyNeedResponse,
): ApplyPayload => ({
  email: detail.email ?? "",
  phone: detail.phone ?? "",
  resume_id: "",
  resume_file: null,
  cover_letter: null,
  questions: [],
  addition_file: [],
});

export const mapSearchJobResumeToResumeListItem = (
  resume: SearchJobUserResumeItem,
): ResumeListItem => ({
  id: resume.id,
  name: resume.name,
  create_date: resume.create_date,
});

const buildApplyJobFormData = (payload: ApplyPayload) => {
  const formData = new FormData();

  if (payload.resume_id.trim()) {
    formData.append("resume_id", payload.resume_id.trim());
  }

  formData.append("questions", JSON.stringify(payload.questions));

  const additionFileDescriptors = payload.addition_file
    .filter(
      (item): item is typeof item & { data: File } => item.data instanceof File,
    )
    .map((item) => {
      const fieldName = `addition_file_${item.id}`;
      formData.append(fieldName, item.data);

      return {
        id: item.id,
        field_name: fieldName,
        file_name: item.data.name,
      };
    });

  formData.append("addition_file", JSON.stringify(additionFileDescriptors));

  if (payload.resume_file instanceof File) {
    formData.append("resume", payload.resume_file);
  }

  if (payload.cover_letter instanceof File) {
    formData.append("cover_letter", payload.cover_letter);
  }

  return formData;
};

export const applyJob = (
  userId: string,
  jobId: string,
  payload: ApplyPayload,
) => {
  return apiService.fetchData<SearchJobApplyResponse>({
    url: `${SEARCH_JOB_USER_ENDPOINT}/${encodeURIComponent(userId)}/apply-job/${encodeURIComponent(jobId)}`,
    method: "post",
    data: buildApplyJobFormData(payload),
  });
};

const searchJobService = {
  applyJob,
  createApplyPayloadFromNeed,
  getApplyNeed,
  getSearchAddressOptions,
  getSearchFilterOptions,
  getSearchJobDetail,
  getSearchNameOptions,
  getUserResumesForSearchJob,
  mapApplyNeedToDialogJob,
  mapSearchJobResumeToResumeListItem,
  searchJobs,
  saveJob,
  unsaveJob,
  viewedJob,
};

export default searchJobService;
