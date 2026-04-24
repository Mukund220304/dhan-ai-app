import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpenseManager from './pages/ExpenseManager';
import ChatInterface from './pages/ChatInterface';
import Settings from './pages/Settings';

import Forecast from './pages/Forecast';
import AIExtract from './pages/AIExtract';
import GoalPlanner from './pages/GoalPlanner';

function AppShell() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navbar />}
      <main style={{ flex: 1, minHeight: '100vh', padding: user ? '32px' : '0', maxWidth: user ? '1400px' : '100%', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/forecast" element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><ExpenseManager /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalPlanner /></ProtectedRoute>} />
          <Route path="/extract" element={<ProtectedRoute><AIExtract /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AppShell />
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
