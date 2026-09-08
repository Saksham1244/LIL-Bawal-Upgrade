/**
 * Automatically resolves the Backend API Base URL based on current browser origin.
 * - When accessed over LAN / Server (e.g. http://192.168.12.6:3010), routes to that server's /api
 * - When accessed over Cloudflare Tunnel (https://*.trycloudflare.com), routes to that tunnel's /api
 * - When running in local Vite dev (port 3000), routes to backend on port 3010
 */
export const getBackendBaseUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    const { hostname, protocol, port } = window.location;

    // If accessed over Cloudflare tunnel or custom domain
    if (hostname.includes("cloudflare") || hostname.includes("trycloudflare")) {
      return `${protocol}//${hostname}/api`;
    }

    // If accessed on production single-origin port 3010
    if (port === "3010") {
      return `${protocol}//${hostname}:3010/api`;
    }

    // If running in Vite dev server (port 3000 / 5173), target backend on 3010
    if (port === "3000" || port === "5173") {
      return `${protocol}//${hostname}:3010/api`;
    }

    // Fallback: standard relative origin /api
    return `${protocol}//${hostname}${port ? `:${port}` : ""}/api`;
  }

  const envUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  return (envUrl || "http://localhost:3010/api").replace(/\/+$/, "");
};

export const API_BASE_URL = getBackendBaseUrl();
export default getBackendBaseUrl;
