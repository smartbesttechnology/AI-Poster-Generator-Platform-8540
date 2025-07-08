// Enhanced AI service for design generation
// In a real implementation, this would call Google Gemini API

export const generateDesign = async (prompt, type, variationIndex = 0) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // Determine design type if not specified
  if (!type || type === 'auto') {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('youtube') || lowerPrompt.includes('thumbnail') || lowerPrompt.includes('video')) {
      type = 'youtube';
    } else if (lowerPrompt.includes('instagram') || lowerPrompt.includes('post') || lowerPrompt.includes('square')) {
      type = 'instagram';
    } else if (lowerPrompt.includes('quote') || lowerPrompt.includes('text') || lowerPrompt.includes('saying')) {
      type = 'quote';
    } else {
      type = 'instagram'; // Default to Instagram if can't determine
    }
  }
  
  // Get design dimensions
  const dimensions = {
    youtube: { width: 1280, height: 720 },
    instagram: { width: 1080, height: 1080 },
    quote: { width: 1080, height: 1080 }
  };
  
  // Create variations based on the index
  const variations = [
    { // Variation 0: Bold and vibrant
      bgColors: ['#FF6B6B', '#6B66FF', '#66FFB8', '#FFD166'],
      textColors: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6'],
      fontSizes: [72, 64, 56, 48],
      fontWeights: ['bold', '900', '800', '700'],
    },
    { // Variation 1: Elegant and minimal
      bgColors: ['#212529', '#343A40', '#495057', '#6C757D'],
      textColors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA'],
      fontSizes: [56, 48, 40, 36],
      fontWeights: ['500', '400', '300', '200'],
    },
    { // Variation 2: Colorful and playful
      bgColors: ['#4CC9F0', '#4361EE', '#3A0CA3', '#7209B7'],
      textColors: ['#FFFFFF', '#F8F9FA', '#F0F0F0', '#E8E8E8'],
      fontSizes: [64, 56, 48, 42],
      fontWeights: ['bold', '800', '700', '600'],
    },
    { // Variation 3: Professional and clean
      bgColors: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6'],
      textColors: ['#212529', '#343A40', '#495057', '#6C757D'],
      fontSizes: [48, 42, 36, 32],
      fontWeights: ['600', '500', '400', '300'],
    }
  ];
  
  // Select variation based on index
  const variation = variations[variationIndex % variations.length];
  
  // Generate backgroundColor based on variation and prompt
  const backgroundColor = extractBackgroundColor(prompt, variation.bgColors);
  
  // Generate text elements based on variation and prompt
  const textElements = extractTextElements(prompt, type, variation);
  
  // Create the design object
  const design = {
    type,
    backgroundColor,
    textElements,
    backgroundImage: null, // Simplified to avoid errors
    dimensions: dimensions[type],
    variation: variationIndex
  };
  
  return design;
};

const extractBackgroundColor = (prompt, colorOptions = []) => {
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
    'light': '#ECF0F1',
    'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  // Check if any color keywords are in the prompt
  const lowerPrompt = prompt.toLowerCase();
  for (const [color, hex] of Object.entries(colorKeywords)) {
    if (lowerPrompt.includes(color)) {
      return hex;
    }
  }
  
  // If no specific color is mentioned, choose from the variation options
  return colorOptions[Math.floor(Math.random() * colorOptions.length)];
};

