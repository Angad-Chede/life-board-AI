import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

const features = [
  {
    icon: CheckSquare,
    title: 'Tasks',
    description: 'Organize your daily tasks with smart prioritization and deadline tracking.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Repeat,
    title: 'Habits',
    description: 'Build lasting habits with streak tracking and daily check-ins.',
    color: 'bg-sky-50 text-sky-500',
  },
  {
    icon: StickyNote,
    title: 'Notes',
    description: 'Capture ideas and organize your thoughts in one beautiful space.',
    color: 'bg-emerald-50 text-emerald-500',
  },
  {
    icon: Target,
    title: 'Goals',
    description: 'Set meaningful goals and track your progress over time.',
    color: 'bg-amber-50 text-amber-500',
  },
  {
    icon: Focus,
    title: 'Focus Mode',
    description: 'Eliminate distractions with Pomodoro, Flow State, and Time Boxing.',
    color: 'bg-rose-50 text-rose-500',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Get personalized productivity recommendations powered by AI.',
    color: 'bg-indigo-50 text-indigo-500',
  },
];

const aiInsights = [
  { icon: Zap, text: 'Your productivity peaks at 10 AM — schedule deep work then.', color: 'text-violet-600' },
  { icon: BarChart3, text: 'You complete 23% more tasks when using Focus Mode.', color: 'text-sky-500' },
  { icon: Clock, text: 'Consider breaking large tasks into 25-minute chunks.', color: 'text-emerald-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (wasDark) {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    return () => {
      if (wasDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    };
  }, []);

  return (
    <>
      <PageMeta title="LifeBoard AI — Your Life, Beautifully Organized" description="Smart adaptive productivity dashboard with tasks, habits, notes, focus mode, and AI insights." />
      <div className="min-h-screen gradient-bg font-jakarta">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/30 bg-white/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-sora font-semibold text-lg text-foreground">LifeBoard AI</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#focus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Focus</a>
                <a href="#ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI</a>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Login</Link>
                <Link to="/auth/signup" className="text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 rounded-xl">Get Started</Link>
              </div>

              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-border/30 bg-white/90 backdrop-blur-xl px-4 py-4 space-y-3"
            >
              <a href="#features" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#focus" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Focus</a>
              <a href="#ai" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>AI</a>
              <Link to="/auth/login" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/auth/signup" className="block text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </motion.div>
          )}
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="font-sora text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Your Life,{' '}
                <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                  Beautifully Organized
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg text-pretty">
                LifeBoard AI brings together tasks, habits, notes, and focus sessions into one intelligent dashboard that adapts to how you work.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                  Start Free <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-foreground font-medium px-6 py-3 rounded-xl border border-border hover:bg-white transition-colors">
                  See Demo
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-card p-6 max-w-md mx-auto"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-sora font-semibold text-sm">Today&apos;s Focus</p>
                    <p className="text-xs text-muted-foreground">3 tasks remaining</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Design system update', 'Weekly review', 'Write blog post'].map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-white/60">
                      <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'border-violet-400 bg-violet-400' : 'border-muted-foreground/30'}`} />
                      <span className={`text-sm ${i === 0 ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-violet-300 to-sky-300" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Habit streak: 12 days</span>
                </div>
              </motion.div>
            </motion.div>
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
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">Six powerful tools working together to help you achieve more with less stress.</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="glass-card p-6 hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-sora font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* AI Section */}
        <section id="ai" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-4">
                <Brain className="w-3.5 h-3.5" /> AI Powered
              </div>
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Insights that actually help you improve</h2>
              <p className="text-muted-foreground text-pretty mb-6">
                LifeBoard AI analyzes your patterns and surfaces actionable insights — not just data. Discover your peak productivity hours, identify distractions, and get personalized recommendations.
              </p>
              <ul className="space-y-3">
                {['Peak hour detection', 'Habit correlation analysis', 'Smart task suggestions', 'Weekly productivity reports'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckSquare className="w-3 h-3 text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Brain className="w-5 h-5 text-violet-600" />
                  <h3 className="font-sora font-semibold">AI Insights</h3>
                </div>
                <div className="space-y-3">
                  {aiInsights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/60">
                        <div className={`mt-0.5 ${insight.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-foreground text-pretty">{insight.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Focus Showcase */}
        <section id="focus" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 via-sky-100/50 to-emerald-100/50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Find your flow</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">Three focus modes designed for different types of work. Choose what fits your style.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 max-w-3xl mx-auto"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: 'Pomodoro', desc: '25 min work + 5 min break', icon: Clock, color: 'text-violet-600' },
                  { name: 'Flow State', desc: 'Continuous deep work', icon: Zap, color: 'text-sky-500' },
                  { name: 'Time Boxing', desc: 'Fixed time blocks', icon: Target, color: 'text-emerald-500' },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <div key={mode.name} className="text-center p-4 rounded-xl bg-white/50 border border-white/60">
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${mode.color}`} />
                      <h4 className="font-sora font-semibold text-sm mb-1">{mode.name}</h4>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-6 rounded-xl bg-violet-50 border border-violet-100 text-center">
                <p className="font-sora text-2xl font-bold text-violet-700">25:00</p>
                <p className="text-sm text-violet-600 mt-1">Focus session in progress</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-sora text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Ready to be productive?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-pretty">Join thousands of people using LifeBoard AI to organize their life and achieve their goals.</p>
            <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-8 py-4 rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 text-lg">
              Start for Free <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-sora font-semibold text-sm text-foreground">LifeBoard AI</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#focus" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Focus</a>
                <a href="#ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI</a>
              </div>
              <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LifeBoard AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
