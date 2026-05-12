import type { ErrorResponseProps } from "@/types/apiServiceTypes";
import axios, { AxiosError, type AxiosInstance } from "axios";
import { formatError } from "./serviceHandler";

const httpClient: AxiosInstance = axios.create({
  timeout: 60000,
  baseURL: (import.meta.env.VITE_APP_BASE_URL ?? "").trim(),
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const formatted = formatError(err);
    return Promise.reject<ErrorResponseProps>(formatted);
  },
);

export default httpClient;
