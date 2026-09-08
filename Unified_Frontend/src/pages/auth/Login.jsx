import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/operations/authAPI";
import {
  MdVisibility,
  MdVisibilityOff,
  MdLogin,
} from "react-icons/md";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative px-4 bg-[#e8effc] font-sans">
      {/* Floating Centered Card (Matching Reference UI) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
        {/* Top Header & Logo */}
        <div className="text-center mb-6">
          {/* Corporate Brand Logo */}
          <div className="flex items-center justify-center mb-4">
            <img
              src="/lumax-logo.png"
              alt="LUMAX"
              className="h-9 w-auto object-contain"
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
    </div>
  );
}
