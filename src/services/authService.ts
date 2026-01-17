import type { UserLogin, UserLoginResponse } from "@/types/userTypes";
import apiService from "./apiService";

export const apiUserLogin = (data: UserLogin) => {
  return apiService.fetchData<UserLoginResponse>({
    url: `/api/v1/authentication/login`,
    method: "post",
    data,
  });
};
