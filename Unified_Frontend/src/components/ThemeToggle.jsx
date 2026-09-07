import React from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

export default function ThemeToggle() {
  const { currentTheme, changeCurrentTheme } = useThemeProvider();
  const isDark = currentTheme === 'dark';

  const toggle = () => {
    changeCurrentTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <MdLightMode size={18} className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
      ) : (
        <MdDarkMode size={18} className="text-gray-600 hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
