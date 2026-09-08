import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/operations/authAPI";
import {
  MdVisibility,
  MdVisibilityOff,
  MdLogin,
  MdSettings,
  MdClose,
  MdCheckCircle,
  MdError,
  MdRefresh,
} from "react-icons/md";
import axios from "axios";
import { getBackendBaseUrl } from "../../utils/apiConfig";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Server Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => getBackendBaseUrl());
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMsg, setTestMsg] = useState("");

  const { username, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      await dispatch(login(username, password, navigate));
    } finally {
      setLoading(false);
    }
  };

  const testServerConnection = async (targetUrl) => {
    const url = (targetUrl || serverUrl).replace(/\/+$/, "");
    setTestStatus("testing");
    setTestMsg("Testing connection...");
    try {
      const res = await axios.get(`${url}/status`, { timeout: 4000 });
      if (res.status === 200) {
        setTestStatus("success");
        setTestMsg(`Connected! Server: ${res.data?.app || "Online"}`);
      } else {
        setTestStatus("error");
        setTestMsg(`Server returned code ${res.status}`);
      }
    } catch (err) {
      setTestStatus("error");
      setTestMsg("Cannot reach server. Ensure backend is running.");
    }
  };

  const handleSaveSettings = () => {
    const clean = serverUrl.replace(/\/+$/, "");
    localStorage.setItem("ppms_server_api_url", clean);
    setShowSettings(false);
  };

  const selectPreset = (url) => {
    setServerUrl(url);
    testServerConnection(url);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative px-4 bg-[#e8effc] font-sans">
      {/* Top-Right Server Settings Button */}
      <button
        type="button"
        onClick={() => {
          setShowSettings(true);
          testServerConnection(serverUrl);
        }}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white text-slate-500 hover:text-blue-600 shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold"
        title="Server Connection Settings"
      >
        <MdSettings size={18} className="text-slate-600" />
        <span className="hidden sm:inline text-[11px] text-slate-600">Server Settings</span>
      </button>

      {/* Floating Centered Card (Matching Reference UI) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
        {/* Top Header & Logo */}
        <div className="text-center mb-6">
          {/* Corporate Brand Logo */}
          <div className="flex items-center justify-center mb-4">
            <img
              src="/lumax-logo.png"
              alt="LUMAX"
              className="h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Welcome Back
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleOnSubmit} className="space-y-4">
          {/* Username Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleOnChange}
              placeholder="Enter your username"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-[#1565c0] hover:bg-[#0d47a1] active:bg-[#0a3880] text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
          >
            <MdLogin size={18} />
            <span>
              {loading ? "Signing in..." : "Sign In"}
            </span>
          </button>
        </form>
      </div>

      {/* Footer Branding Text */}
      <div className="text-center mt-6 text-[11px] text-slate-400 font-medium">
        <span>LUMAX Industries • Bawal Plant</span>
        <span className="mx-1.5">•</span>
        <span>PPMS Enterprise v2.0.0</span>
      </div>

      {/* ================================================================= */}
      {/* SERVER SETTINGS MODAL */}
      {/* ================================================================= */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MdSettings size={20} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Server Connection Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <MdClose size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                SELECT PRESET SERVER:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => selectPreset("http://192.168.1.14:3010/api")}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">💻 Laptop Dev Server</span>
                    <p className="text-[10px] text-slate-400 font-mono">http://192.168.1.14:3010/api</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Local Wi-Fi</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset("https://satisfy-spencer-flickr-sand.trycloudflare.com/api")}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">🌐 Cloudflare Global Tunnel</span>
                    <p className="text-[10px] text-slate-400 font-mono">https://satisfy-spencer...trycloudflare.com</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">4G/5G Worldwide</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset("http://192.168.12.6:3010/api")}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">🏭 Plant Server (LAN)</span>
                    <p className="text-[10px] text-slate-400 font-mono">http://192.168.12.6:3010/api</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Plant Wi-Fi</span>
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                CUSTOM BACKEND API URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="http://192.168.1.14:3010/api"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => testServerConnection()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <MdRefresh size={16} />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Connection Test Result */}
            {testStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testStatus === "testing"
                    ? "bg-slate-50 text-slate-600 border border-slate-200"
                    : testStatus === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {testStatus === "testing" && <span className="animate-spin">⏳</span>}
                {testStatus === "success" && <MdCheckCircle size={16} className="text-emerald-600 shrink-0" />}
                {testStatus === "error" && <MdError size={16} className="text-rose-600 shrink-0" />}
                <span className="font-medium truncate">{testMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
