import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import NotesPage from './pages/NotesPage';
import FocusPage from './pages/FocusPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/auth/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Sign Up',
    path: '/auth/signup',
    element: <SignupPage />,
    public: true,
  },
  {
    name: 'Onboarding',
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Tasks',
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    name: 'Habits',
    path: '/habits',
    element: <HabitsPage />,
  },
  {
    name: 'Notes',
    path: '/notes',
    element: <NotesPage />,
  },
  {
    name: 'Focus',
    path: '/focus',
    element: <FocusPage />,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    public: true,
  },
];
