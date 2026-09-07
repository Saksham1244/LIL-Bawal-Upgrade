import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/operations/authAPI";
import {
  MdPersonOutline,
  MdLockOutline,
  MdSecurity,
  MdVisibility,
  MdVisibilityOff,
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative px-4 bg-[#0c1427] font-sans overflow-hidden">
      {/* Subtle grid background texture (Matching screenshot 3) */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating Centered Card (Direct Match to Image 3) */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 sm:p-10 border border-slate-100/60">
        {/* Top Header & Logo */}
        <div className="text-center mb-8">
          {/* Corporate Brand Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg
              className="w-7 h-7 text-[#00529B]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-black tracking-widest text-[#00529B] font-sans">
              BAJAJ
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Manufacturing Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Production Performance Management System (PPMS)
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleOnSubmit} className="space-y-4">
          {/* Username or Email Input Field */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
              USERNAME OR EMAIL
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
              <MdPersonOutline size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleOnChange}
                placeholder="Enter your username or email"
                required
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
              <MdLockOutline size={18} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter your password"
                required
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none p-0 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
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
            className="w-full mt-6 py-3 px-4 bg-[#1a3353] hover:bg-[#12243b] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 cursor-pointer"
          >
            <MdSecurity size={16} />
            <span>
              {loading ? "Signing in..." : "Sign In to Command Center"}
            </span>
          </button>
        </form>
      </div>

      {/* Footer Branding Text (Matching screenshot 3 bottom) */}
      <div className="relative z-10 text-center mt-6 text-[11px] text-slate-400 font-medium">
        <span>Bajaj Auto Pantnagar Plant</span>
        <span className="mx-1.5">•</span>
        <span>PPMS Enterprise v2.0.0</span>
      </div>
    </div>
  );
}
