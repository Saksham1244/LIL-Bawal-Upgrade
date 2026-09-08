/**
 * Dynamically resolves the Backend API Base URL.
 * Supports:
 * 1. Global Public Cloudflare Tunnel: https://satisfy-spencer-flickr-sand.trycloudflare.com/api
 * 2. Public Direct IP: http://163.223.102.4:3010/api
 * 3. Local Plant Server LAN IP: http://192.168.12.6:3010/api
 * 4. Localhost Web: http://localhost:3010/api
 */
export const getBackendBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Check if custom server endpoint is set in localStorage
    const savedUrl = localStorage.getItem("ppms_server_api_url");
    if (savedUrl) return savedUrl.replace(/\/+$/, "");

    // Native Capacitor Android App environment (Uses secure Cloudflare Tunnel)
    if (window.Capacitor) {
      return "https://satisfy-spencer-flickr-sand.trycloudflare.com/api";
    }

    if (window.location) {
      const { hostname, protocol } = window.location;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        if (hostname.includes("trycloudflare.com") || hostname.includes("cloudflare")) {
          return `${protocol}//${hostname}/api`;
        }
        return `${protocol}//${hostname}:3010/api`;
      }
    }
  }
  const envUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  return (envUrl || "https://satisfy-spencer-flickr-sand.trycloudflare.com/api").replace(/\/+$/, "");
};

export const API_BASE_URL = getBackendBaseUrl();
export default getBackendBaseUrl;