const extractTextElements = (prompt, type, variation) => {
  const textElements = [];
  const { textColors, fontSizes, fontWeights } = variation;
  
  // Look for quoted text first
  const quotedText = prompt.match(/"([^"]*)"/g) || prompt.match(/'([^']*)'/g);
  
  if (quotedText && quotedText.length > 0) {
    // Use quoted text as main elements
    quotedText.forEach((text, index) => {
      const cleanText = text.replace(/['"]/g, '');
      
      // Position text differently based on index and design type
      let x, y, fontSize, align;
      
      if (type === 'youtube') {
        // For YouTube thumbnails
        if (index === 0) {
          // Main title - centered or top
          x = 640;
          y = 180;
          fontSize = fontSizes[0];
          align = 'center';
        } else {
          // Subtitle or additional text
          x = 640;
          y = 360 + (index - 1) * 100;
          fontSize = fontSizes[2];
          align = 'center';
        }
      } else {
        // For Instagram or quote
        if (index === 0) {
          // Main text - centered
          x = 540;
          y = 400;
          fontSize = fontSizes[1];
          align = 'center';
        } else {
          // Additional text
          x = 540;
          y = 500 + (index - 1) * 80;
          fontSize = fontSizes[3];
          align = 'center';
        }
      }
      
      textElements.push({
        text: cleanText,
        x,
        y,
        fontSize,
        fontFamily: type === 'quote' ? 'Georgia' : 'Arial',
        fontWeight: fontWeights[index % fontWeights.length],
        color: textColors[index % textColors.length],
        align
      });
    });
  } else {
    // Extract key phrases if no quoted text
    const words = prompt.split(' ');
    
    // Find important words (longer than 3 chars, not common words)
    const commonWords = ['with', 'and', 'the', 'for', 'this', 'that', 'from', 'have', 'design'];
    const importantWords = words.filter(word => 
      word.length > 3 && !commonWords.includes(word.toLowerCase())
    );
    
    // Create main title from first few important words
    const mainText = importantWords.slice(0, 3).join(' ').toUpperCase();
    
    // Create subtitle from next few important words if available
    const hasSubtitle = importantWords.length > 3;
    const subtitleText = hasSubtitle 
      ? importantWords.slice(3, 6).join(' ')
      : '';
    
    if (type === 'youtube') {
      // Main title for YouTube
      textElements.push({
        text: mainText || 'AWESOME VIDEO',
        x: 640,
        y: 200,
        fontSize: fontSizes[0],
        fontFamily: 'Arial',
        fontWeight: fontWeights[0],
        color: textColors[0],
        align: 'center'
      });
      
      // Subtitle for YouTube if available
      if (hasSubtitle) {
        textElements.push({
          text: subtitleText,
          x: 640,
          y: 400,
          fontSize: fontSizes[2],
          fontFamily: 'Arial',
          fontWeight: fontWeights[1],
          color: textColors[1],
          align: 'center'
        });
      }
    } else if (type === 'quote') {
      // Quote style
      textElements.push({
        text: `"${mainText}"`,
        x: 540,
        y: 400,
        fontSize: fontSizes[1],
        fontFamily: 'Georgia',
        fontWeight: fontWeights[1],
        color: textColors[0],
        align: 'center'
      });
      
      // Attribution if available
      if (hasSubtitle) {
        textElements.push({
          text: `- ${subtitleText}`,
          x: 540,
          y: 500,
          fontSize: fontSizes[3],
          fontFamily: 'Georgia',
          fontWeight: fontWeights[2],
          color: textColors[1],
          align: 'center'
        });
      }
    } else {
      // Instagram post
      textElements.push({
        text: mainText || 'INSTAGRAM POST',
        x: 540,
        y: 400,
        fontSize: fontSizes[1],
        fontFamily: 'Arial',
        fontWeight: fontWeights[0],
        color: textColors[0],
        align: 'center'
      });
      
      // Subtitle if available
      if (hasSubtitle) {
        textElements.push({
          text: subtitleText,
          x: 540,
          y: 500,
          fontSize: fontSizes[3],
          fontFamily: 'Arial',
          fontWeight: fontWeights[1],
          color: textColors[1],
          align: 'center'
        });
      }
    }
  }
  
  return textElements;
};

// Parse YouTube URLs and extract video IDs - Fixed regex without unnecessary escapes
export const parseYoutubeUrl = (url) => {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Get YouTube thumbnail URLs for a video ID
export const getYoutubeThumbnailUrls = (videoId) => {
  if (!videoId) return [];
  
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // HD
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,     // SD
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // HQ
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // MQ
    `https://img.youtube.com/vi/${videoId}/default.jpg`        // Default
  ];
};