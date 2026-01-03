import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../Components/Button';
import onboardCheck from '../utils/onboardcheck';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
type Mode = 'login' | 'signup';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    // Check if user exists before calling onboardCheck
    if (!user) return;
    
    // Call the onboardCheck function and update the onboarded state  
    onboardCheck(user).then(setOnboarded);
  
  }
, [user]);
  const handleSubmit = async (e: React.FormEvent) => {
    //e.preventDefault() stops the default action of the form submission (user just clicks submit button and the page reloads)
  e.preventDefault();
  // Clear previous messages error or success messages
  setError(null);
  setSuccess(null);
  // Indicate that the form is being submitted (loading state on)
  setSubmitting(true);
 
  let result;
  // Depending on the mode, it will either call the signin function and pass email and password or call the signup function and pass email, password and username
  if (mode === 'login') {
    result = await signIn(email.trim(), password.trim());
  } else {
    result = await signUp(
      email.trim(),
password.trim(),    
      username.trim(),
  );
  }
  // Handle the result of the authentication attempt
  if (result?.error) {
    setError(result.error);
  } else if (mode === 'signup') {
    setSuccess('Account created. Check your email inbox to confirm (if required).');
    setUsername('');
    setEmail('');
    setPassword('');
  }
  // Reset the submitting state (loading state off)
  setSubmitting(false);
};

  const handleSignOut = async () => {
    setError(null);
    setSuccess(null);
    return await signOut();
  };

  if (loading) {
    return (
      <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm ">
          Loading...
        </div>
      </div>
    );
  }

  if (user && onboarded) {
    return (
  <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[80vh]">
    <div className="max-w-3xl w-full rounded-2xl  p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:gap-10">
        
        {/* Left: Account Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-4">
            Account
          </h1>

          <p className="mb-2">
            You are logged in as{" "}
            <span className="font-medium">
              {user?.user_metadata.username}
            </span>.
          </p>

          <p className="mb-6">
            Any simulated trades you make will be associated with this account.
          </p>

          <Button
            onClick={handleSignOut}
            variant="primary"
            size="md"
            type="submit"
          >
            Log out
          </Button>
        </div>


        <div className="border border-gray-400 h-[30vh] " />

        {/* Right: Onboarding */}
        <div className="flex-1 mt-8 md:mt-0">
          <h2 className="text-2xl font-semibold mb-2">
            Onboarding
          </h2>

          <p className="mb-4">
            Onboarding helps the platform adapt to your skill level.
          </p>

          <div className="flex items-center gap-2 font-medium">
            <Check className="text-green-600" />
            <span>Onboarding complete!</span>
          </div>
        </div>

      </div>
    </div>
  </div>
      );
    }
    else if (user && !onboarded) {
      return (
        <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-4xl w-full rounded-2xl   p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:gap-10">
            
            {/* Left: Account Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-4">
                Account
              </h1>
    
              <p className="mb-2">
                You are logged in as{" "}
                <span className="font-medium">
                  {user?.user_metadata.username}
                </span>.
              </p>  
    
              <p className="mb-6">
                Any simulated trades you make will be associated with this account.
              </p>
    
              <Button
                onClick={handleSignOut}
                variant="primary"
                size="md"
                type="submit"
              >
                Log out
              </Button>
            </div>
          <div className="border border-gray-400 h-[30vh] " />

{/* Right: No onboarding */}
<div className="flex-1 mt-8 md:mt-0 ">
  <h2 className="text-2xl font-semibold mb-2">
    Onboarding
  </h2>

  <p className="mb-4">
    Onboarding helps the platform adapt to your skill level.
  </p>

  <div className="flex  flex-col justify-center gap-2 font-medium">
    
      <div className = "flex flex-row">
    <X className="text-red-600" />
    <span>Onboarding incomplete!</span>
    </div>
    <Button type = "button" variant = "green" size = "md"  onClick = {() => navigate("/onboarding")} className = "w-[10rem]">Onboard</Button>
  </div>
</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="px-6 md:px-10 pb-10 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl w-full rounded-2xl   p-6 md:p-8">
        <h1 className="text-3xl font-semibold mb-4 ">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm md:text-base  mb-6">
          {mode === 'login' ? 'Use email and password to access trading, portfolio and leaderboard features.' :
            'Sign up with email and password to start trading, building your portfolio and climbing the leaderboard!'}
        </p>
        <div className="flex  mb-4 w-full">
          <Button
            type="button"
            onClick={() => setMode('login')}
             variant = {`${mode === 'login' ? 'secondary' : 'primary'}`}
            size='md'
            className = "w-1/2"
          >
            Log in
          </Button>
          <Button
            type="button"
            onClick={() => setMode('signup')}
            variant = {`${mode === 'login' ? 'primary' : 'secondary'}`}
            size='md'
            className = "w-1/2"
          >
            Sign up
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            {mode === 'signup' && (
              <>
                <label className="text-sm font-medium ">
                  Username
                </label>
                <input
                  type="text"
                  className="border rounded-md px-3 py-2   "
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </>
            )
            }
            <label className="text-sm font-medium ">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2   "
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium ">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md px-3 py-2   "
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            variant = "primary"
            size='md'
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


