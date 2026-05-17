import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import ThemeToggle from '@/components/ui/ThemeToggle';

import { Settings2 } from 'lucide-react';

type Phase = 'work' | 'break' | 'longBreak';

const CYCLES_BEFORE_LONG = 4;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('work');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const totalSeconds = phase === 'work' ? workMinutes * 60 : phase === 'break' ? breakMinutes * 60 : longBreakMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(workMinutes * 60);
    setCycleCount(0);
  }, [workMinutes]);

  const saveSettings = () => {
    setIsEditing(false);
    resetTimer();
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);

          if (phase === 'work') {
            const nextCycle = cycleCount + 1;
            setCycleCount(nextCycle);
            setTotalWorkMinutes((m) => m + workMinutes);

            if (nextCycle % CYCLES_BEFORE_LONG === 0) {
              setPhase('longBreak');
              return longBreakMinutes * 60;
            }
            setPhase('break');
            return breakMinutes * 60;
          }

          // Break or longBreak ended -> back to work
          setPhase('work');
          return workMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, cycleCount, workMinutes, breakMinutes, longBreakMinutes]);

  const phaseLabel = phase === 'work' ? 'Focus' : phase === 'break' ? 'Short Break' : 'Long Break';
  const phaseColor = phase === 'work' ? '#7c3aed' : phase === 'break' ? '#38bdf8' : '#34d399';

  return (
    <>
      <PageMeta title="Focus Mode — LifeBoard AI" description="Focus on what matters." />
      <div 
        className="fixed inset-0 z-50 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/illustrations/nature.jpg")' }}
      >
        {/* Overlay to ensure text and UI readability */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[3px]" />

        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Theme Toggle */}
          <div className="absolute top-4 left-4 z-10">
            <ThemeToggle />
          </div>

          {/* Exit Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/60 backdrop-blur text-foreground hover:bg-white/80 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4 z-10 relative"
          >
          {/* Main Content Area */}
          {isEditing ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-72 md:w-80 mx-auto mb-8 p-6 glass-card text-left space-y-6"
            >
              <h3 className="font-sora font-semibold text-lg text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-violet-600" /> Timer Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground block">Focus Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={workMinutes}
                    onChange={(e) => setWorkMinutes(Number(e.target.value) || 1)}
                    className="w-full bg-white/50 border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground block">Short Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value) || 1)}
                    className="w-full bg-white/50 border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground block">Long Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={longBreakMinutes}
                    onChange={(e) => setLongBreakMinutes(Number(e.target.value) || 1)}
                    className="w-full bg-white/50 border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-white/70 text-foreground border border-border hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
                >
                  Save
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
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
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/70 text-foreground border border-border hover:bg-white'
                      : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20'
                  }`}
                >
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white/70 text-foreground border border-border hover:bg-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white/70 text-foreground border border-border hover:bg-white transition-colors"
                >
                  <Settings2 className="w-4 h-4" /> Edit
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
          )}
        </motion.div>
        </div>
      </div>
    </>
  );
}
