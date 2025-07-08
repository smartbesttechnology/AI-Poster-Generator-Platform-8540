import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { fabric } from 'fabric';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PromptInput from '../components/PromptInput';
import DesignCanvas from '../components/DesignCanvas';
import ToolPanel from '../components/ToolPanel';
import { generateDesign } from '../utils/aiService';
import supabase from '../lib/supabase';

const { FiArrowLeft, FiDownload, FiRefreshCw, FiSave, FiUser, FiCheck, FiMenu, FiX } = FiIcons;

function DesignStudio({ user, onAuthClick }) {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [canvas, setCanvas] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [designHistory, setDesignHistory] = useState([]);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activePanel, setActivePanel] = useState('prompt'); // 'prompt' or 'tools'
  const canvasRef = useRef(null);

  const dimensions = {
    youtube: { width: 1280, height: 720 },
    instagram: { width: 1080, height: 1080 },
    quote: { width: 1080, height: 1080 }
  };

  const currentDimensions = dimensions[type] || dimensions.youtube;

  useEffect(() => {
    if (location.state?.design) {
      setCurrentPrompt(location.state.prompt || '');
    }
    
    const editId = searchParams.get('edit');
    if (editId && user) {
      loadDesignForEdit(editId);
    }
  }, [location, searchParams, user]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      if (typeof fabric !== 'undefined') {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: currentDimensions.width,
          height: currentDimensions.height,
          backgroundColor: '#ffffff'
        });

        const container = canvasRef.current.parentElement || document.body;
        const containerWidth = container.offsetWidth || 800;
        const containerHeight = container.offsetHeight || 600;

        const scale = Math.min(
          containerWidth / currentDimensions.width,
          containerHeight / currentDimensions.height
        ) * 0.8 || 0.5;

        fabricCanvas.setZoom(scale);
        fabricCanvas.setWidth(currentDimensions.width * scale);
        fabricCanvas.setHeight(currentDimensions.height * scale);

        setCanvas(fabricCanvas);

        if (location.state?.design) {
          setTimeout(() => {
            applyDesignToCanvas(location.state.design);
          }, 500);
        }

        return () => {
          try {
            fabricCanvas.dispose();
          } catch (error) {
            console.error('Error disposing canvas:', error);
          }
        };
      }
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  }, [currentDimensions, location.state]);

  const loadDesignForEdit = async (designId) => {
    try {
      const { data, error } = await supabase
        .from('designs_ai2024')
        .select('*')
        .eq('id', designId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading design:', error);
        return;
      }

      setCurrentDesign(data);
      setCurrentPrompt(data.prompt);

      if (data.canvas_data && canvas) {
        try {
          canvas.loadFromJSON(data.canvas_data, () => {
            canvas.renderAll();
          });
        } catch (error) {
          console.error('Error loading canvas data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading design for edit:', error);
    }
  };

  const handleGenerateDesign = async (prompt) => {
    if (!canvas || !prompt.trim()) return;

    setIsGenerating(true);
    setCurrentPrompt(prompt);
    setIsSaved(false);

    try {
      const design = await generateDesign(prompt, type);
      await applyDesignToCanvas(design);
      setDesignHistory(prev => [...prev, {
        prompt,
        design,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error generating design:', error);
      await createFallbackDesign(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyDesignToCanvas = async (design) => {
    if (!canvas) return;

    try {
      canvas.clear();
      canvas.setBackgroundColor(design.backgroundColor || '#ffffff', canvas.renderAll.bind(canvas));

      if (design.textElements) {
        design.textElements.forEach(textElement => {
          const text = new fabric.Text(textElement.text, {
            left: textElement.x || 50,
            top: textElement.y || 50,
            originX: textElement.align === 'center' ? 'center' : 'left',
            originY: 'center',
            fontFamily: textElement.fontFamily || 'Arial',
            fontSize: textElement.fontSize || 48,
            fill: textElement.color || '#000000',
            fontWeight: textElement.fontWeight || 'bold',
            textAlign: textElement.align || 'left'
          });
          canvas.add(text);
        });
      }

      canvas.renderAll();
    } catch (error) {
      console.error('Error applying design to canvas:', error);
    }
  };

  const createFallbackDesign = async (prompt) => {
    if (!canvas) return;

    try {
      canvas.clear();
      canvas.setBackgroundColor('#667eea', canvas.renderAll.bind(canvas));

      const title = new fabric.Text(prompt.slice(0, 50), {
        left: type === 'youtube' ? 640 : 540,
        top: type === 'youtube' ? 200 : 400,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontSize: type === 'youtube' ? 72 : 48,
        fill: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center'
      });

      canvas.add(title);
      canvas.renderAll();
    } catch (error) {
      console.error('Error creating fallback design:', error);
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      onAuthClick();
      return;
    }

    if (!canvas || !currentPrompt.trim()) {
      alert('Please generate a design first');
      return;
    }

    setIsSaving(true);
    try {
      const canvasData = canvas.toJSON();
      const designData = {
        backgroundColor: canvas.backgroundColor,
        dimensions: currentDimensions,
        objects: canvas.getObjects().length
      };

      const designPayload = {
        user_id: user.id,
        title: currentPrompt.substring(0, 50),
        prompt: currentPrompt,
        type: type,
        design_data: designData,
        canvas_data: JSON.stringify(canvasData)
      };

      let result;
      if (currentDesign) {
        result = await supabase
          .from('designs_ai2024')
          .update(designPayload)
          .eq('id', currentDesign.id)
          .select();
      } else {
        result = await supabase
          .from('designs_ai2024')
          .insert([designPayload])
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      setCurrentDesign(result.data[0]);
      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!canvas) return;

    try {
      const currentZoom = canvas.getZoom();
      const currentWidth = canvas.getWidth();
      const currentHeight = canvas.getHeight();

      canvas.setZoom(1);
      canvas.setWidth(currentDimensions.width);
      canvas.setHeight(currentDimensions.height);
      canvas.renderAll();

      const link = document.createElement('a');
      link.download = `posterforge-${type}-${Date.now()}.png`;
      link.href = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });

      canvas.setZoom(currentZoom);
      canvas.setWidth(currentWidth);
      canvas.setHeight(currentHeight);
      canvas.renderAll();

      link.click();

      if (currentDesign) {
        supabase
          .from('designs_ai2024')
          .update({ downloads: (currentDesign.downloads || 0) + 1 })
          .eq('id', currentDesign.id)
          .then(() => {
            console.log('Download count updated');
          })
          .catch(error => {
            console.error('Error updating download count:', error);
          });
      }
    } catch (error) {
      console.error('Error downloading design:', error);
      alert('Failed to download design. Please try again.');
    }
  };

  const handleRegenerateDesign = () => {
    if (currentPrompt) {
      handleGenerateDesign(currentPrompt);
    }
  };

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
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white capitalize">
                {type} Design Studio
              </h1>
              <p className="text-white/70 text-xs sm:text-sm">
                {currentDimensions.width} × {currentDimensions.height}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveDesign}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {isSaved ? (
                  <>
                    <SafeIcon icon={FiCheck} className="text-sm" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} className="text-sm" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </>
                )}
              </motion.button>
            )}

            {currentPrompt && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegenerateDesign}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <SafeIcon icon={FiRefreshCw} className={`text-sm ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <SafeIcon icon={FiDownload} className="text-sm" />
              <span>Download</span>
            </motion.button>

            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-all"
              >
                <SafeIcon icon={FiUser} className="text-sm" />
                <span>Profile</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAuthClick}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-all"
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all"
          >
            <SafeIcon icon={showMobileMenu ? FiX : FiMenu} className="text-xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 space-y-3 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {user && (
                  <button
                    onClick={() => {
                      handleSaveDesign();
                      setShowMobileMenu(false);
                    }}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all disabled:opacity-50 text-sm"
                  >
                    <SafeIcon icon={isSaved ? FiCheck : FiSave} className="text-sm" />
                    <span>{isSaved ? 'Saved' : (isSaving ? 'Saving...' : 'Save')}</span>
                  </button>
                )}

                {currentPrompt && (
                  <button
                    onClick={() => {
                      handleRegenerateDesign();
                      setShowMobileMenu(false);
                    }}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all disabled:opacity-50 text-sm"
                  >
                    <SafeIcon icon={FiRefreshCw} className={`text-sm ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDownload();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all text-sm"
                >
                  <SafeIcon icon={FiDownload} className="text-sm" />
                  <span>Download</span>
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-all text-sm"
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
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-all text-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Panel Toggle */}
      <div className="lg:hidden px-4 mb-4">
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
          <button
            onClick={() => setActivePanel('prompt')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activePanel === 'prompt' 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Prompt
          </button>
          <button
            onClick={() => setActivePanel('tools')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activePanel === 'tools' 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Tools
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 lg:h-[calc(100vh-200px)]">
          {/* Mobile Panel View */}
          <div className="lg:hidden mb-6">
            <AnimatePresence mode="wait">
              {activePanel === 'prompt' ? (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PromptInput
                    onGenerate={handleGenerateDesign}
                    isGenerating={isGenerating}
                    designType={type}
                    initialPrompt={currentPrompt}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ToolPanel
                    canvas={canvas}
                    designHistory={designHistory}
                    onApplyDesign={applyDesignToCanvas}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Prompt Input */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block lg:col-span-1"
          >
            <PromptInput
              onGenerate={handleGenerateDesign}
              isGenerating={isGenerating}
              designType={type}
              initialPrompt={currentPrompt}
            />
          </motion.div>

          {/* Canvas */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-2 flex items-center justify-center mb-6 lg:mb-0"
          >
            <DesignCanvas
              canvasRef={canvasRef}
              isGenerating={isGenerating}
              dimensions={currentDimensions}
            />
          </motion.div>

          {/* Desktop Tool Panel */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block lg:col-span-1"
          >
            <ToolPanel
              canvas={canvas}
              designHistory={designHistory}
              onApplyDesign={applyDesignToCanvas}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DesignStudio;