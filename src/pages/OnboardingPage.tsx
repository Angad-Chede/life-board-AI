import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Briefcase, PenTool, Code, User, Sparkles, ChevronRight, ChevronLeft, Clock, Zap, Timer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';

const userTypes = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Balancing classes, assignments, and deadlines' },
  { id: 'freelancer', label: 'Freelancer', icon: Briefcase, desc: 'Managing multiple clients and projects' },
  { id: 'creator', label: 'Creator', icon: PenTool, desc: 'Creating content and managing creative workflows' },
  { id: 'developer', label: 'Developer', icon: Code, desc: 'Shipping code and managing sprints' },
  { id: 'general', label: 'General', icon: User, desc: 'Just want to get more organized' },
];

const productivityGoals = [
  'Deep Work',
  'Habit Building',
  'Task Clarity',
  'Time Blocking',
  'Creative Flow',
];

const focusStyles = [
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer, desc: '25 min work + 5 min break' },
  { id: 'flow', label: 'Flow State', icon: Zap, desc: 'Continuous deep work session' },
  { id: 'timeboxing', label: 'Time Boxing', icon: Clock, desc: 'Fixed blocks for each task' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const canProceed = () => {
    if (step === 0) return !!selectedType;
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return !!selectedFocus;
    return false;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      user_type: selectedType,
      productivity_goals: selectedGoals,
      focus_style: selectedFocus,
      email: user.email,
      created_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to save preferences. Please try again.');
      setSaving(false);
      return;
    }

    toast.success('Setup complete! Welcome to LifeBoard AI.');
    navigate('/dashboard');
  };

  const steps = [
    {
      title: 'What best describes you?',
      subtitle: 'This helps us personalize your experience',
    },
    {
      title: 'What are your productivity goals?',
      subtitle: 'Select all that apply',
    },
    {
      title: 'How do you prefer to focus?',
      subtitle: 'Choose your default focus style',
    },
  ];

  return (
    <>
      <PageMeta title="Onboarding — LifeBoard AI" description="Complete your setup to get started." />
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="glass-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-sora font-semibold text-lg text-foreground">LifeBoard AI</span>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="mb-6">
              <h1 className="font-sora text-xl font-bold text-foreground text-balance">{steps[step].title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{steps[step].subtitle}</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background/40 hover:bg-background/60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-wrap gap-3"
                >
                  {productivityGoals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background/40 text-foreground hover:bg-background/60'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {focusStyles.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedFocus === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedFocus(style.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background/40 hover:bg-background/60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{style.label}</p>
                          <p className="text-xs text-muted-foreground">{style.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!canProceed() || saving}
                  className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Get Started'} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
