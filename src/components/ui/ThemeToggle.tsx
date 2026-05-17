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
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-inner ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
      } ${className} border`}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Sliding Background Highlight */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`absolute h-6 w-6 rounded-full shadow-md ${
          theme === 'dark' ? 'translate-x-7 bg-slate-950' : 'translate-x-1 bg-white'
        }`}
      />
      
      {/* The Icons */}
      <span className="absolute inset-0 flex h-full w-full items-center">
        <span className="absolute flex h-6 w-6 items-center justify-center transition-colors duration-300" style={{ left: '4px' }}>
          <Sun className={`w-3.5 h-3.5 z-10 ${theme === 'dark' ? 'text-slate-400' : 'text-violet-600'}`} />
        </span>
        <span className="absolute flex h-6 w-6 items-center justify-center transition-colors duration-300" style={{ left: '28px' }}>
          <Moon className={`w-3.5 h-3.5 z-10 ${theme === 'dark' ? 'text-violet-400' : 'text-slate-400'}`} />
        </span>
      </span>
    </button>
  );
}
