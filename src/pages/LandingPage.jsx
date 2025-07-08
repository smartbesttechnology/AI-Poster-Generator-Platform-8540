import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { generateDesign } from '../utils/aiService';
import supabase from '../lib/supabase';

const { FiZap, FiImage, FiUpload, FiDownload, FiEdit, FiUser, FiYoutube, FiRefreshCw, FiCheck, FiMenu, FiX } = FiIcons;

function LandingPage({ user, onAuthClick }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designType, setDesignType] = useState('auto');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showYoutubeDownloader, setShowYoutubeDownloader] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef(null);

  const determineDesignType = (promptText) => {
    const lowerPrompt = promptText.toLowerCase();
    if (lowerPrompt.includes('youtube') || lowerPrompt.includes('thumbnail') || lowerPrompt.includes('video')) {
      return 'youtube';
    } else if (lowerPrompt.includes('instagram') || lowerPrompt.includes('post') || lowerPrompt.includes('square')) {
      return 'instagram';
    } else if (lowerPrompt.includes('quote') || lowerPrompt.includes('text') || lowerPrompt.includes('saying')) {
      return 'quote';
    }
    return 'instagram';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setDesigns([]);
    setSelectedDesign(null);
    
    try {
      const type = designType === 'auto' ? determineDesignType(prompt) : designType;
      const designPromises = Array(4).fill().map((_, i) => generateDesign(prompt, type, i));
      const generatedDesigns = await Promise.all(designPromises);
      setDesigns(generatedDesigns);
      
      if (generatedDesigns.length > 0) {
        setSelectedDesign(generatedDesigns[0]);
      }
    } catch (error) {
      console.error('Error generating designs:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setPrompt(prompt => prompt + " (based on uploaded image)");
      handleGenerate();
    };
    reader.readAsDataURL(file);
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) return;
    
    setIsDownloading(true);
    try {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i)?.[1];
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      const thumbnails = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`
      ];
      
      if (user) {
        await supabase.from('youtube_downloads_ai2024').insert({
          user_id: user.id,
          youtube_id: videoId,
          thumbnail_url: thumbnails[0]
        });
      }
      
      const link = document.createElement('a');
      link.href = thumbnails[0];
      link.download = `youtube-thumbnail-${videoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setYoutubeUrl('');
      setShowYoutubeDownloader(false);
    } catch (error) {
      console.error('Error downloading YouTube thumbnail:', error);
      alert('Failed to download YouTube thumbnail. Please check the URL and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
  };

  const handleEditDesign = () => {
    if (!selectedDesign) return;
    navigate(`/design/${selectedDesign.type || 'instagram'}`, { 
      state: { design: selectedDesign, prompt }
    });
  };

  const handleDownloadDesign = () => {
    if (!selectedDesign) return;
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    if (selectedDesign.type === 'youtube') {
      tempCanvas.width = 1280;
      tempCanvas.height = 720;
    } else {
      tempCanvas.width = 1080;
      tempCanvas.height = 1080;
    }
    
    ctx.fillStyle = selectedDesign.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    if (selectedDesign.textElements) {
      selectedDesign.textElements.forEach(text => {
        ctx.font = `${text.fontWeight || 'bold'} ${text.fontSize || 48}px ${text.fontFamily || 'Arial'}`;
        ctx.fillStyle = text.color || '#000000';
        ctx.fillText(text.text, text.x || 50, text.y || 100);
      });
    }
    
    const link = document.createElement('a');
    link.download = `posterforge-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%22%20height%3D%2760%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
      
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiZap} className="text-white text-lg sm:text-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">PosterForge</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setShowYoutubeDownloader(!showYoutubeDownloader)}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all"
            >
              <SafeIcon icon={FiYoutube} className="text-sm" />
              <span>YouTube Downloader</span>
            </button>
            
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all"
              >
                <SafeIcon icon={FiUser} className="text-sm" />
                <span>Profile</span>
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 text-white hover:bg-white/20 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all"
          >
            <SafeIcon icon={showMobileMenu ? FiX : FiMenu} className="text-xl" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-3 overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowYoutubeDownloader(!showYoutubeDownloader);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white hover:bg-white/20 transition-all"
              >
                <SafeIcon icon={FiYoutube} className="text-sm" />
                <span>YouTube Downloader</span>
              </button>
              
              {user ? (
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white hover:bg-white/20 transition-all"
                >
                  <SafeIcon icon={FiUser} className="text-sm" />
                  <span>Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white hover:bg-white/20 transition-all"
                >
                  Sign In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence>
            {showYoutubeDownloader && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">YouTube Thumbnail Downloader</h2>
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube video URL"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <button
                    onClick={handleYoutubeDownload}
                    disabled={isDownloading || !youtubeUrl.trim()}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                  >
                    {isDownloading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <SafeIcon icon={FiDownload} className="mr-2" />
                    )}
                    Download
                  </button>
                </div>
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  Enter a YouTube video URL to download its thumbnail in high resolution
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Prompt Input Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 text-center">
              Create Amazing Designs with AI
            </motion.h2>
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                  <label className="text-white/80 font-medium text-sm sm:text-base">Describe your design</label>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={designType}
                      onChange={(e) => setDesignType(e.target.value)}
                      className="bg-gray-800 border border-white/20 rounded-lg text-white text-xs sm:text-sm px-2 sm:px-3 py-2 flex-1 sm:flex-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#1f2937',
                        color: '#ffffff'
                      }}
                    >
                      <option value="auto" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Auto-detect</option>
                      <option value="youtube" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>YouTube Thumbnail</option>
                      <option value="instagram" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Instagram Post</option>
                      <option value="quote" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Quote Design</option>
                    </select>
                    
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="bg-white/10 border border-white/20 rounded-lg text-white text-xs sm:text-sm px-2 sm:px-3 py-2 flex items-center space-x-1 sm:space-x-2"
                    >
                      <SafeIcon icon={FiUpload} className="text-xs sm:text-sm" />
                      <span>Upload</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
                
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your design in detail (e.g., 'Create a YouTube thumbnail for a gaming video with neon effects and text saying EPIC GAMEPLAY')"
                  className="w-full h-20 sm:h-24 lg:h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
                  disabled={isGenerating}
                />
              </div>
              
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Generating 4 AI Designs...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiZap} className="text-lg sm:text-xl" />
                    <span>Generate 4 AI Designs</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Generated Designs Section */}
          <AnimatePresence>
            {designs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center">
                    Choose Your Favorite Design
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
                    {designs.map((design, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDesignSelect(design)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden aspect-video sm:aspect-square transition-all ${
                          selectedDesign === design 
                            ? 'ring-2 sm:ring-4 ring-purple-500 ring-offset-1 sm:ring-offset-2 ring-offset-blue-900' 
                            : 'border border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div 
                          className="absolute inset-0" 
                          style={{ backgroundColor: design.backgroundColor || '#667eea' }}
                        />
                        
                        {design.textElements && design.textElements.map((text, i) => (
                          <div
                            key={i}
                            className="absolute text-center px-1"
                            style={{
                              left: `${(text.x / 1080) * 100}%`,
                              top: `${(text.y / 1080) * 100}%`,
                              transform: 'translate(-50%, -50%)',
                              color: text.color || '#ffffff',
                              fontWeight: text.fontWeight || 'bold',
                              fontSize: `${Math.max(8, (text.fontSize / 1080) * 100)}px`,
                              fontFamily: text.fontFamily || 'Arial',
                              maxWidth: '90%',
                              wordBreak: 'break-word',
                              lineHeight: '1.1'
                            }}
                          >
                            {text.text}
                          </div>
                        ))}
                        
                        {selectedDesign === design && (
                          <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                            <SafeIcon icon={FiCheck} className="text-white text-xs sm:text-sm" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                          Option {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditDesign}
                      disabled={!selectedDesign}
                      className="flex-1 sm:flex-none sm:min-w-32 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <SafeIcon icon={FiEdit} className="text-sm sm:text-lg" />
                      <span>Edit Design</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 sm:flex-none sm:min-w-32 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <SafeIcon icon={FiRefreshCw} className="text-sm sm:text-lg" />
                      <span>Regenerate</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadDesign}
                      disabled={!selectedDesign}
                      className="flex-1 sm:flex-none sm:min-w-32 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <SafeIcon icon={FiDownload} className="text-sm sm:text-lg" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick Examples Section */}
          {!designs.length && !isGenerating && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6"
            >
              <motion.h3 variants={itemVariants} className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center">
                Quick Examples - Try These:
              </motion.h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  "YouTube thumbnail with red background, bold text saying 'ULTIMATE GUIDE', and gaming controller icon",
                  "Instagram post with gradient background, motivational quote, and minimalist design",
                  "Quote design with elegant script font on dark background with sparkle effects",
                  "YouTube thumbnail for cooking tutorial with food photography and text overlay",
                  "Instagram carousel cover with modern geometric shapes and bold typography",
                  "YouTube gaming thumbnail with epic battle scene and glowing text effects"
                ].map((example, index) => (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setPrompt(example);
                      handleGenerate();
                    }}
                    className="text-left p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                  >
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">{example}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-4 sm:py-6 text-white/60 px-4">
        <p className="text-xs sm:text-sm">&copy; 2024 PosterForge. Powered by AI magic ✨</p>
      </footer>
    </div>
  );
}

export default LandingPage;