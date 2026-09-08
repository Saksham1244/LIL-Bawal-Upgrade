/**
 * Dynamically resolves the Backend API Base URL.
 * Automatically adapts when accessed from localhost or from a mobile phone / LAN IP (e.g. 192.168.1.14).
 */
export const getBackendBaseUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    const { hostname, protocol } = window.location;
    // When accessing from mobile phone or another device on LAN (e.g. 192.168.1.14:3000)
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:3010/api`;
    }
  }
  const envUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  return (envUrl || "http://localhost:3010/api").replace(/\/+$/, "");
};

export const API_BASE_URL = getBackendBaseUrl();
export default getBackendBaseUrl;
