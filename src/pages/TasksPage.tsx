import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Pencil,
  CheckSquare,
  Square,
  X,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import AppLayout from '@/components/layout/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

type FilterTab = 'All' | 'Today' | 'Completed' | 'High Priority';

const tabs: FilterTab[] = ['All', 'Today', 'Completed', 'High Priority'];

const priorityColor: Record<string, string> = {
  high: 'text-rose-600',
  medium: 'text-amber-600',
  low: 'text-emerald-600',
};

const priorityBg: Record<string, string> = {
  high: 'bg-rose-50',
  medium: 'bg-amber-50',
  low: 'bg-emerald-50',
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterTab>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [user]);

  async function fetchTasks() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        toast.error('Failed to load tasks');
      } else {
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch {
      // Table may not exist yet
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    switch (filter) {
      case 'Today':
        return tasks.filter((t) => t.due_date === today && !t.completed);
      case 'Completed':
        return tasks.filter((t) => t.completed);
      case 'High Priority':
        return tasks.filter((t) => t.priority === 'high' && !t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  function openDrawer(task?: Task) {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingTask(null);
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
    };

    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', editingTask.id);
      if (error) {
        toast.error('Failed to update task');
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...payload } : t))
      );
      toast.success('Task updated');
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...payload, user_id: user.id, completed: false })
        .select()
        .single();
      if (error || !data) {
        toast.error('Failed to add task');
        return;
      }
      setTasks((prev) => [data as Task, ...prev]);
      toast.success('Task added');
    }
    closeDrawer();
  }

  async function toggleTask(id: string, completed: boolean) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update task');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete task');
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
  }

  return (
    <AppLayout>
      <PageMeta title="Tasks — LifeBoard AI" description="Manage your tasks." />
      <div className="max-w-3xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-sora text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize your work and track what matters.</p>
          </div>
          <button
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-1 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Task List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tasks in this view.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border hover:bg-card/80 transition-colors"
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${priorityBg[task.priority] || 'bg-muted'} ${priorityColor[task.priority] || 'text-muted-foreground'}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <button
                      onClick={() => openDrawer(task)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-background border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sora text-lg font-semibold text-foreground">
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </h2>
                  <button onClick={closeDrawer} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={saveTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" /> {editingTask ? 'Update Task' : 'Add Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
