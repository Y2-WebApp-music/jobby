import type { SuccessResponse } from "@/types/apiServiceTypes";
import apiService from "./apiService";

export type ProfileAddressItem = {
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

export type ProfileContactItem = {
  label: string;
  link: string;
};

export type UserSkillItem = {
  id: string;
  name: string;
};

export type EducationItem = {
  id: string;
  school_name: string;
  logo: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpax: string;
};

export type EducationPayload = {
  index: number;
  school_name: string;
  logo: string | null;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  gpax: number;
};

export type WorkExperienceSkillItem = {
  id: string;
  name: string;
};

export type WorkExperienceItem = {
  id: string;
  position: string;
  logo: string;
  company_name: string;
  start_date: string;
  end_date: string;
  work_type: string;
  work_type_id: number;
  skills: WorkExperienceSkillItem[];
};

export type WorkExperienceSkillPayload = {
  skill_id: string;
  skill_name: string;
};

export type WorkExperiencePayload = {
  index: number;
  position: string;
  logo: string | null;
  company_name: string;
  company_id: string;
  start_date: string;
  end_date: string | null;
  work_type: string;
  work_type_id: number;
  skills: WorkExperienceSkillPayload[];
};

export type ProjectImageItem = {
  id: string;
  index: number;
  image: string;
};

export type ProjectSkillItem = {
  id: string;
  name: string;
};

export type ProjectSkillPayload = {
  skill_id: string;
  skill_name: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  images: ProjectImageItem[];
  skills: ProjectSkillItem[];
};

export type CreateProjectPayload = {
  index: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  skills: ProjectSkillPayload[];
};

export type CreateProjectRequest = {
  payload: CreateProjectPayload;
  images: File[];
};

export type AchievementImageItem = {
  id: string;
  index: number;
  image: string;
};

export type AchievementSkillItem = {
  id: string;
  name: string;
};

export type AchievementSkillPayload = {
  skill_id: string;
  skill_name: string;
};

export type AchievementItem = {
  id: string;
  name: string;
  project_name: string;
  description: string;
  date: string;
  images: AchievementImageItem[];
  skills: AchievementSkillItem[];
};

export type AchievementPayload = {
  index: number;
  name: string;
  project_name: string;
  description: string;
  date: string;
  skills: AchievementSkillPayload[];
};

export type AchievementRequest = {
  payload: AchievementPayload;
  images: File[];
};

export type UserProfileItem = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  logo: string;
  banner: string;
  phone: string;
  phone_region?: string;
  about: string;
  quote: string;
  address: ProfileAddressItem | null;
  contact: ProfileContactItem[];
  skills: UserSkillItem[];
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  projects: ProjectItem[];
  achievement: AchievementItem[];
};

export type UpdateProfileAddressPayload = {
  address_line?: string;
  no?: string;
  moo?: string;
  soi?: string;
  street?: string;
  sub_district_th?: string;
  sub_district_eng?: string;
  district_th?: string;
  district_eng?: string;
  province_th?: string;
  province_eng?: string;
  country_th?: string;
  country_eng?: string;
  sub_district_id?: number;
  district_id?: number;
  province_id?: number;
  country_id?: number;
  postal_code?: number;
};

export type UpdateProfileContactPayload = {
  label: string;
  link: string;
};

export type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_region?: string;
  address?: UpdateProfileAddressPayload;
  contact?: UpdateProfileContactPayload[];
};

export type UpdateAboutPayload = {
  about: string;
};

export type UpdateProfileMediaPayload = {
  logo?: File | null;
  banner?: File | null;
};

export type AddUserSkillPayload = {
  skill_id: string;
  skill_name: string;
  index: number;
};

export type DynamicInfoLocationItem = {
  name: string;
};

export type DynamicInfoItem = {
  job_id: string;
  name: string;
  logo: string;
  company_name: string;
  province: DynamicInfoLocationItem | null;
  district: DynamicInfoLocationItem | null;
  applied_date: string;
};

export type GetUserProfileResponse = UserProfileItem;

export type UpdateProfileResponse = Record<string, unknown>;

export type UpdateAboutResponse = Record<string, unknown>;

export type UpdateProfileMediaResponse = Record<string, unknown>;

export type GetUserSkillResponse = UserSkillItem[];

export type AddUserSkillResponse = Record<string, unknown>;

export type GetDynamicInfoResponse = DynamicInfoItem[];

export type GetEducationResponse = EducationItem[];

export type CreateEducationResponse = Record<string, unknown>;

export type UpdateEducationResponse = Record<string, unknown>;

export type GetWorkExperienceResponse = WorkExperienceItem[];

export type CreateWorkExperienceResponse = Record<string, unknown>;

export type UpdateWorkExperienceResponse = Record<string, unknown>;
export type GetProjectsResponse = ProjectItem[];

export type GetProjectByIdResponse = ProjectItem;

export type GetProjectResponse = GetProjectsResponse | GetProjectByIdResponse;

export type CreateProjectResponse = Record<string, unknown>;

export type UpdateProjectResponse = Record<string, unknown>;

export type GetAchievementsResponse = AchievementItem[];

export type GetAchievementByIdResponse = AchievementItem;

export type GetAchievementResponse =
  | GetAchievementsResponse
  | GetAchievementByIdResponse;

export type CreateAchievementResponse = Record<string, unknown>;

export type UpdateAchievementResponse = Record<string, unknown>;

export const PROFILE_ENDPOINT = "/profile/userProfile";

