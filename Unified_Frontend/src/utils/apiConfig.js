/**
 * Dynamically resolves the Backend API Base URL.
 * Supports:
 * 1. Saved Custom Server Endpoint (from Settings Modal)
 * 2. Personal Laptop Server: http://192.168.1.14:3010/api
 * 3. Plant Server LAN IP: http://192.168.12.6:3010/api
 * 4. Global Cloudflare Tunnel: https://satisfy-spencer-flickr-sand.trycloudflare.com/api
 * 5. Localhost: http://localhost:3010/api
 */
export const getBackendBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 1. Check if user configured a server endpoint
    const savedUrl = localStorage.getItem("ppms_server_api_url");
    if (savedUrl) return savedUrl.replace(/\/+$/, "");

    // 2. If running inside native Android App (Capacitor)
    if (window.Capacitor) {
      return "https://medal-programmers-origins-ultra.trycloudflare.com/api";
    }

    // 3. Web Browser dynamic host resolution
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
  return (envUrl || "http://192.168.1.14:3010/api").replace(/\/+$/, "");
};

export const API_BASE_URL = getBackendBaseUrl();
export default getBackendBaseUrl;
