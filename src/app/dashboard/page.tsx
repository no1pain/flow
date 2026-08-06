import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Welcome to Flow</h1>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Logged in as:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Your authentication is working! You can now start building your workspace management
              features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
