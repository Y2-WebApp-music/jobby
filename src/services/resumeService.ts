import type { ResumeCreateProps } from "@/types/resumeType";
import type { AxiosResponse } from "axios";
import apiService from "./apiService";
import httpClient from "./httpClientService";

export type UserResumeListItem = {
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

export type ResumeDetailCountry = {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
};

export type ResumeDetailProvince = {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
};

export type ResumeDetailDistrict = {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
};

export type ResumeDetailSubDistrict = {
  sub_district_code: number;
  sub_district_name_th: string;
  sub_district_name_en: string;
  district_id: number;
};

export type ResumeDetailContactItem = {
  id: string;
  index: number;
  resume_id: string;
  label: string;
  link: string;
};

export type ResumeDetailEducationItem = {
  id: string;
  index: number;
  resume_id: string;
  school_name: string;
  logo: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  gpax: string;
};

export type ResumeDetailWorkExperienceItem = {
  id: string;
  index: number;
  resume_id: string;
  position: string;
  logo: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
  work_type: string;
  work_type_id: number;
};

export type ResumeDetailProjectItem = {
  id: string;
  index: number;
  resume_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
};

export type ResumeDetailAchievementItem = {
  id: string;
  index: number;
  resume_id: string;
  name: string;
  project_name: string;
  description: string;
  date: string;
};

export type ResumeDetailSkillItem = {
  id: string;
  index: number;
  resume_id: string;
  skill_id: string;
  skill_name: string;
};

export type ResumeDetailResponse = {
  id: string;
  name: string;
  create_date: string;
  theme: number;
  color: number;
  user_id: string;
  first_name: string;
  last_name: string;
  logo: string;
  email: string;
  phone: string;
  phone_region: string;
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_id: number;
  district_id: number;
  province_id: number;
  country_id: number;
  postal_code_id: number | null;
  country: ResumeDetailCountry | null;
  province: ResumeDetailProvince | null;
  district: ResumeDetailDistrict | null;
  sub_district: ResumeDetailSubDistrict | null;
  postal_code: { postal_code: number } | null;
  contacts: ResumeDetailContactItem[];
  educations: ResumeDetailEducationItem[];
  work_experiences: ResumeDetailWorkExperienceItem[];
  projects: ResumeDetailProjectItem[];
  achievements: ResumeDetailAchievementItem[];
  skills: ResumeDetailSkillItem[];
};

export type GetUserResumeListResponse = UserResumeListItem[];

export type CreateResumeAddressPayload = {
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_th: string;
  sub_district_eng: string;
  district_th: string;
  district_eng: string;
  province_th: string;
  province_eng: string;
  country_th: string;
  country_eng: string;
  sub_district_id: number;
  district_id: number;
  province_id: number;
  country_id: number;
  postal_code: number;
};

export type CreateResumeContactPayload = {
  label: string;
  link: string;
};

export type CreateResumeSkillPayload = {
  id: string;
  name: string;
};

export type CreateResumeEducationPayload = {
  id: string;
  school_name: string;
  logo: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpax: string;
};

export type CreateResumeWorkExperiencePayload = {
  id: string;
  position: string;
  logo: string;
  company_name: string;
  start_date: string;
  end_date: string;
  work_type: string;
  work_type_id: number;
  skills: CreateResumeSkillPayload[];
};

export type CreateResumeProjectPayload = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  skills: CreateResumeSkillPayload[];
};

export type CreateResumeAchievementPayload = {
  id: string;
  name: string;
  project_name: string;
  description: string;
  date: string;
  skills: CreateResumeSkillPayload[];
};

export type CreateResumePayload = {
  theme: number;
  color: number;
  name: string;
  first_name: string;
  last_name: string;
  logo: string;
  email: string;
  phone: string;
  phone_region: string;
  address: CreateResumeAddressPayload;
  contact: CreateResumeContactPayload[];
  skills: CreateResumeSkillPayload[];
  education: CreateResumeEducationPayload[];
  work_experience: CreateResumeWorkExperiencePayload[];
  projects: CreateResumeProjectPayload[];
  achievement: CreateResumeAchievementPayload[];
};

export type CreateResumeResponse = Record<string, unknown>;
export type UpdateResumeResponse = Record<string, unknown>;
export type UploadResumeFileResponse = Record<string, unknown>;

export type ExportResumeResponse = {
  blob: Blob;
  contentType: string;
  filename: string;
};

export const RESUME_ENDPOINT = "/resume/user";
export const RESUME_DETAIL_ENDPOINT = "/resume";

const getHeaderString = (header: unknown): string | undefined => {
  if (typeof header === "string") return header;
  if (Array.isArray(header))
    return typeof header[0] === "string" ? header[0] : undefined;
  return undefined;
};

const parseContentDispositionFilename = (header: unknown) => {
  const headerValue = getHeaderString(header);
  if (!headerValue) return "";

  const utfMatch = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const basicMatch = headerValue.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? "";
};

