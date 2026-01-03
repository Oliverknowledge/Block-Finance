import './index.css';
import './App.css';

import { Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TradingProvider } from './context/TradingContext';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Stake from './pages/Stake';
import WalletDashboard from './pages/WalletDashboard';
import Leaderboard from './pages/Leaderboard';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="px-8 py-6">Checking session...</div>;
  }
  if (!user) {
    return <Navigate to="/Account" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TradingProvider>
          <>
            <Navbar />
            <main className="mt-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/Dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Trade"
                  element={
                    <ProtectedRoute>
                      <Trade />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Stake"
                  element={
                    <ProtectedRoute>
                      <Stake />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Wallet-Dashboard"
                  element={
                    <ProtectedRoute>
                      <WalletDashboard/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Leaderboard"
                  element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path = "/Onboarding"
                  element = {
                    <ProtectedRoute>
                      <Onboarding/>
                    </ProtectedRoute>
                  }
                  />
                <Route path="/Account" element={<Account />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        </TradingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

