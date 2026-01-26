import type { ErrorResponseProps } from "@/types/apiServiceTypes";
import axios, { AxiosError, type AxiosInstance } from "axios";
import { formatError } from "./serviceHandler";

const httpClient: AxiosInstance = axios.create({
  timeout: 60000,
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use(
  (config) => {
    const rawPersistData = localStorage.getItem(
      import.meta.env.VITE_APP_LOCAL_STORAGE,
    );

    if (rawPersistData) {
      try {
        // const persistData = deepParseJson(rawPersistData) as {
        //   auth?: { session?: { token?: string } };
        // };
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

httpClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const formatted = formatError(err);
    return Promise.reject<ErrorResponseProps>(formatted);
  },
);

export default httpClient;
