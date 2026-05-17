import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import AppLayout from '@/components/layout/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed_today: boolean;
  last_completed: string | null;
  weekly_log: Record<string, boolean>;
  created_at: string;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00'); // avoid timezone shift
  return d.toLocaleDateString('en-US', { weekday: 'narrow' });
}

/** If a habit's last_completed date is before today, reset completed_today to false */
function applyDailyReset(habit: Habit): Habit {
  const today = new Date().toISOString().split('T')[0];
  if (habit.completed_today && habit.last_completed !== today) {
    return { ...habit, completed_today: false };
  }
  return habit;
}

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchHabits();
  }, [user]);

  async function fetchHabits() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchHabits error:', error);
        toast.error(`Failed to load habits: ${error.message}`);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const mapped = (Array.isArray(data) ? data : []).map((h) => {
          const habit: Habit = {
            ...h,
            weekly_log: (h.weekly_log as Record<string, boolean>) || {},
          };
          return applyDailyReset(habit);
        });

        // Push daily resets back to the DB for habits that need it
        const toReset = mapped.filter(
          (h, i) =>
            (data as Habit[])[i].completed_today === true && !h.completed_today
        );
        if (toReset.length > 0) {
          await Promise.all(
            toReset.map((h) =>
              supabase
                .from('habits')
                .update({ completed_today: false })
                .eq('id', h.id)
                .eq('user_id', user.id)
            )
          );
        }

        setHabits(mapped);
      }
    } catch (err) {
      console.error('fetchHabits exception:', err);
      toast.error('Habits table may not be set up yet. See console for details.');
    } finally {
      setLoading(false);
    }
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabitName.trim() || !user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('habits')
      .insert({
        name: newHabitName.trim(),
        user_id: user.id,
        streak: 0,
        completed_today: false,
        last_completed: null,
        weekly_log: { [today]: false },
      })
      .select()
      .single();

    if (error || !data) {
      console.error('addHabit error:', error);
      toast.error(error ? `Failed to add habit: ${error.message}` : 'Failed to add habit');
      return;
    }
    setHabits((prev) => [
      { ...data, weekly_log: (data.weekly_log as Record<string, boolean>) || { [today]: false } } as Habit,
      ...prev,
    ]);
    setNewHabitName('');
    toast.success('Habit added!');
  }

  async function toggleHabit(
    id: string,
    completedToday: boolean,
    streak: number,
    weeklyLog: Record<string, boolean>
  ) {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = !completedToday;
    const newStreak = newCompleted ? streak + 1 : Math.max(0, streak - 1);
    const newLog = { ...weeklyLog, [today]: newCompleted };

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completed_today: newCompleted,
              streak: newStreak,
              last_completed: newCompleted ? today : h.last_completed,
              weekly_log: newLog,
            }
          : h
      )
    );

    const { error } = await supabase
      .from('habits')
      .update({
        completed_today: newCompleted,
        streak: newStreak,
        last_completed: newCompleted ? today : null,
        weekly_log: newLog,
      })
      .eq('id', id)
      .eq('user_id', user.id); // RLS-safe: include user_id

    if (error) {
      console.error('toggleHabit error:', error);
      toast.error(`Failed to update habit: ${error.message}`);
      // Revert optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                completed_today: completedToday,
                streak,
                weekly_log: weeklyLog,
              }
            : h
        )
      );
    }
  }

  async function deleteHabit(id: string) {
    if (!user) return;
    // Optimistic update
    setHabits((prev) => prev.filter((h) => h.id !== id));

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // RLS-safe

    if (error) {
      console.error('deleteHabit error:', error);
      toast.error(`Failed to delete habit: ${error.message}`);
      fetchHabits(); // re-fetch to restore state
    } else {
      toast.success('Habit deleted');
    }
  }

  const last7Days = useMemo(() => getLast7Days(), []);

  const totalHabits = habits.length;
  const avgCompletion =
    totalHabits > 0
      ? Math.round(
          (habits.filter((h) => h.completed_today).length / totalHabits) * 100
        )
      : 0;

  return (
    <AppLayout>
      <PageMeta title="Habits — LifeBoard AI" description="Track your habits." />
      <div className="max-w-3xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-sora text-2xl font-bold text-foreground">Habits</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Build consistency one day at a time.
            </p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-6 text-sm"
        >
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold text-foreground">{totalHabits}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Today's completion: </span>
            <span className="font-semibold text-foreground">{avgCompletion}%</span>
          </div>
        </motion.div>

        {/* Add Habit Inline */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={addHabit}
          className="flex gap-3"
        >
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new habit..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={!newHabitName.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </motion.form>

        {/* Habits List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <Circle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No habits yet. Create your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border hover:bg-card/80 transition-colors"
              >
                {/* Check-in */}
                <button
                  onClick={() =>
                    toggleHabit(habit.id, habit.completed_today, habit.streak, habit.weekly_log)
                  }
                  className="shrink-0"
                  aria-label={habit.completed_today ? 'Mark incomplete' : 'Mark complete'}
                >
                  {habit.completed_today ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/30 hover:text-primary transition-colors" />
                  )}
                </button>

                {/* Name + Streak */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {habit.streak > 0 ? `${habit.streak} day streak` : 'Start your streak today'}
                  </p>
                </div>

                {/* 7-Day Dots */}
                <div className="flex items-center gap-1.5 shrink-0" title="Last 7 days">
                  {last7Days.map((day) => {
                    const done = habit.weekly_log[day] === true;
                    return (
                      <div
                        key={day}
                        className={`w-2.5 h-2.5 rounded-full ${
                          done ? 'bg-emerald-400' : 'bg-muted-foreground/15'
                        }`}
                        title={`${getDayLabel(day)}: ${done ? 'Done' : 'Missed'}`}
                      />
                    );
                  })}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
