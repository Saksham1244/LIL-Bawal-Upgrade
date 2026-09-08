/**
 * Dynamically resolves the Backend API Base URL.
 * Supports:
 * 1. Web browser on Localhost: http://localhost:3010/api
 * 2. Web browser on LAN IP (e.g. 192.168.12.6 or 192.168.1.14): http://<hostname>:3010/api
 * 3. Web browser on Public IP (163.223.102.4): http://163.223.102.4:3010/api
 * 4. Android APK (Capacitor): http://163.223.102.4:3010/api (with local plant fallback)
 */
export const getBackendBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Check if custom server endpoint is set in localStorage
    const savedUrl = localStorage.getItem("ppms_server_api_url");
    if (savedUrl) return savedUrl.replace(/\/+$/, "");

    // Native Capacitor Android App environment
    if (window.Capacitor) {
      return "http://163.223.102.4:3010/api";
    }

    if (window.location) {
      const { hostname, protocol } = window.location;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `${protocol}//${hostname}:3010/api`;
      }
    }
  }
  const envUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  return (envUrl || "http://localhost:3010/api").replace(/\/+$/, "");
};

export const API_BASE_URL = getBackendBaseUrl();
export default getBackendBaseUrl;
