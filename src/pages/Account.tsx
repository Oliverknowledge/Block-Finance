import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup';

const Account = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const action = mode === 'login' ? signIn : signUp;
    const { error: err } = await action(email.trim(), password.trim());

    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSuccess('Account created. Check your email inbox to confirm (if required).');
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setError(null);
    setSuccess(null);
    await signOut();
  };

  if (loading) {
    return (
      <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Checking session...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-xl w-full rounded-2xl bg-white shadow-sm border border-slate-200 p-6 md:p-8 dark:bg-slate-900 dark:border-slate-800">
          <h1 className="text-3xl font-semibold mb-4 ">
            Account
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-4">
            You are logged in as <span className="font-medium">{user.email}</span>.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Any simulated trades, portfolio values or leaderboard positions you implement
            can be linked to this Supabase user.
          </p>
          <button onClick={handleSignOut} className="btn btn-md btn-secondary">
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-xl w-full rounded-2xl  shadow-sm border border-slate-200 p-6 md:p-8">
        <h1 className="text-3xl font-semibold mb-4 ">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm md:text-base  mb-6">
          Use email and password via Supabase to access trading, portfolio and
          leaderboard features.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`btn btn-md ${
              mode === 'login' ? 'btn-primary' : 'btn-secondary'
            } flex-1`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`btn btn-md ${
              mode === 'signup' ? 'btn-primary' : 'btn-secondary'
            } flex-1`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2   dark:border-gray-700"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md px-3 py-2   dark:border-gray-700"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}

          <button
            type="submit"
            className="btn btn-md btn-primary w-full"
            disabled={submitting}
          >
            {submitting
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Log in'
                : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;


