import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { fabric } from 'fabric';
import SafeIcon from '../common/SafeIcon';

const { FiLayers, FiType, FiImage, FiPalette, FiMove, FiRotateCw, FiTrash2, FiCopy, FiEye, FiEyeOff } = FiIcons;

function ToolPanel({ canvas, designHistory, onApplyDesign }) {
  const [activeTab, setActiveTab] = useState('layers');
  const [selectedObject, setSelectedObject] = useState(null);

  const tabs = [
    { id: 'layers', label: 'Layers', icon: FiLayers },
    { id: 'text', label: 'Text', icon: FiType },
    { id: 'images', label: 'Images', icon: FiImage },
    { id: 'colors', label: 'Colors', icon: FiPalette }
  ];

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  const addText = () => {
    if (!canvas || !fabric) return;
    
    const text = new fabric.Text('Your Text Here', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#000000',
      fontWeight: 'bold'
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addShape = (type) => {
    if (!canvas || !fabric) return;
    
    let shape;
    switch (type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 200,
          height: 100,
          fill: '#FF6B6B'
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: '#4ECDC4'
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#45B7D1'
        });
        break;
      default:
        return;
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const changeColor = (color) => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'text') {
        activeObject.set('fill', color);
      } else {
        activeObject.set('fill', color);
      }
      canvas.renderAll();
    }
  };

  const deleteObject = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const duplicateObject = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        cloned.set({
          left: activeObject.left + 10,
          top: activeObject.top + 10,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  const renderLayersTab = () => (
    <div className="space-y-4">
      <h4 className="text-white font-medium text-sm sm:text-base">Canvas Objects</h4>
      <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
        {canvas?.getObjects().map((obj, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <SafeIcon icon={obj.type === 'text' ? FiType : FiImage} className="text-white/60 text-sm" />
              <span className="text-white/80 text-xs sm:text-sm truncate">
                {obj.type === 'text' ? obj.text?.substring(0, 20) : obj.type}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => canvas.setActiveObject(obj)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <SafeIcon icon={FiEye} className="text-xs sm:text-sm" />
              </button>
              <button
                onClick={() => {
                  canvas.remove(obj);
                  canvas.renderAll();
                }}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
              >
                <SafeIcon icon={FiTrash2} className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTextTab = () => (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addText}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
      >
        <SafeIcon icon={FiType} className="text-sm sm:text-lg" />
        <span>Add Text</span>
      </motion.button>
      
      <div className="space-y-2 sm:space-y-3">
        <h4 className="text-white font-medium text-sm">Font Styles</h4>
        <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
          {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'].map((font) => (
            <button
              key={font}
              onClick={() => {
                const activeObject = canvas?.getActiveObject();
                if (activeObject && activeObject.type === 'text') {
                  activeObject.set('fontFamily', font);
                  canvas.renderAll();
                }
              }}
              className="w-full p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-left transition-all text-xs sm:text-sm"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addShape('rectangle')}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all text-xs sm:text-sm"
        >
          Rectangle
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addShape('circle')}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all text-xs sm:text-sm"
        >
          Circle
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addShape('triangle')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all col-span-2 text-xs sm:text-sm"
        >
          Triangle
        </motion.button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <h4 className="text-white font-medium text-sm">Object Controls</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={duplicateObject}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-all text-xs sm:text-sm"
          >
            <SafeIcon icon={FiCopy} className="text-xs sm:text-sm" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={deleteObject}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-all text-xs sm:text-sm"
          >
            <SafeIcon icon={FiTrash2} className="text-xs sm:text-sm" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-4">
      <h4 className="text-white font-medium text-sm">Colors</h4>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeColor(color)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <h4 className="text-white font-medium text-sm">Background</h4>
        <div className="grid grid-cols-5 gap-2">
          {colors.slice(0, 10).map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (canvas) {
                  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
                }
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 h-full">
      {/* Tabs */}
      <div className="flex space-x-1 mb-4 sm:mb-6 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <SafeIcon icon={tab.icon} className="text-xs" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="h-full overflow-y-auto">
        {activeTab === 'layers' && renderLayersTab()}
        {activeTab === 'text' && renderTextTab()}
        {activeTab === 'images' && renderImagesTab()}
        {activeTab === 'colors' && renderColorsTab()}
      </div>
    </div>
  );
}

export default ToolPanel;