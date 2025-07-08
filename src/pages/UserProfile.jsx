import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiArrowLeft, FiUser, FiDownload, FiTrash2, FiEdit, FiMenu, FiX } = FiIcons;

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
        .from('profiles_ai2024')
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
        .from('designs_ai2024')
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
        .from('designs_ai2024')
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

  const handleDownloadDesign = async (design) => {
    try {
      const { error } = await supabase
        .from('designs_ai2024')
        .update({ downloads: (design.downloads || 0) + 1 })
        .eq('id', design.id);

      if (error) {
        console.error('Error updating download count:', error);
      }

      setDesigns(prev => prev.map(d => 
        d.id === design.id 
          ? { ...d, downloads: (d.downloads || 0) + 1 }
          : d
      ));

      alert('Design download started!');
    } catch (error) {
      console.error('Error downloading design:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all"
            >
              <SafeIcon icon={FiArrowLeft} className="text-lg sm:text-xl" />
            </motion.button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Profile</h1>
          </div>

          {/* Desktop Sign Out */}
          <div className="hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all"
          >
            <SafeIcon icon={showMobileMenu ? FiX : FiMenu} className="text-xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden mt-4 overflow-hidden"
          >
            <button
              onClick={() => {
                handleSignOut();
                setShowMobileMenu(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </motion.header>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Info */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="text-white text-2xl sm:text-3xl" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {profile?.full_name || user.email}
                </h2>
                <p className="text-white/70 text-sm sm:text-base">{user.email}</p>
                <p className="text-white/50 text-xs sm:text-sm">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{designs.length}</div>
                <div className="text-white/70 text-xs sm:text-sm">Designs Created</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {designs.filter(d => new Date(d.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-white/70 text-xs sm:text-sm">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {designs.reduce((sum, d) => sum + (d.downloads || 0), 0)}
                </div>
                <div className="text-white/70 text-xs sm:text-sm">Total Downloads</div>
              </div>
            </div>
          </motion.div>

          {/* Designs Grid */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Your Designs</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full"
                />
              </div>
            ) : designs.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 sm:p-8 text-center">
                <p className="text-white/70 mb-4 text-sm sm:text-base">You haven't created any designs yet.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Create Your First Design
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {designs.map((design) => (
                  <motion.div
                    key={design.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all"
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {design.type?.toUpperCase() || 'DESIGN'}
                      </span>
                    </div>
                    
                    <h4 className="text-white font-semibold mb-2 truncate text-sm sm:text-base">
                      {design.title || design.prompt?.substring(0, 30) || 'Untitled Design'}
                    </h4>
                    
                    <p className="text-white/70 text-xs sm:text-sm mb-2">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                    
                    <p className="text-white/50 text-xs mb-4">
                      Downloads: {design.downloads || 0}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownloadDesign(design)}
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                          title="Download Design"
                        >
                          <SafeIcon icon={FiDownload} className="text-sm" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/design/${design.type}?edit=${design.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                          title="Edit Design"
                        >
                          <SafeIcon icon={FiEdit} className="text-sm" />
                        </motion.button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteDesign(design.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                        title="Delete Design"
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
      </div>
    </div>
  );
}

export default UserProfile;