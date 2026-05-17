import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';

type Phase = 'work' | 'break' | 'longBreak';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const CYCLES_BEFORE_LONG = 4;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);

  const totalSeconds = phase === 'work' ? WORK_MINUTES * 60 : phase === 'break' ? BREAK_MINUTES * 60 : LONG_BREAK_MINUTES * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(WORK_MINUTES * 60);
    setCycleCount(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);

          if (phase === 'work') {
            const nextCycle = cycleCount + 1;
            setCycleCount(nextCycle);
            setTotalWorkMinutes((m) => m + WORK_MINUTES);

            if (nextCycle % CYCLES_BEFORE_LONG === 0) {
              setPhase('longBreak');
              return LONG_BREAK_MINUTES * 60;
            }
            setPhase('break');
            return BREAK_MINUTES * 60;
          }

          // Break or longBreak ended -> back to work
          setPhase('work');
          return WORK_MINUTES * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, cycleCount]);

  const phaseLabel = phase === 'work' ? 'Focus' : phase === 'break' ? 'Short Break' : 'Long Break';
  const phaseColor = phase === 'work' ? '#7c3aed' : phase === 'break' ? '#38bdf8' : '#34d399';

  return (
    <>
      <PageMeta title="Focus Mode — LifeBoard AI" description="Focus on what matters." />
      <div className="fixed inset-0 focus-ambient flex flex-col items-center justify-center z-50">
        {/* Exit Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 right-4 p-3 rounded-full bg-white/60 backdrop-blur text-foreground hover:bg-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center px-4"
        >
          {/* Session Label */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {phaseLabel}
            </span>
          </div>

          {/* SVG Countdown Ring */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/40"
              />
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="none"
                stroke={phaseColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-sora text-5xl md:text-6xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/70 text-foreground border border-border hover:bg-white'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-white/70 text-foreground border border-border hover:bg-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          {/* Session Counter */}
          <div className="mt-8 space-y-1">
            <p className="text-sm text-muted-foreground">
              Cycle {cycleCount + 1} {phase === 'work' && `(${CYCLES_BEFORE_LONG} until long break)`}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {totalWorkMinutes} min focused today
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
