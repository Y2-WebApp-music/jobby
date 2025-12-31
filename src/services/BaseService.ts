import { REQUEST_HEADER_AUTH_KEY, TOKEN_TYPE } from "@/configs/app.config";
import type { ApiError } from "@/types/BaseService";
import deepParseJson from "@/utils/deepParseJson";
import type { AxiosError } from "axios";
import axios from "axios";

const toApiError = (errors: AxiosError | Error): ApiError => {
  const axiosError = errors as AxiosError<{ message?: string }>;
  const responseData = axiosError.response?.data as
    | { message?: string }
    | undefined;

  return {
    status: axiosError.response
      ? String(axiosError.response.status ?? "error")
      : "error",
    code:
      "code" in errors && errors.code ? String(errors.code) : "unknown_error",
    message: responseData?.message ?? errors.message ?? "Unknown error",
  };
};

const BaseService = axios.create({
  timeout: 100000,
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

BaseService.interceptors.request.use(
  (config) => {
    const rawPersistData = localStorage.getItem(
      import.meta.env.VITE_APP_LOCAL_STORAGE,
    );

    if (rawPersistData) {
      try {
        const persistData = deepParseJson(rawPersistData) as {
          auth?: { session?: { token?: string } };
        };

        const accessToken = persistData?.auth?.session?.token;

        if (accessToken) {
          config.headers[REQUEST_HEADER_AUTH_KEY] =
            `${TOKEN_TYPE} ${accessToken}`;
        }
      } catch (error) {
        console.error("Failed to parse persisted data:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

BaseService.interceptors.response.use(
  (res) => res,
  async (err) => {
    return Promise.reject(toApiError(err as AxiosError | Error));
  },
);

export default BaseService;
