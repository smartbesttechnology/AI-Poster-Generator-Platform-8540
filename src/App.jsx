import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DesignStudio from './pages/DesignStudio';
import UserProfile from './pages/UserProfile';
import AuthModal from './components/AuthModal';
import supabase from './lib/supabase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          setShowAuth(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
        <span className="ml-3 text-white">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                user={user} 
                onAuthClick={() => setShowAuth(true)} 
              />
            } 
          />
          <Route 
            path="/design/:type" 
            element={
              <DesignStudio 
                user={user} 
                onAuthClick={() => setShowAuth(true)} 
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <UserProfile user={user} />
            } 
          />
        </Routes>
        
        <AnimatePresence>
          {showAuth && (
            <AuthModal onClose={() => setShowAuth(false)} />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;