import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiInstagram, FiZap, FiDownload, FiUser, FiStar, FiTrendingUp } = FiIcons;

function LandingPage({ user, onAuthClick }) {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const features = [
    {
      icon: FiZap,
      title: "AI-Powered Design",
      description: "Generate stunning designs with simple prompts using advanced AI"
    },
    {
      icon: FiDownload,
      title: "Instant Download",
      description: "Download your creations immediately in high quality PNG/JPEG"
    },
    {
      icon: FiTrendingUp,
      title: "Smart Layouts",
      description: "AI suggests optimal layouts, fonts, and color schemes"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex justify-between items-center p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiZap} className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">PosterForge</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all"
            >
              <SafeIcon icon={FiUser} className="text-sm" />
              <span>Profile</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuthClick}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 text-white hover:bg-white/20 transition-all"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 py-16"
      >
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Create Stunning
            <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Designs
            </span>
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
          >
            Generate professional YouTube thumbnails and Instagram posts with AI. 
            No design skills required - just describe what you want!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 20, 147, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/design/youtube')}
              className="group flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <SafeIcon icon={FiPlay} className="text-xl group-hover:scale-110 transition-transform" />
              <span>Create YouTube Thumbnail</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/design/instagram')}
              className="group flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <SafeIcon icon={FiInstagram} className="text-xl group-hover:scale-110 transition-transform" />
              <span>Create Instagram Post</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center hover:bg-white/20 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={feature.icon} className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-white">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
              <h4 className="font-semibold mb-2">Choose Format</h4>
              <p className="text-white/70">Select YouTube thumbnail or Instagram post</p>
            </div>
            <div className="text-white">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
              <h4 className="font-semibold mb-2">Describe Your Vision</h4>
              <p className="text-white/70">Tell AI what you want in simple words</p>
            </div>
            <div className="text-white">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
              <h4 className="font-semibold mb-2">Download & Share</h4>
              <p className="text-white/70">Get your design instantly in high quality</p>
            </div>
          </div>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-center py-8 text-white/60"
      >
        <p>&copy; 2024 PosterForge. Powered by AI magic ✨</p>
      </motion.footer>
    </div>
  );
}

export default LandingPage;