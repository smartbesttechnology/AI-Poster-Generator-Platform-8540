// Enhanced AI service for design generation with Gemini API integration
import supabase from '../lib/supabase';

// Get Gemini API key from database
const getGeminiApiKey = async () => {
  try {
    const { data, error } = await supabase
      .from('gemini_config_ai2024')
      .select('api_key')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching Gemini API key:', error);
      return null;
    }
    
    return data?.api_key;
  } catch (error) {
    console.error('Error getting Gemini API key:', error);
    return null;
  }
};

// Call Gemini API for enhanced design generation
const callGeminiAPI = async (prompt, designType) => {
  try {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      console.log('No Gemini API key found, using fallback generation');
      return null;
    }

    const enhancedPrompt = `Create a detailed design specification for a ${designType} with the following requirements: ${prompt}. 
    Please provide specific details about:
    - Background color (hex code)
    - Text elements with exact positioning, colors, fonts, and sizes
    - Overall style and mood
    - Any additional visual elements
    
    Format the response as a JSON object with backgroundColor, textElements array, and style properties.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (generatedText) {
      try {
        // Try to parse JSON from the response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Could not parse Gemini response as JSON, using fallback');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

export const generateDesign = async (prompt, type, variationIndex = 0) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Try to get enhanced design from Gemini API first
  const geminiDesign = await callGeminiAPI(prompt, type);
  
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

  // If Gemini provided a valid design, use it with some modifications
  if (geminiDesign && geminiDesign.backgroundColor && geminiDesign.textElements) {
    return {
      type,
      backgroundColor: geminiDesign.backgroundColor,
      textElements: geminiDesign.textElements.map(element => ({
        ...element,
        x: element.x || (type === 'youtube' ? 640 : 540),
        y: element.y || (type === 'youtube' ? 360 : 540),
        fontSize: element.fontSize || (type === 'youtube' ? 64 : 48),
        fontFamily: element.fontFamily || 'Arial',
        fontWeight: element.fontWeight || 'bold',
        color: element.color || '#ffffff'
      })),
      backgroundImage: null,
      dimensions: dimensions[type],
      variation: variationIndex,
      enhanced: true // Mark as Gemini-enhanced
    };
  }

  // Fallback to original generation logic
  const variations = [
    {
      // Variation 0: Bold and vibrant
      bgColors: ['#FF6B6B', '#6B66FF', '#66FFB8', '#FFD166'],
      textColors: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6'],
      fontSizes: [72, 64, 56, 48],
      fontWeights: ['bold', '900', '800', '700'],
    },
    {
      // Variation 1: Elegant and minimal
      bgColors: ['#212529', '#343A40', '#495057', '#6C757D'],
      textColors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA'],
      fontSizes: [56, 48, 40, 36],
      fontWeights: ['500', '400', '300', '200'],
    },
    {
      // Variation 2: Colorful and playful
      bgColors: ['#4CC9F0', '#4361EE', '#3A0CA3', '#7209B7'],
      textColors: ['#FFFFFF', '#F8F9FA', '#F0F0F0', '#E8E8E8'],
      fontSizes: [64, 56, 48, 42],
      fontWeights: ['bold', '800', '700', '600'],
    },
    {
      // Variation 3: Professional and clean
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
    variation: variationIndex,
    enhanced: false // Mark as fallback generation
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
    const subtitleText = hasSubtitle ? importantWords.slice(3, 6).join(' ') : '';

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