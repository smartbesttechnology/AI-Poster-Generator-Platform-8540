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
  const [loading, setLoading] = useState(false); // Changed to false to avoid unnecessary loading screen
  const [showAuth, setShowAuth] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check if we have a valid Supabase connection
    const checkConnection = async () => {
      try {
        // Simple check to see if Supabase is configured
        const { error } = await supabase.auth.getSession();
        setSupabaseConnected(!error);
      } catch (error) {
        console.log('Supabase not connected yet');
        setSupabaseConnected(false);
      }
      setLoading(false);
    };
    
    checkConnection();

    // Set up auth state listener only if properly connected
    if (supabaseConnected) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
          if (event === 'SIGNED_IN') {
            setShowAuth(false);
          }
        }
      );
      
      return () => {
        try {
          subscription?.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth changes:', error);
        }
      };
    }
  }, [supabaseConnected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
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
          {showAuth && supabaseConnected && (
            <AuthModal onClose={() => setShowAuth(false)} />
          )}
          
          {/* Show connect modal if trying to authenticate but not connected */}
          {showAuth && !supabaseConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAuth(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Supabase Not Connected
                </h2>
                <p className="mb-4">
                  Authentication requires a Supabase connection. Please connect your Supabase project first.
                </p>
                <button
                  onClick={() => setShowAuth(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;