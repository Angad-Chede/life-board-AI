import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
        theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-violet-100 border border-violet-200'
      } ${className}`}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`absolute inset-0 flex h-full w-full justify-around items-center px-1.5 transition-opacity duration-300`}
      >
        <Moon className="w-4 h-4 text-slate-400" />
        <Sun className="w-4 h-4 text-violet-500" />
      </span>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ${
          theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-slate-800" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-violet-600" />
        )}
      </motion.span>
    </button>
  );
}
