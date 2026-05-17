import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" description="The page does not exist." />
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-sora text-7xl font-bold text-violet-600">404</p>
          <h1 className="font-sora text-xl font-semibold text-foreground mt-4">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-2">The page you are looking for does not exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </div>
    </>
  );
}
