import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { parseYoutubeUrl, getYoutubeThumbnailUrls } from '../utils/aiService';
import supabase from '../lib/supabase';

const { FiDownload, FiYoutube, FiAlertCircle } = FiIcons;

function YouTubeDownloader({ user }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
    setThumbnailPreview(null);
  };
  
  const handlePreview = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const videoId = parseYoutubeUrl(url);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
      }
      
      // Get thumbnail URLs
      const thumbnailUrls = getYoutubeThumbnailUrls(videoId);
      
      // Set the first URL for preview
      setThumbnailPreview({
        videoId,
        urls: thumbnailUrls
      });
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async (thumbnailUrl) => {
    if (!thumbnailPreview) return;
    
    try {
      // Save to database if user is logged in
      if (user) {
        await supabase.from('youtube_downloads_ai2024').insert({
          user_id: user.id,
          youtube_id: thumbnailPreview.videoId,
          thumbnail_url: thumbnailUrl
        });
      }
      
      // Download the thumbnail
      const link = document.createElement('a');
      link.href = thumbnailUrl;
      link.download = `youtube-thumbnail-${thumbnailPreview.videoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      setError('Failed to download thumbnail. Please try again.');
    }
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        YouTube Thumbnail Downloader
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            YouTube Video URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste YouTube video URL here"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePreview}
              disabled={isLoading || !url.trim()}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-w-32"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiYoutube} className="text-lg" />
                  <span>Preview</span>
                </>
              )}
            </motion.button>
          </div>
          <p className="text-white/60 text-xs mt-2">
            Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
            <SafeIcon icon={FiAlertCircle} className="text-red-400" />
            <p className="text-white/90 text-sm">{error}</p>
          </div>
        )}
        
        {thumbnailPreview && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Available Thumbnails</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {thumbnailPreview.urls.slice(0, 3).map((url, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 space-y-3">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = thumbnailPreview.urls[thumbnailPreview.urls.length - 1]; // Fallback to default
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">
                      {index === 0 ? 'HD Quality' : index === 1 ? 'SD Quality' : 'Standard Quality'}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(url)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <SafeIcon icon={FiDownload} className="text-xs" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white/5 rounded-lg p-4 mt-6">
          <h4 className="text-white/80 text-sm font-medium mb-2">💡 Tips:</h4>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Works with any YouTube video URL format</li>
            <li>• You can download thumbnails even without signing in</li>
            <li>• HD quality is available for most videos uploaded recently</li>
            <li>• For best results, use official YouTube URLs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default YouTubeDownloader;