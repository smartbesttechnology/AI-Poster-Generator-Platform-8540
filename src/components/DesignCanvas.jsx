import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap } = FiIcons;

function DesignCanvas({ canvasRef, isGenerating, dimensions }) {
  return (
    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-full h-full flex items-center justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="fabric-canvas border border-gray-300 rounded-lg shadow-lg bg-white"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: dimensions?.width || 1280, // Provide fallback dimensions
            height: dimensions?.height || 720
          }}
        />
        
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <SafeIcon icon={FiZap} className="text-white text-2xl" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">Creating your design...</h3>
                <p className="text-white/80 text-sm">AI is working its magic ✨</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {!isGenerating && dimensions && (
        <div className="absolute bottom-4 left-4 text-white/60 text-xs">
          {dimensions.width} × {dimensions.height}
        </div>
      )}
    </div>
  );
}

export default DesignCanvas;