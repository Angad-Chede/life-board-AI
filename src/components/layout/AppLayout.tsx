import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isFocusMode = location.pathname === '/focus';

  return (
    <div className="flex min-h-screen w-full gradient-bg">
      {!isFocusMode && <Sidebar />}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {!isFocusMode && (
          <div className="lg:hidden fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 ${isFocusMode ? '' : 'pb-24 lg:pb-8'}`}>
          {children}
        </main>
      </div>
      {!isFocusMode && <BottomNav />}
    </div>
  );
}
