// Mock AI service for design generation
// In a real implementation, this would call Google Gemini API

export const generateDesign = async (prompt, type) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock design generation based on prompt analysis
  const design = {
    backgroundColor: extractBackgroundColor(prompt),
    textElements: extractTextElements(prompt, type),
    backgroundImage: null, // Disable background image to avoid errors
    layout: type === 'youtube' ? 'landscape' : 'square'
  };

  return design;
};

const extractBackgroundColor = (prompt) => {
  const colorKeywords = {
    'red': '#FF6B6B',
    'blue': '#4ECDC4',
    'green': '#96CEB4',
    'purple': '#DDA0DD',
    'yellow': '#FFEAA7',
    'orange': '#F39C12',
    'pink': '#FF69B4',
    'black': '#2C3E50',
    'white': '#FFFFFF',
    'dark': '#34495E',
    'light': '#ECF0F1'
  };

  const lowerPrompt = prompt.toLowerCase();
  
  for (const [color, hex] of Object.entries(colorKeywords)) {
    if (lowerPrompt.includes(color)) {
      return hex;
    }
  }
  
  // Default color instead of gradient to avoid errors
  return '#667eea';
};

const extractTextElements = (prompt, type) => {
  const textElements = [];

  // Look for quoted text
  const quotedText = prompt.match(/"([^"]*)"/g) || prompt.match(/'([^']*)'/g);
  
  if (quotedText) {
    quotedText.forEach((text, index) => {
      textElements.push({
        text: text.replace(/['"]/g, ''),
        x: 50 + (index * 20),
        y: 100 + (index * 60),
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'left'
      });
    });
  } else {
    // Extract key phrases
    const words = prompt.split(' ').filter(word => word.length > 3);
    const mainText = words.slice(0, 3).join(' ').toUpperCase();
    
    textElements.push({
      text: mainText || 'YOUR DESIGN',  // Fallback text
      x: 50,
      y: 100,
      fontSize: type === 'youtube' ? 48 : 36,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#FFFFFF',
      align: 'left'
    });
  }
  
  return textElements;
};

// Simpler implementation without external dependencies
export const generateImageFromPrompt = async (prompt) => {
  // Return a placeholder color instead of trying to load an image
  return null;
};