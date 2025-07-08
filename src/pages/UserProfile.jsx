import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { supabase } from '../utils/supabase';

const { FiArrowLeft, FiUser, FiDownload, FiTrash2, FiEdit } = FiIcons;

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchUserProfile();
    fetchUserDesigns();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designs:', error);
      } else {
        setDesigns(data || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteDesign = async (designId) => {
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) {
        console.error('Error deleting design:', error);
      } else {
        setDesigns(prev => prev.filter(d => d.id !== designId));
      }
    } catch (error) {
      console.error('Error deleting design:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </motion.button>
          
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          Sign Out
        </motion.button>
      </motion.header>

      {/* Profile Info */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiUser} className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {profile?.full_name || user.email}
            </h2>
            <p className="text-white/70">{user.email}</p>
            <p className="text-white/50 text-sm">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{designs.length}</div>
            <div className="text-white/70 text-sm">Designs Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {designs.filter(d => d.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-white/70 text-sm">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {designs.filter(d => d.downloads > 0).length}
            </div>
            <div className="text-white/70 text-sm">Downloaded</div>
          </div>
        </div>
      </motion.div>

      {/* Designs Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Your Designs</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        ) : designs.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            <p className="text-white/70 mb-4">You haven't created any designs yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create Your First Design
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <motion.div
                key={design.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-sm">
                    {design.type?.toUpperCase() || 'DESIGN'}
                  </span>
                </div>
                
                <h4 className="text-white font-semibold mb-2 truncate">
                  {design.title || design.prompt || 'Untitled Design'}
                </h4>
                
                <p className="text-white/70 text-sm mb-4">
                  {new Date(design.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                    >
                      <SafeIcon icon={FiDownload} className="text-sm" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                    >
                      <SafeIcon icon={FiEdit} className="text-sm" />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteDesign(design.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                  >
                    <SafeIcon icon={FiTrash2} className="text-sm" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default UserProfile;