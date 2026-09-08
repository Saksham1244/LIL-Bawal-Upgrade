import axios from "axios";
import { getBackendBaseUrl } from "../utils/apiConfig";

export const axiosInstance = axios.create();

export const apiConnector = (method, url, bodyData, headers, params) => {
  const fullUrl = url.startsWith("http") ? url : `${getBackendBaseUrl()}/${url.replace(/^\/+/, "")}`;
  return axiosInstance({
    method: `${method}`,
    url: fullUrl,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
    validateStatus: () => true,
  });
};