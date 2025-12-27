import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="
        relative p-2 rounded-lg transition-all duration-300
        bg-white/10 hover:bg-white/20 border border-white/20
      "
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          size={24}
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            text-yellow-500
          `}
        />
        <Moon
          size={24}
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            text-purple-400
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
