import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Repeat,
  StickyNote,
  Focus,
  Brain,
  Zap,
  BarChart3,
  Clock,
  ChevronRight,
  Play,
  Pin,
  Sun,
  Moon,
  Sunrise,
  Plus,
  TrendingUp,
  Target,
  FileText,
  Calendar,
  ArrowRight,
  Flame,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import AppLayout from '@/components/layout/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { fetchAIInsights, isInsightsConfigured } from '@/services/insightsService';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  due_date: string | null;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed_today: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
}

interface Insight {
  icon: typeof Zap;
  text: string;
  color: string;
  bgColor: string;
}

const fallbackInsights: Insight[] = [
  { icon: Zap, text: 'Your productivity peaks at 10 AM — schedule deep work then.', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { icon: BarChart3, text: 'You complete 23% more tasks when using Focus Mode.', color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { icon: Clock, text: 'Consider breaking large tasks into 25-minute chunks.', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour < 6) return Moon;
  if (hour < 12) return Sunrise;
  if (hour < 18) return Sun;
  return Moon;
}

/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [insights, setInsights] = useState<Insight[]>(fallbackInsights);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsTimestamp, setInsightsTimestamp] = useState<number | null>(null);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [apiUsage, setApiUsage] = useState({ calls: 0, max: 4, limitReached: false });
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const greeting = getGreeting();
  const GreetingIcon = getGreetingIcon();

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchData(currentUser: typeof user) {
      if (!currentUser) return;
      try {
        const [profileRes, tasksRes, habitsRes, notesRes] = await Promise.all([
          supabase.from('users').select('user_type').eq('id', currentUser.id).maybeSingle(),
          supabase.from('tasks').select('id, title, completed, priority, due_date').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(8),
          supabase.from('habits').select('id, name, streak, completed_today').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(6),
          supabase.from('notes').select('id, title, content, pinned').eq('user_id', currentUser.id).eq('pinned', true).order('updated_at', { ascending: false }).limit(3),
        ]);
        if (profileRes.data) setUserType(profileRes.data.user_type || 'General');
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setHabits(Array.isArray(habitsRes.data) ? habitsRes.data : []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      } catch { /* tables may not exist yet */ } finally { setLoading(false); }
    }
    fetchData(user);
  }, [user]);

  // ── AI Insights fetching ──
  const loadInsights = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    setInsightsLoading(true);
    try {
      const taskSummary = {
        total: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
        overdue: tasks.filter((t) => {
          if (!t.due_date || t.completed) return false;
          return new Date(t.due_date) < new Date();
        }).length,
        titles: tasks.map((t) => t.title),
      };
      const habitSummary = {
        total: habits.length,
        completedToday: habits.filter((h) => h.completed_today).length,
        streaks: habits.map((h) => h.streak),
        names: habits.map((h) => h.name),
      };

      const result = await fetchAIInsights(taskSummary, habitSummary, forceRefresh);

      if (result && result.insights.length > 0) {
        const mapped: Insight[] = result.insights.map((text: string, i: number) => ({
          icon: [Zap, BarChart3, Clock][i % 3],
          text,
          color: ['text-violet-600', 'text-sky-600', 'text-emerald-600'][i % 3],
          bgColor: ['bg-violet-50', 'bg-sky-50', 'bg-emerald-50'][i % 3],
        }));
        setInsights(mapped);
        setInsightsTimestamp(result.generatedAt);
        setIsAiPowered(true);
        setApiUsage({
          calls: result.apiCallsToday,
          max: result.maxCallsPerDay,
          limitReached: result.limitReached,
        });
      } else {
        setInsights(fallbackInsights);
        setIsAiPowered(false);
      }
    } catch {
      setInsights(fallbackInsights);
      setIsAiPowered(false);
    } finally {
      setInsightsLoading(false);
    }
  }, [user, tasks, habits]);

  // Fetch on data load
  useEffect(() => {
    if (tasks.length > 0 || habits.length > 0) loadInsights(false);
  }, [tasks.length, habits.length, loadInsights]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (!user) return;
    refreshTimerRef.current = setInterval(() => {
      if (tasks.length > 0 || habits.length > 0) loadInsights(true);
    }, 30 * 60 * 1000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user, tasks.length, habits.length, loadInsights]);

  async function toggleTask(id: string, completed: boolean) {
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
  }

  async function toggleHabit(id: string, completedToday: boolean, streak: number) {
    const newStreak = completedToday ? Math.max(0, streak - 1) : streak + 1;
    await supabase.from('habits').update({ completed_today: !completedToday, streak: newStreak }).eq('id', id);
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completed_today: !completedToday, streak: newStreak } : h)));
  }

  const todayTasks = useMemo(() => tasks.slice(0, 5), [tasks]);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completed_today).length;
  const topStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  /* ---------- loading state ---------- */
  if (loading) {
    return (
      <AppLayout>
        <PageMeta title="Dashboard — LifeBoard AI" description="Your productivity overview." />
        <div className="dashboard-shell"><LoadingSkeleton lines={2} /><LoadingSkeleton lines={4} /><LoadingSkeleton lines={3} /></div>
      </AppLayout>
    );
  }

  /* ---------- render ---------- */
  return (
    <AppLayout>
      <PageMeta title="Dashboard — LifeBoard AI" description="Your productivity overview." />

      <div className="dashboard-shell">
        {/* ===== GREETING HEADER ===== */}
        <motion.header
          className="dash-greeting"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="dash-greeting__left">
            <p className="dash-greeting__label">
              <GreetingIcon className="dash-greeting__icon" />
              {greeting}
            </p>
            <h1 className="dash-greeting__name">
              Hi {name} <span className="dash-greeting__wave" aria-hidden="true" />
            </h1>
            <p className="dash-greeting__meta">
              {completedTasks} tasks done
              <span className="dash-greeting__sep" />
              {completedHabits}/{totalHabits} habits today
              {userType && (
                <>
                  <span className="dash-greeting__sep" />
                  {userType}
                </>
              )}
            </p>
          </div>

          <div className="dash-greeting__actions">
            <button
              onClick={() => navigate('/focus')}
              className="dash-btn dash-btn--primary"
            >
              <Play className="dash-btn__icon" /> Start Focus
            </button>
          </div>
        </motion.header>

        {/* ===== QUICK STATS ===== */}
        <motion.div
          className="dash-stats"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon dash-stat-card__icon--violet">
              <Target className="w-5 h-5" />
            </div>
            <div className="dash-stat-card__body">
              <span className="dash-stat-card__value">{tasks.length}</span>
              <span className="dash-stat-card__label">Total Tasks</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon dash-stat-card__icon--emerald">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="dash-stat-card__body">
              <span className="dash-stat-card__value">{completedTasks}</span>
              <span className="dash-stat-card__label">Completed</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon dash-stat-card__icon--sky">
              <Repeat className="w-5 h-5" />
            </div>
            <div className="dash-stat-card__body">
              <span className="dash-stat-card__value">{totalHabits}</span>
              <span className="dash-stat-card__label">Active Habits</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon dash-stat-card__icon--amber">
              <Flame className="w-5 h-5" />
            </div>
            <div className="dash-stat-card__body">
              <span className="dash-stat-card__value">{topStreak}</span>
              <span className="dash-stat-card__label">Best Streak</span>
            </div>
          </div>
        </motion.div>

        {/* ===== MAIN GRID (2-col on large) ===== */}
        <div className="dash-grid">
          {/* ---------- LEFT COLUMN ---------- */}
          <div className="dash-grid__col">
            {/* Today's Tasks */}
            <motion.section
              className="dash-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
            >
              <div className="dash-card__header">
                <div className="dash-card__header-left">
                  <div className="dash-card__icon-wrap dash-card__icon-wrap--violet">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h2 className="dash-card__title">My Tasks</h2>
                  <span className="dash-card__badge">{completedTasks}/{tasks.length}</span>
                </div>
                <Link to="/tasks" className="dash-card__link">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayTasks.length === 0 ? (
                <div className="dash-card__empty">
                  <img
                    src="/images/illustrations/tasks.png"
                    alt=""
                    className="dash-card__empty-img"
                  />
                  <p className="dash-card__empty-text">No tasks yet</p>
                  <Link to="/tasks" className="dash-btn dash-btn--ghost dash-btn--sm">
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </Link>
                </div>
              ) : (
                <ul className="dash-task-list">
                  {todayTasks.map((task) => (
                    <li key={task.id} className="dash-task-item">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="dash-task-check"
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-[18px] h-[18px] text-violet-600" />
                        ) : (
                          <div className="dash-task-check__box" />
                        )}
                      </button>
                      <span className={`dash-task-title ${task.completed ? 'dash-task-title--done' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`dash-priority dash-priority--${task.priority}`}>
                        {task.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="dash-progress">
                  <div className="dash-progress__bar">
                    <div
                      className="dash-progress__fill"
                      style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="dash-progress__text">
                    {Math.round((completedTasks / tasks.length) * 100)}% complete
                  </span>
                </div>
              )}
            </motion.section>

            {/* Pinned Notes */}
            <motion.section
              className="dash-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              <div className="dash-card__header">
                <div className="dash-card__header-left">
                  <div className="dash-card__icon-wrap dash-card__icon-wrap--amber">
                    <Pin className="w-4 h-4" />
                  </div>
                  <h2 className="dash-card__title">Pinned Notes</h2>
                </div>
                <Link to="/notes" className="dash-card__link">
                  All notes <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {notes.length === 0 ? (
                <div className="dash-card__empty">
                  <img
                    src="/images/illustrations/notes.png"
                    alt=""
                    className="dash-card__empty-img"
                  />
                  <p className="dash-card__empty-text">No pinned notes</p>
                  <Link to="/notes" className="dash-btn dash-btn--ghost dash-btn--sm">
                    <Plus className="w-3.5 h-3.5" /> New Note
                  </Link>
                </div>
              ) : (
                <div className="dash-notes-grid">
                  {notes.map((note) => (
                    <Link
                      key={note.id}
                      to="/notes"
                      className="dash-note-card"
                    >
                      <FileText className="dash-note-card__icon" />
                      <div className="dash-note-card__body">
                        <p className="dash-note-card__title">{note.title}</p>
                        <p className="dash-note-card__excerpt">{note.content || 'No content'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* ---------- RIGHT COLUMN ---------- */}
          <div className="dash-grid__col">
            {/* Habits */}
            <motion.section
              className="dash-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              <div className="dash-card__header">
                <div className="dash-card__header-left">
                  <div className="dash-card__icon-wrap dash-card__icon-wrap--emerald">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <h2 className="dash-card__title">Habits</h2>
                  <span className="dash-card__badge">{completedHabits}/{totalHabits} today</span>
                </div>
                <Link to="/habits" className="dash-card__link">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {habits.length === 0 ? (
                <div className="dash-card__empty">
                  <img
                    src="/images/illustrations/habits.png"
                    alt=""
                    className="dash-card__empty-img"
                  />
                  <p className="dash-card__empty-text">No habits yet</p>
                  <Link to="/habits" className="dash-btn dash-btn--ghost dash-btn--sm">
                    <Plus className="w-3.5 h-3.5" /> Create Habit
                  </Link>
                </div>
              ) : (
                <ul className="dash-habit-list">
                  {habits.map((habit) => (
                    <li key={habit.id} className="dash-habit-item">
                      <div className="dash-habit-item__info">
                        <span className="dash-habit-item__name">{habit.name}</span>
                        <span className="dash-habit-item__streak">
                          <Flame className="w-3 h-3" /> {habit.streak}d
                        </span>
                      </div>
                      <button
                        onClick={() => toggleHabit(habit.id, habit.completed_today, habit.streak)}
                        className={`dash-habit-btn ${habit.completed_today ? 'dash-habit-btn--done' : ''}`}
                      >
                        {habit.completed_today ? 'Done' : 'Check in'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            {/* AI Insights */}
            <motion.section
              className="dash-card dash-card--insights"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.26 }}
            >
              <div className="dash-card__header">
                <div className="dash-card__header-left">
                  <div className="dash-card__icon-wrap dash-card__icon-wrap--violet">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h2 className="dash-card__title">AI Insights</h2>
                  {isAiPowered && (
                    <span className="dash-ai-badge">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                </div>
                <button
                  className="dash-refresh-btn"
                  onClick={() => loadInsights(true)}
                  disabled={insightsLoading}
                  title="Refresh insights"
                  aria-label="Refresh AI insights"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'dash-refresh-spin' : ''}`} />
                </button>
              </div>

              {insightsLoading ? (
                <LoadingSkeleton lines={3} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={insightsTimestamp ?? 'fallback'}
                    className="dash-insight-list"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    {insights.map((insight, i) => {
                      const Icon = insight.icon;
                      return (
                        <li key={i} className="dash-insight-item">
                          <div className={`dash-insight-icon ${insight.bgColor} ${insight.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="dash-insight-text">{insight.text}</p>
                        </li>
                      );
                    })}
                  </motion.ul>
                </AnimatePresence>
              )}

              {insightsTimestamp && (
                <div className="dash-insight-footer">
                  {isAiPowered && (
                    <span className={`dash-insight-usage ${apiUsage.limitReached ? 'dash-insight-usage--limit' : ''}`}>
                      {apiUsage.limitReached
                        ? `Limit reached (${apiUsage.calls}/${apiUsage.max}) — cycling saved`
                        : `Refreshes: ${apiUsage.calls}/${apiUsage.max}`}
                    </span>
                  )}
                  <p className="dash-insight-timestamp">
                    Updated {new Date(insightsTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {!isInsightsConfigured() && (
                <p className="dash-insight-notice">
                  Add your Gemini API key to .env.local for AI-powered insights
                </p>
              )}

              <img
                src="/images/illustrations/insights.png"
                alt=""
                className="dash-card__corner-art"
              />
            </motion.section>
          </div>
        </div>

        {/* ===== FOOTER QUICK ACTIONS ===== */}
        <motion.div
          className="dash-quick-nav"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32 }}
        >
          {[
            { to: '/tasks', icon: CheckSquare, label: 'Tasks', color: 'violet' },
            { to: '/habits', icon: Repeat, label: 'Habits', color: 'emerald' },
            { to: '/notes', icon: StickyNote, label: 'Notes', color: 'amber' },
            { to: '/focus', icon: Focus, label: 'Focus', color: 'sky' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`dash-quick-link dash-quick-link--${item.color}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </AppLayout>
  );
}
