import type { SearchJobResponse } from "@/types/search-job";
import apiService from "./apiService";

export type UserJobListParams = {
  page: number;
  limit: number;
  search_text?: string;
};

export type AppliedJobsParams = UserJobListParams & {
  applied_status?: number;
};

export type AppliedJobsResponse = SearchJobResponse;
export type SavedJobsResponse = SearchJobResponse;
export type ArchivedJobsResponse = SearchJobResponse;

export const USER_ENDPOINT = "/user";

const buildJobListParams = ({
  page,
  limit,
  search_text,
}: UserJobListParams) => ({
  page,
  limit,
  ...(search_text !== undefined ? { search_text } : {}),
});

export const getAppliedJobs = (
  userId: string,
  params: AppliedJobsParams,
) => {
  return apiService.fetchData<AppliedJobsResponse>({
    url: `${USER_ENDPOINT}/${encodeURIComponent(userId)}/applied-jobs`,
    method: "get",
    params: {
      ...buildJobListParams(params),
      ...(params.applied_status !== undefined
        ? { applied_status: params.applied_status }
        : {}),
    },
  });
};

export const getSavedJobs = (userId: string, params: UserJobListParams) => {
  return apiService.fetchData<SavedJobsResponse>({
    url: `${USER_ENDPOINT}/${encodeURIComponent(userId)}/saved-jobs`,
    method: "get",
    params: buildJobListParams(params),
  });
};

export const getArchivedJobs = (userId: string, params: UserJobListParams) => {
  return apiService.fetchData<ArchivedJobsResponse>({
    url: `${USER_ENDPOINT}/${encodeURIComponent(userId)}/archived-jobs`,
    method: "get",
    params: buildJobListParams(params),
  });
};

const userService = {
  getAppliedJobs,
  getArchivedJobs,
  getSavedJobs,
};

export default userService;
