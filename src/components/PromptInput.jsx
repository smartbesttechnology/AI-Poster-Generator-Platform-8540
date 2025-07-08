import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiImage, FiType, FiPalette } = FiIcons;

function PromptInput({ onGenerate, isGenerating, designType, initialPrompt = '' }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedCategory, setSelectedCategory] = useState('general');

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const categories = {
    general: {
      icon: FiZap,
      label: 'General',
      suggestions: [
        'Bold red background with white text',
        'Minimalist design with gradient',
        'Dark theme with neon accents',
        'Professional business style'
      ]
    },
    gaming: {
      icon: FiImage,
      label: 'Gaming',
      suggestions: [
        'Epic gaming thumbnail with fire effects',
        'Minecraft style thumbnail',
        'Fortnite victory royale design',
        'Retro pixel art style'
      ]
    },
    business: {
      icon: FiType,
      label: 'Business',
      suggestions: [
        'Professional corporate design',
        'Clean modern business card',
        'Startup pitch deck style',
        'Financial growth chart theme'
      ]
    },
    creative: {
      icon: FiPalette,
      label: 'Creative',
      suggestions: [
        'Artistic watercolor background',
        'Abstract geometric patterns',
        'Vintage retro aesthetic',
        'Futuristic sci-fi design'
      ]
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 h-full">
      <h3 className="text-xl font-semibold text-white mb-4">
        Create {designType === 'youtube' ? 'YouTube Thumbnail' : 'Instagram Post'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Describe your design
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Red background, bold white text saying 'EPIC GAMING', gaming controller icon, dark theme with neon blue accents"
            className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            disabled={isGenerating}
          />
        </div>

        <motion.button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiZap} className="text-lg" />
              <span>Generate Design</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Category Tabs */}
      <div className="mt-6">
        <div className="flex space-x-2 mb-4">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <SafeIcon icon={category.icon} className="text-xs" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <h4 className="text-white/80 text-sm font-medium">Quick suggestions:</h4>
          {categories[selectedCategory].suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-all border border-white/10 hover:border-white/20"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="text-white/80 text-sm font-medium mb-2">💡 Tips for better results:</h4>
        <ul className="text-white/60 text-xs space-y-1">
          <li>• Be specific about colors, fonts, and style</li>
          <li>• Mention the mood or theme you want</li>
          <li>• Include text content you want to display</li>
          <li>• Describe any icons or graphics needed</li>
        </ul>
      </div>
    </div>
  );
}

export default PromptInput;