export const mapResumeDetailToResumeForm = (
  detail: ResumeDetailResponse,
): ResumeCreateProps => ({
  id: detail.id,
  name: detail.name,
  create_date: detail.create_date,
  theme: detail.theme,
  color: detail.color,
  data: {
    first_name: detail.first_name,
    last_name: detail.last_name,
    logo: detail.logo ?? "",
    phone: detail.phone,
    phone_region: detail.phone_region,
    email: detail.email,
    contact: detail.contacts.map((item) => ({
      label: item.label,
      link: item.link,
    })),
    skills: detail.skills.map((item) => ({
      id: item.skill_id,
      name: item.skill_name,
    })),
    address: {
      address_line: detail.address_line,
      no: detail.no,
      moo: detail.moo,
      soi: detail.soi,
      street: detail.street,
      sub_district: detail.sub_district?.sub_district_name_en ?? "",
      sub_district_th: detail.sub_district?.sub_district_name_th ?? "",
      sub_district_eng: detail.sub_district?.sub_district_name_en ?? "",
      district: detail.district?.district_name_en ?? "",
      district_th: detail.district?.district_name_th ?? "",
      district_eng: detail.district?.district_name_en ?? "",
      province: detail.province?.province_name_en ?? "",
      province_th: detail.province?.province_name_th ?? "",
      province_eng: detail.province?.province_name_en ?? "",
      country: detail.country?.country_name_en ?? "",
      country_th: detail.country?.country_name_th ?? "",
      country_eng: detail.country?.country_name_en ?? "",
      sub_district_id: detail.sub_district_id,
      district_id: detail.district_id,
      province_id: detail.province_id,
      country_id: detail.country_id,
      postal_code: detail.postal_code?.postal_code ?? 0,
    },
    education: detail.educations.map((item) => ({
      id: item.id,
      school_name: item.school_name,
      logo: item.logo ?? "",
      degree: item.degree,
      field_of_study: item.field_of_study,
      start_date: item.start_date,
      end_date: item.end_date ?? "",
      gpax: Number(item.gpax || 0),
    })),
    work_experience: detail.work_experiences.map((item) => ({
      id: item.id,
      position: item.position,
      logo: item.logo ?? "",
      company_name: item.company_name,
      start_date: item.start_date,
      end_Date: item.end_date ?? "",
      skills: [],
      work_type: item.work_type,
      work_type_id: item.work_type_id,
    })),
    projects: detail.projects.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      start_date: item.start_date,
      end_date: item.end_date ?? "",
      skills: [],
      images: [],
    })),
    achievement: detail.achievements.map((item) => ({
      id: item.id,
      name: item.name,
      project_name: item.project_name,
      description: item.description,
      date: item.date,
      skills: [],
      images: [],
    })),
    miscellaneous: [],
  },
});

export const getUserResumeList = (userId: string) => {
  return apiService.fetchData<GetUserResumeListResponse>({
    url: `${RESUME_ENDPOINT}/${encodeURIComponent(userId)}`,
    method: "get",
  });
};

export const getResumeDetail = (resumeId: string) => {
  return apiService.fetchData<ResumeDetailResponse>({
    url: `${RESUME_DETAIL_ENDPOINT}/${encodeURIComponent(resumeId)}`,
    method: "get",
  });
};

export const createUserResume = (userId: string, data: CreateResumePayload) => {
  return apiService.fetchData<CreateResumeResponse>({
    url: `${RESUME_ENDPOINT}/${encodeURIComponent(userId)}`,
    method: "post",
    data,
  });
};

export const updateUserResume = (
  userId: string,
  resumeId: string,
  data: CreateResumePayload,
) => {
  return apiService.fetchData<UpdateResumeResponse>({
    url: `${RESUME_ENDPOINT}/${encodeURIComponent(userId)}/${encodeURIComponent(resumeId)}`,
    method: "patch",
    data,
  });
};

export const uploadUserResumeFile = (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiService.fetchData<UploadResumeFileResponse>({
    url: `${RESUME_ENDPOINT}/${encodeURIComponent(userId)}/upload`,
    method: "post",
    data: formData,
  });
};

export const exportResume = async (
  resumeId: string,
): Promise<ExportResumeResponse> => {
  const response: AxiosResponse<Blob> = await httpClient.request<Blob>({
    url: `${RESUME_DETAIL_ENDPOINT}/${encodeURIComponent(resumeId)}/export`,
    method: "get",
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentType:
      getHeaderString(response.headers["content-type"]) ??
      "application/octet-stream",
    filename:
      parseContentDispositionFilename(
        response.headers["content-disposition"],
      ) || `resume-${resumeId}.pdf`,
  };
};

const resumeService = {
  createUserResume,
  exportResume,
  getResumeDetail,
  getUserResumeList,
  mapResumeDetailToResumeForm,
  updateUserResume,
  uploadUserResumeFile,
};

export default resumeService;
