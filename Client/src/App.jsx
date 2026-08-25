// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Main Route */}
      <Route path="/auth/:mode" element={<Auth />} />
      <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />

      {/* Aliases for direct /signin and /signup links */}
      <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
      <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

      {/* Future routes (uncomment when created) */}
      {/* 
      <Route path="/projects" element={<Projects />} />
      <Route path="/freelancers" element={<Freelancers />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} /> 
      */}

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;