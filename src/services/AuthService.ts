import ApiService from "./ApiService";

export const apiUserLogin = () => {
  return ApiService.fetchData({
    url: `/api/authentication/login`,
    method: "post",
  });
};
