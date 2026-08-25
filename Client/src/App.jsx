import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';

/*
  Future pages can be added here:
  import Projects from './pages/Projects';
  import Freelancers from './pages/Freelancers';
  import HowItWorksPage from './pages/HowItWorksPage';
  import SignIn from './pages/SignIn';
  import SignUp from './pages/SignUp';
*/

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* 
        Future routes — uncomment when pages are built:
        <Route path="/projects" element={<Projects />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      */}

      {/* Catch-all — redirect to home for now */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;