const buildPayloadImagesFormData = <Payload>({
  payload,
  images,
}: {
  payload: Payload;
  images: File[];
}) => {
  const formData = new FormData();

  formData.append("payload", JSON.stringify(payload));

  images.forEach((image) => {
    formData.append("images", image);
  });

  return formData;
};

const buildProfileMediaFormData = ({
  logo,
  banner,
}: UpdateProfileMediaPayload) => {
  const formData = new FormData();

  if (logo) {
    formData.append("logo", logo);
  }

  if (banner) {
    formData.append("banner", banner);
  }

  return formData;
};

export const getUserProfile = (id: string) => {
  return apiService.fetchData<GetUserProfileResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}`,
    method: "get",
  });
};

export const updateProfile = (id: string, data: UpdateProfilePayload) => {
  return apiService.fetchData<UpdateProfileResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}`,
    method: "patch",
    data,
  });
};

export const updateAbout = (id: string, data: UpdateAboutPayload) => {
  return apiService.fetchData<UpdateAboutResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/about`,
    method: "patch",
    data,
  });
};

export const updateProfileMedia = (
  id: string,
  data: UpdateProfileMediaPayload,
) => {
  return apiService.fetchData<UpdateProfileMediaResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/media`,
    method: "patch",
    data: buildProfileMediaFormData(data),
  });
};

export const getUserSkill = (id: string) => {
  return apiService.fetchData<GetUserSkillResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/skills`,
    method: "get",
  });
};

export const addUserSkill = (id: string, data: AddUserSkillPayload) => {
  return apiService.fetchData<AddUserSkillResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/skills`,
    method: "post",
    data,
  });
};

export const getDynamicInfo = (id: string) => {
  return apiService.fetchData<GetDynamicInfoResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/dynamic-info`,
    method: "get",
  });
};

export const getEducation = (id: string) => {
  return apiService.fetchData<GetEducationResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/educations`,
    method: "get",
  });
};

export const createEducation = (id: string, data: EducationPayload) => {
  return apiService.fetchData<CreateEducationResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/educations`,
    method: "post",
    data,
  });
};

export const updateEducation = (
  id: string,
  educationId: string,
  data: EducationPayload,
) => {
  return apiService.fetchData<UpdateEducationResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/educations/${encodeURIComponent(educationId)}`,
    method: "patch",
    data,
  });
};

export const getWorkExperience = (id: string) => {
  return apiService.fetchData<GetWorkExperienceResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/work-experiences`,
    method: "get",
  });
};

export const createWorkExperience = (
  id: string,
  data: WorkExperiencePayload,
) => {
  return apiService.fetchData<CreateWorkExperienceResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/work-experiences`,
    method: "post",
    data,
  });
};

export const updateWorkExperience = (
  id: string,
  workExperienceId: string,
  data: WorkExperiencePayload,
) => {
  return apiService.fetchData<UpdateWorkExperienceResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/work-experiences/${encodeURIComponent(workExperienceId)}`,
    method: "patch",
    data,
  });
};

export function getProject(
  id: string,
): Promise<SuccessResponse<GetProjectsResponse>>;
export function getProject(
  id: string,
  projectId: string,
): Promise<SuccessResponse<GetProjectByIdResponse>>;
export function getProject(id: string, projectId?: string) {
  const baseUrl = `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/projects`;
  const url = projectId
    ? `${baseUrl}/${encodeURIComponent(projectId)}`
    : baseUrl;

  return apiService.fetchData<GetProjectResponse>({
    url,
    method: "get",
  });
}

export const createProject = (id: string, data: CreateProjectRequest) => {
  return apiService.fetchData<CreateProjectResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/projects`,
    method: "post",
    data: buildPayloadImagesFormData(data),
  });
};

export const updateProject = (
  id: string,
  projectId: string,
  data: CreateProjectRequest,
) => {
  return apiService.fetchData<UpdateProjectResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/projects/${encodeURIComponent(projectId)}`,
    method: "patch",
    data: buildPayloadImagesFormData(data),
  });
};

export function getAchievement(
  id: string,
): Promise<SuccessResponse<GetAchievementsResponse>>;
export function getAchievement(
  id: string,
  achievementId: string,
): Promise<SuccessResponse<GetAchievementByIdResponse>>;
export function getAchievement(id: string, achievementId?: string) {
  const baseUrl = `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/achievements`;
  const url = achievementId
    ? `${baseUrl}/${encodeURIComponent(achievementId)}`
    : baseUrl;

  return apiService.fetchData<GetAchievementResponse>({
    url,
    method: "get",
  });
}

export const createAchievement = (id: string, data: AchievementRequest) => {
  return apiService.fetchData<CreateAchievementResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/achievements`,
    method: "post",
    data: buildPayloadImagesFormData(data),
  });
};

export const updateAchievement = (
  id: string,
  achievementId: string,
  data: AchievementRequest,
) => {
  return apiService.fetchData<UpdateAchievementResponse>({
    url: `${PROFILE_ENDPOINT}/${encodeURIComponent(id)}/achievements/${encodeURIComponent(achievementId)}`,
    method: "patch",
    data: buildPayloadImagesFormData(data),
  });
};

const profileService = {
  addUserSkill,
  createAchievement,
  createEducation,
  createProject,
  createWorkExperience,
  getAchievement,
  getDynamicInfo,
  getEducation,
  getProject,
  getUserProfile,
  getUserSkill,
  getWorkExperience,
  updateAchievement,
  updateAbout,
  updateEducation,
  updateProfile,
  updateProfileMedia,
  updateProject,
  updateWorkExperience,
};

export default profileService;
