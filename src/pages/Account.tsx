import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/Button';
import { useAuth } from '../hooks/useAuth';
import onboardCheck from '../utils/onboardcheck';
import fetchUserBadgeProgress from '../utils/userBadges';

type Mode = 'login' | 'signup';
type BadgePreview = {
  id: string;
  symbol: string;
  title: string;
  description: string;
  unlocked: boolean;
};
type BadgeSummary = {
  badges: BadgePreview[];
  xp: number;
  tradeCount: number;
};

const USERNAME_MIN = 6;
const USERNAME_MAX = 20;
const EMAIL_MIN = 8;
const EMAIL_MAX = 40;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

const initialBadgeSummary: BadgeSummary = {
  badges: [],
  xp: 0,
  tradeCount: 0,
};

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [onboarded, setOnboarded] = useState(false);
  const [badgeSummary, setBadgeSummary] = useState<BadgeSummary>(initialBadgeSummary);
  const [accountDetailsLoading, setAccountDetailsLoading] = useState(false);

  let unlockedBadgeCount = 0;
  for (const badge of badgeSummary.badges) {
    if (badge.unlocked) {
      unlockedBadgeCount += 1;
    }
  }

  useEffect(() => {
    if (!user) {
      setOnboarded(false);
      setBadgeSummary(initialBadgeSummary);
      setAccountDetailsLoading(false);
      return;
    }

    const loadAccountDetails = async () => {
      setAccountDetailsLoading(true);
      const nextOnboarded = await onboardCheck(user);
      const nextBadgeSummary = await fetchUserBadgeProgress(user);
      setOnboarded(nextOnboarded);
      setBadgeSummary({
        badges: nextBadgeSummary.badges,
        xp: nextBadgeSummary.xp,
        tradeCount: nextBadgeSummary.tradeCount,
      });
      setAccountDetailsLoading(false);
    };
    loadAccountDetails().catch((error) => {
      console.error('Error loading account details:', error);
      setAccountDetailsLoading(false);
    });
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
      if ((trimmedUsername.length < USERNAME_MIN || trimmedUsername.length > USERNAME_MAX ) && mode === 'signup') {
        setError(`Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters.`);
        setSubmitting(false);
        return;
      }
      if (trimmedEmail.length < EMAIL_MIN || trimmedEmail.length > EMAIL_MAX) {
        setError(`Email must be ${EMAIL_MIN}-${EMAIL_MAX} characters.`);
        setSubmitting(false);
        return;
      }
      if (trimmedPassword.length < PASSWORD_MIN || trimmedPassword.length > PASSWORD_MAX) {
        setError(`Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`);
        setSubmitting(false);
        return;
      }

      if (mode === 'signup'){
      if (trimmedPassword !== trimmedConfirmPassword) {
        setError('Passwords do not match.');
        setSubmitting(false);
        return;
      }
    }
    const result =
      mode === 'login'
        ? await signIn(trimmedEmail, trimmedPassword)
        : await signUp(trimmedEmail, trimmedPassword, trimmedUsername);

    if (result?.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setSuccess('Account created. Check your email inbox to confirm (if required).');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="px-6 md:px-10 pb-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold">Account</h1>
            <p className="text-sm md:text-base text-[var(--muted-text-color)]">
              Manage your profile, onboarding status and achievement badges.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 space-y-4">
              <h2 className="text-xl font-semibold">Profile</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Username:</span>{' '}
                  {user.user_metadata.username || user.email || 'User'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-[var(--border-color)] p-3">
                  <p className="text-xs text-[var(--muted-text-color)]">XP</p>
                  <p className="text-lg font-semibold">{badgeSummary.xp.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-[var(--border-color)] p-3">
                  <p className="text-xs text-[var(--muted-text-color)]">Trades</p>
                  <p className="text-lg font-semibold">{badgeSummary.tradeCount}</p>
                </div>
                <div className="rounded-lg border border-[var(--border-color)] p-3">
                  <p className="text-xs text-[var(--muted-text-color)]">Badges</p>
                  <p className="text-lg font-semibold">{unlockedBadgeCount}/5</p>
                </div>
              </div>
              <div>
                <Button onClick={handleSignOut} variant="primary" size="md" type="button">
                  Log out
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 space-y-4">
              <h2 className="text-xl font-semibold">Onboarding</h2>
              <p className="text-sm text-[var(--muted-text-color)]">
                Onboarding helps adapt chart and trading assistance to your experience level.
              </p>
              {onboarded ? (
                <div className="flex items-center gap-2 font-medium text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Onboarding complete</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-medium text-red-600">
                    <X className="h-5 w-5" />
                    <span>Onboarding incomplete</span>
                  </div>
                  <Button
                    type="button"
                    variant="green"
                    size="md"
                    onClick={() => navigate('/onboarding')}
                  >
                    Start Onboarding
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Badges</h2>
              <p className="text-xs text-[var(--muted-text-color)]">{unlockedBadgeCount}/5 unlocked</p>
            </div>

            {accountDetailsLoading ? (
              <p className="text-sm text-[var(--muted-text-color)]">Loading badges...</p>
            ) : badgeSummary.badges.length === 0 ? (
              <p className="text-sm text-[var(--muted-text-color)]">No badges yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {badgeSummary.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-md border p-3 ${
                      badge.unlocked
                        ? 'border-[var(--border-color)] bg-[var(--surface-color)]'
                        : 'border-[var(--border-color)] bg-[var(--muted-surface-color)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold ${
                          badge.unlocked
                            ? 'bg-[var(--muted-surface-color)] text-[var(--text-color)]'
                            : 'bg-[var(--surface-color)] text-[var(--muted-text-color)]'
                        }`}
                      >
                        {badge.unlocked ? badge.symbol : '?'}
                      </span>
                      <p className="text-sm font-semibold">
                        {badge.unlocked ? badge.title : 'Undiscovered Badge'}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted-text-color)]">
                      {badge.unlocked
                        ? badge.description
                        : 'Keep trading and earning XP to reveal this badge.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-8">
        <h1 className="text-3xl font-semibold mb-4">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm md:text-base text-[var(--muted-text-color)] mb-6">
          {mode === 'login'
            ? 'Use email and password to access trading, portfolio and leaderboard features.'
            : 'Sign up with email and password to start trading, building your portfolio and climbing the leaderboard.'}
        </p>

        <div className="flex mb-4 w-full">
          <Button
            type="button"
            onClick={() => setMode('login')}
            variant={`${mode === 'login' ? 'secondary' : 'primary'}`}
            size="md"
            className="w-1/2"
          >
            Log in
          </Button>
          <Button
            type="button"
            onClick={() => setMode('signup')}
            variant={`${mode === 'login' ? 'primary' : 'secondary'}`}
            size="md"
            className="w-1/2"
          >
            Sign up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                className="border rounded-md px-3 py-2"
                placeholder="6-20 characters"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={USERNAME_MIN}
                maxLength={USERNAME_MAX}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border rounded-md px-3 py-2"
              placeholder="you@example.com"
              minLength={mode === 'signup' ? EMAIL_MIN : undefined}
              maxLength={mode === 'signup' ? EMAIL_MAX : undefined}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border rounded-md px-3 py-2"
              placeholder={mode === 'signup' ? '8-16 characters' : 'Your password'}
              required
              minLength={mode === 'signup' ? PASSWORD_MIN : 1}
              maxLength={mode === 'signup' ? PASSWORD_MAX : undefined}
            />
          </div>

          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="border rounded-md px-3 py-2"
                placeholder="Re-enter (8-16 chars)"
                required
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="md"
          >
            {submitting
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Log in'
                : 'Sign up'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Account;
