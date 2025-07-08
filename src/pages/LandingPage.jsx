import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { generateDesign } from '../utils/aiService';
import supabase from '../lib/supabase';

const { FiZap, FiImage, FiUpload, FiDownload, FiEdit, FiUser, FiYoutube, FiRefreshCw, FiCheck } = FiIcons;

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
    return 'instagram'; // Default to instagram if can't determine
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setDesigns([]);
    setSelectedDesign(null);
    
    try {
      const type = designType === 'auto' ? determineDesignType(prompt) : designType;
      
      // Generate 4 different designs
      const designPromises = Array(4).fill().map((_, i) => 
        generateDesign(prompt, type, i)
      );
      
      const generatedDesigns = await Promise.all(designPromises);
      setDesigns(generatedDesigns);
      
      // Auto-select the first design
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
      // Use the uploaded image as a reference for generation
      setPrompt(prompt => prompt + " (based on uploaded image)");
      // Here you would normally send the image to the AI service
      // For now, we'll just trigger the generate function
      handleGenerate();
    };
    reader.readAsDataURL(file);
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) return;
    
    setIsDownloading(true);
    try {
      // Extract YouTube video ID - Fixed regex without unnecessary escapes
      const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i)?.[1];
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      // Get different thumbnail resolutions
      const thumbnails = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // HD
        `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,     // SD
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // HQ
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // MQ
        `https://img.youtube.com/vi/${videoId}/default.jpg`        // Default
      ];
      
      // Save to database if user is logged in
      if (user) {
        await supabase.from('youtube_downloads_ai2024').insert({
          user_id: user.id,
          youtube_id: videoId,
          thumbnail_url: thumbnails[0]
        });
      }
      
      // Download the highest quality thumbnail
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
    
    // Navigate to design studio with the selected design
    navigate(`/design/${selectedDesign.type || 'instagram'}`, { 
      state: { design: selectedDesign, prompt }
    });
  };

  const handleDownloadDesign = () => {
    if (!selectedDesign) return;
    
    // Create a temporary canvas to render and download the design
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Set dimensions based on design type
    if (selectedDesign.type === 'youtube') {
      tempCanvas.width = 1280;
      tempCanvas.height = 720;
    } else {
      tempCanvas.width = 1080;
      tempCanvas.height = 1080;
    }
    
    // Fill background
    ctx.fillStyle = selectedDesign.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw text elements (simplified)
    if (selectedDesign.textElements) {
      selectedDesign.textElements.forEach(text => {
        ctx.font = `${text.fontWeight || 'bold'} ${text.fontSize || 48}px ${text.fontFamily || 'Arial'}`;
        ctx.fillStyle = text.color || '#000000';
        ctx.fillText(text.text, text.x || 50, text.y || 100);
      });
    }
    
    // Download as PNG
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%22%20height%3D%2760%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2730%22%20cy%3D%2730%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiZap} className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">PosterForge</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowYoutubeDownloader(!showYoutubeDownloader)}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all"
          >
            <SafeIcon icon={FiYoutube} className="text-sm" />
            <span className="hidden sm:inline">YouTube Downloader</span>
          </button>
          
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all"
            >
              <SafeIcon icon={FiUser} className="text-sm" />
              <span className="hidden sm:inline">Profile</span>
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
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <AnimatePresence>
          {showYoutubeDownloader && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-xl font-bold text-white mb-4">YouTube Thumbnail Downloader</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Paste YouTube video URL"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleYoutubeDownload}
                  disabled={isDownloading || !youtubeUrl.trim()}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center"
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
              <p className="text-white/60 text-sm mt-2">
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
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white mb-6">
            Create Amazing Designs with AI
          </motion.h2>
          
          <motion.div variants={itemVariants} className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/80 font-medium">Describe your design</label>
                <div className="flex space-x-2">
                  <select
                    value={designType}
                    onChange={(e) => setDesignType(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg text-white text-sm px-2 py-1"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="youtube">YouTube Thumbnail</option>
                    <option value="instagram">Instagram Post</option>
                    <option value="quote">Quote Design</option>
                  </select>
                  
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-white/10 border border-white/20 rounded-lg text-white text-sm px-2 py-1 flex items-center"
                  >
                    <SafeIcon icon={FiUpload} className="mr-1" />
                    <span className="hidden sm:inline">Upload</span>
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
                className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
            </div>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Generating 4 AI Designs...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiZap} className="text-xl" />
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
              className="grid grid-cols-1 gap-8"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Choose Your Favorite Design
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {designs.map((design, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDesignSelect(design)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden aspect-video sm:aspect-square ${
                        selectedDesign === design 
                          ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-blue-900' 
                          : 'border border-white/20'
                      }`}
                    >
                      {/* Design Preview - Simple representation */}
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: design.backgroundColor || '#667eea' }}
                      />
                      
                      {/* Text elements preview */}
                      {design.textElements && design.textElements.map((text, i) => (
                        <div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${(text.x / 1080) * 100}%`,
                            top: `${(text.y / 1080) * 100}%`,
                            color: text.color || '#ffffff',
                            fontWeight: text.fontWeight || 'bold',
                            fontSize: `${(text.fontSize / 1080) * 100}vw`,
                            fontFamily: text.fontFamily || 'Arial',
                          }}
                        >
                          {text.text}
                        </div>
                      ))}
                      
                      {/* Selection indicator */}
                      {selectedDesign === design && (
                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                          <SafeIcon icon={FiCheck} className="text-white" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                        Option {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditDesign}
                    disabled={!selectedDesign}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiEdit} className="text-lg" />
                    <span>Edit Design</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiRefreshCw} className="text-lg" />
                    <span>Regenerate</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadDesign}
                    disabled={!selectedDesign}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiDownload} className="text-lg" />
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
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <motion.h3 variants={itemVariants} className="text-xl font-bold text-white mb-4">
              Quick Examples - Try These:
            </motion.h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                >
                  <p className="text-white/90">{example}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/60">
        <p>&copy; 2024 PosterForge. Powered by AI magic ✨</p>
      </footer>
    </div>
  );
}

export default LandingPage;