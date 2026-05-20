import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Repeat,
  StickyNote,
  Target,
  Focus,
  Sparkles,
  Brain,
  Menu,
  X,
  ChevronRight,
  Zap,
  BarChart3,
  Clock,
  Play,
  Pause,
  Star,
  Quote,
  Flame,
  Check
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const features = [
  { icon: CheckSquare, title: 'Tasks', description: 'Organize your daily tasks with smart prioritization and deadline tracking.', color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
  { icon: Repeat, title: 'Habits', description: 'Build lasting habits with streak tracking and daily check-ins.', color: 'bg-sky-100 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400' },
  { icon: StickyNote, title: 'Notes', description: 'Capture ideas and organize your thoughts in one beautiful space.', color: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { icon: Target, title: 'Goals', description: 'Set meaningful goals and track your progress over time.', color: 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' },
  { icon: Focus, title: 'Focus Mode', description: 'Eliminate distractions with Pomodoro, Flow State, and Time Boxing.', color: 'bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400' },
  { icon: Brain, title: 'AI Insights', description: 'Get personalized productivity recommendations powered by AI.', color: 'bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400' },
];

const aiInsights = [
  { icon: Zap, text: 'Your productivity peaks at 10 AM — schedule deep work then.', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { icon: BarChart3, text: 'You complete 23% more tasks when using Focus Mode.', color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
  { icon: Clock, text: 'Consider breaking large tasks into 25-minute chunks.', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
];

const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Tasks Completed', value: '1.2M+' },
  { label: 'Habit Consistency', value: '98%' },
  { label: 'User Rating', value: '4.9/5' },
];

const faqs = [
  { q: 'What makes LifeBoard AI different?', a: 'Unlike traditional task managers, LifeBoard AI integrates tasks, habits, and notes with an AI layer that actively learns your productivity patterns to suggest improvements.' },
  { q: 'Is my data secure and private?', a: 'Absolutely. We use industry-standard encryption, and your personal data is never used to train generalized AI models. The AI insights run entirely on your isolated context.' },
  { q: 'Can I use LifeBoard AI for free?', a: 'Yes! We offer a generous Free Forever plan that covers all your basic productivity needs. You can upgrade to Pro for advanced AI insights and unlimited syncing.' },
  { q: 'Does it support dark mode?', a: 'Yes, LifeBoard AI features a beautifully crafted dark mode that you can toggle anytime to reduce eye strain during deep work sessions.' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

// Simulator Widget Component
function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<'dashboard'|'tasks'|'habits'|'focus'>('dashboard');
  
  // Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design landing page mockup', done: false },
    { id: 2, text: 'Review weekly analytics', done: true },
    { id: 3, text: 'Write blog post draft', done: false },
  ]);
  
  // Habits State
  const [habits, setHabits] = useState([
    { id: 1, text: 'Morning workout', streak: 12, done: false },
    { id: 2, text: 'Read 20 pages', streak: 4, done: true },
  ]);
  
  // Focus State
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [focusActive, setFocusActive] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (focusActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setFocusActive(false);
    }
    return () => clearInterval(interval);
  }, [focusActive, focusTime]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  
  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 };
      }
      return h;
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card overflow-hidden border border-white/40 dark:border-slate-800/60 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl w-full max-w-lg mx-auto h-[420px] flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-white/50 dark:bg-slate-950/50 border-b border-border/40 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Target },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'habits', label: 'Habits', icon: Repeat },
          { id: 'focus', label: 'Focus', icon: Focus },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 shadow-sm' 
                : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto relative bg-gradient-to-br from-transparent to-slate-50/30 dark:to-slate-900/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold text-lg">Good morning, Alex</h3>
                    <p className="text-sm text-muted-foreground">3 tasks remaining today</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground font-medium">Completed</p>
                    <p className="text-xl font-sora font-bold mt-1 text-emerald-600 dark:text-emerald-400">12</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground font-medium">Habit Streak</p>
                    <p className="text-xl font-sora font-bold mt-1 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      12 <Flame className="w-4 h-4" />
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-violet-50/80 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 mt-4 relative overflow-hidden">
                  <Brain className="w-24 h-24 absolute -right-4 -bottom-4 text-violet-500/10 dark:text-violet-400/10" />
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">AI Insight</span>
                  </div>
                  <p className="text-sm text-violet-800 dark:text-violet-200">You're on a roll! Taking a 5-minute break now will boost your afternoon focus by 20%.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                <h3 className="font-sora font-semibold mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-violet-500" /> Today's Tasks
                </h3>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${task.done ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-border shadow-sm hover:shadow-md'}`} onClick={() => toggleTask(task.id)}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {task.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>{task.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-violet-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(tasks.filter(t=>t.done).length / tasks.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{Math.round((tasks.filter(t=>t.done).length / tasks.length) * 100)}%</span>
                </div>
              </div>
            )}
            
            {activeTab === 'habits' && (
              <div className="space-y-3">
                <h3 className="font-sora font-semibold mb-4 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-sky-500" /> Daily Habits
                </h3>
                <div className="space-y-3">
                  {habits.map(habit => (
                    <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-border shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{habit.text}</span>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3" /> {habit.streak} day streak
                        </span>
                      </div>
                      <button 
                        onClick={() => toggleHabit(habit.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${habit.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                      >
                        {habit.done ? 'Done!' : 'Check in'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'focus' && (
              <div className="flex flex-col items-center justify-center h-full pt-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-violet-500/20 dark:bg-violet-500/10 blur-xl rounded-full scale-150 transition-transform group-hover:scale-175 duration-500" />
                  <div className="w-40 h-40 rounded-full border-4 border-violet-100 dark:border-violet-900/50 flex flex-col items-center justify-center relative bg-white dark:bg-slate-900 shadow-xl">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="76" cy="76" r="74" className="stroke-violet-500/20 dark:stroke-violet-500/10" strokeWidth="4" fill="none" />
                      <motion.circle 
                        cx="76" cy="76" r="74" 
                        className="stroke-violet-500" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray="465"
                        strokeDashoffset={465 - (focusTime / (25 * 60)) * 465}
                        strokeLinecap="round"
                        transition={{ duration: 0.5 }}
                      />
                    </svg>
                    <span className="font-sora text-4xl font-bold text-foreground tracking-tighter relative z-10">{formatTime(focusTime)}</span>
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-1 relative z-10">Pomodoro</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setFocusTime(25*60)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Reset">
                    <Repeat className="w-4 h-4" />
                  </button>
                  <button onClick={() => setFocusActive(!focusActive)} className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 transition-transform hover:scale-105 active:scale-95">
                    {focusActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                  </button>
                  <button onClick={() => setFocusTime(5*60)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Short Break">
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Removed the documentElement forcing useEffect so dark mode works globally

  return (
    <>
      <PageMeta title="LifeBoard AI — Your Life, Beautifully Organized" description="Smart adaptive productivity dashboard with tasks, habits, notes, focus mode, and AI insights." />
      <div className="min-h-screen relative font-jakarta bg-background text-foreground overflow-hidden selection:bg-violet-200 selection:text-violet-900 dark:selection:bg-violet-500/30 dark:selection:text-violet-100">
        
        {/* Ambient Grid and Blobs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-400/20 dark:bg-violet-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-400/20 dark:bg-sky-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
        </div>

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/30 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-md group-hover:shadow-violet-500/20 transition-all">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-sora font-semibold text-lg tracking-tight">LifeBoard AI</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#focus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Focus</a>
                <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <ThemeToggle />
                <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">Login</Link>
                <Link to="/auth/signup" className="text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 rounded-xl shadow-md shadow-violet-500/20">Get Started</Link>
              </div>

              <div className="md:hidden flex items-center gap-4">
                <ThemeToggle />
                <button className="p-2 -mr-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border/30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl overflow-hidden"
              >
                <div className="px-4 py-4 space-y-3 flex flex-col">
                  <a href="#features" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
                  <a href="#focus" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Focus</a>
                  <a href="#pricing" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                  <a href="#faq" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                  <div className="h-px bg-border/50 my-2" />
                  <Link to="/auth/login" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/auth/signup" className="block text-sm font-medium bg-violet-600 text-white px-4 py-2.5 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="relative z-10">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6 mx-auto lg:mx-0">
                  <Sparkles className="w-4 h-4" /> Meet the new LifeBoard AI
                </div>
                <h1 className="font-sora text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-balance tracking-tight">
                  Your Life,{' '}
                  <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    Beautifully Organized
                  </span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed">
                  Bring tasks, habits, notes, and focus sessions into one intelligent dashboard that adapts to how you work and actively suggests ways to improve.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/auth/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5">
                    Start Free Trial <ChevronRight className="w-4 h-4" />
                  </Link>
                  <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur text-foreground font-medium px-8 py-3.5 rounded-xl border border-border hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md">
                    See Features
                  </a>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-violet-200 to-sky-200 dark:from-violet-800 dark:to-sky-800 shadow-sm" />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="text-xs font-medium mt-0.5">Loved by 10,000+ users</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
                className="relative lg:ml-auto w-full max-w-lg mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/30 to-sky-500/30 blur-[80px] rounded-full" />
                <InteractiveShowcase />
              </motion.div>
            </div>
          </section>

          {/* Stats Banner */}
          <section className="border-y border-border/40 bg-muted/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <p className="font-sora text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground text-balance">Everything you need to stay productive</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">Six powerful tools working perfectly together to help you achieve more with less stress.</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="glass-card bg-white/50 dark:bg-slate-900/50 border-white/60 dark:border-slate-800 p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-sora font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* AI Section */}
          <section id="ai" className="border-t border-border/40 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                    <Brain className="w-3.5 h-3.5" /> AI Powered
                  </div>
                  <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">Insights that actually help you improve</h2>
                  <p className="text-muted-foreground text-lg text-pretty mb-8 leading-relaxed">
                    LifeBoard AI analyzes your completion patterns, active focus sessions, and habit streaks to surface actionable insights. Discover your peak hours, identify what breaks your focus, and get personalized recommendations.
                  </p>
                  <ul className="space-y-4">
                    {['Peak hour detection & scheduling suggestions', 'Habit correlation analysis', 'Smart task breakdown recommendations', 'Weekly productivity trend reports'].map((item, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="flex items-center gap-3 text-foreground font-medium"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-110" />
                  <div className="glass-card bg-white/80 dark:bg-slate-900/80 border-white/60 dark:border-slate-800 p-8 relative shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-sora font-semibold">Your Productivity Analysis</h3>
                        <p className="text-xs text-muted-foreground">Updated just now</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {aiInsights.map((insight, i) => {
                        const Icon = insight.icon;
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (i * 0.15) }}
                            className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-border shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className={`mt-0.5 p-2 rounded-lg ${insight.bg} ${insight.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-foreground text-pretty leading-relaxed">{insight.text}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-4">Loved by productivity nerds</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Don't just take our word for it. Here's what our community says.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah J.", role: "Product Manager", text: "LifeBoard AI replaced three different apps for me. The AI insights actually pointed out I was doing deep work at the wrong time of day. Game changer!" },
                { name: "David Chen", role: "Software Engineer", text: "The Focus Mode is gorgeous. I use the Pomodoro timer every single day, and the fact that it links directly to my task list keeps me perfectly on track." },
                { name: "Elena R.", role: "Freelance Designer", text: "Finally, a productivity tool that looks as good as it works. The dark mode is stunning, and the habit tracker's streak flame motivates me to not break the chain." }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card bg-white/60 dark:bg-slate-900/60 border-white/60 dark:border-slate-800 p-6 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <Quote className="w-8 h-8 text-violet-200 dark:text-violet-900 mb-4" />
                  <p className="text-foreground text-sm leading-relaxed mb-6 flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-200 to-sky-200 dark:from-violet-800 dark:to-sky-800 flex items-center justify-center text-sm font-bold text-foreground shadow-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm font-sora">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="border-t border-border/40 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center mb-16">
                <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start for free, upgrade when you need the power of AI.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="glass-card bg-white dark:bg-slate-900 border-border p-8 rounded-3xl relative flex flex-col">
                  <h3 className="font-sora text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-muted-foreground mb-6">Perfect for getting your life organized.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold font-sora">$0</span>
                    <span className="text-muted-foreground font-medium">/forever</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {['Unlimited Tasks & Habits', 'Basic Notes', 'Focus Mode Timers', 'Local Storage'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span className="text-foreground font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup" className="w-full py-3.5 px-4 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center">
                    Get Started Free
                  </Link>
                </div>
                
                <div className="glass-card bg-white dark:bg-slate-900 p-8 rounded-3xl relative flex flex-col border-[2px] border-violet-500 shadow-2xl shadow-violet-500/20 scale-100 md:scale-105 z-10 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 to-sky-500" />
                  <div className="absolute top-6 right-6 px-3 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider rounded-full">Popular</div>
                  <h3 className="font-sora text-2xl font-bold mb-2">Pro</h3>
                  <p className="text-muted-foreground mb-6">Supercharge your productivity with AI.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold font-sora">$5</span>
                    <span className="text-muted-foreground font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {['Everything in Starter', 'Personalized AI Insights', 'Cloud Sync Across Devices', 'Advanced Habit Analytics', 'Priority Support'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-violet-500" />
                        <span className="text-foreground font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup" className="w-full py-3.5 px-4 rounded-xl font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors text-center shadow-lg shadow-violet-500/25">
                    Start 14-Day Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-12">
              <h2 className="font-sora text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl px-6 border">
                  <AccordionTrigger className="text-left font-semibold text-[15px] hover:no-underline hover:text-violet-600 dark:hover:text-violet-400 py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA Section */}
          <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-sky-500 rounded-3xl transform -rotate-1 scale-[1.02] opacity-20 blur-xl dark:opacity-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative glass-card bg-white dark:bg-slate-900 border-border p-12 md:p-16 text-center rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full" />
              
              <h2 className="font-sora text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance relative z-10">Ready to take back your time?</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto text-pretty relative z-10">Join thousands of people using LifeBoard AI to organize their life, crush their goals, and find their focus.</p>
              <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-8 py-4 rounded-xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/30 text-lg relative z-10 hover:-translate-y-1">
                Get Started for Free <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </section>

        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-sora font-semibold text-base text-foreground tracking-tight">LifeBoard AI</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#focus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Focus</a>
                <a href="#ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI Insights</a>
                <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </div>
              <p className="text-sm text-muted-foreground font-medium">&copy; {new Date().getFullYear()} LifeBoard AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
