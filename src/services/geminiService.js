import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Standard list of mock plates for instant, interactive testing in Demo Mode.
 * Contains pre-mapped item coordinates and detailed macro profiles.
 */
export const MOCK_PLATES = [
  {
    id: 'med-bowl',
    name: 'Mediterranean Harvest Bowl',
    imageName: 'mediterranean_bowl',
    detectedItems: [
      {
        foodName: 'Falafel Pieces',
        calories: 180,
        protein: 6,
        carbs: 15,
        fat: 10,
        coordinates: { x: 30, y: 40 },
        glycemicIndex: 'medium',
        baseWeightGrams: 100
      },
      {
        foodName: 'Smashed Avocado',
        calories: 160,
        protein: 2,
        carbs: 9,
        fat: 15,
        coordinates: { x: 55, y: 35 },
        glycemicIndex: 'low',
        baseWeightGrams: 80
      },
      {
        foodName: 'Quinoa Bed',
        calories: 150,
        protein: 5,
        carbs: 28,
        fat: 2.5,
        coordinates: { x: 45, y: 65 },
        glycemicIndex: 'low',
        baseWeightGrams: 120
      },
      {
        foodName: 'Creamy Hummus',
        calories: 120,
        protein: 4,
        carbs: 10,
        fat: 8,
        coordinates: { x: 70, y: 55 },
        glycemicIndex: 'low',
        baseWeightGrams: 60
      }
    ],
    healthTips: [
      'Excellent balance of complex carbohydrates, healthy fats, and plant-based protein.',
      'High in dietary fiber, which promotes digestive health and sustains fullness.',
      'A perfect meal for maintaining stable blood sugar levels.'
    ]
  },
  {
    id: 'avo-toast',
    name: 'Avocado Toast & Poached Eggs',
    imageName: 'avocado_toast',
    detectedItems: [
      {
        foodName: 'Poached Eggs',
        calories: 140,
        protein: 12,
        carbs: 1,
        fat: 10,
        coordinates: { x: 65, y: 38 },
        glycemicIndex: 'low',
        baseWeightGrams: 100
      },
      {
        foodName: 'Sourdough Bread Toast',
        calories: 150,
        protein: 5,
        carbs: 32,
        fat: 1,
        coordinates: { x: 45, y: 55 },
        glycemicIndex: 'medium',
        baseWeightGrams: 60
      },
      {
        foodName: 'Mashed Avocado Spread',
        calories: 120,
        protein: 1.5,
        carbs: 7,
        fat: 11,
        coordinates: { x: 40, y: 42 },
        glycemicIndex: 'low',
        baseWeightGrams: 50
      },
      {
        foodName: 'Roasted Cherry Tomatoes',
        calories: 20,
        protein: 0.5,
        carbs: 4,
        fat: 0.1,
        coordinates: { x: 25, y: 30 },
        glycemicIndex: 'low',
        baseWeightGrams: 40
      }
    ],
    healthTips: [
      'Rich in monounsaturated fats from the avocado, supporting cardiovascular wellness.',
      'Eggs provide highly bioavailable, complete protein containing essential amino acids.',
      'Consider swapping standard white flour bread for 100% whole grain sourdough for a lower glycemic impact.'
    ]
  },
  {
    id: 'smoothie-bowl',
    name: 'Power Antioxidant Smoothie Bowl',
    imageName: 'smoothie_bowl',
    detectedItems: [
      {
        foodName: 'Greek Yogurt & Mixed Berry Base',
        calories: 220,
        protein: 15,
        carbs: 26,
        fat: 2,
        coordinates: { x: 50, y: 50 },
        glycemicIndex: 'medium',
        baseWeightGrams: 200
      },
      {
        foodName: 'Crunchy Honey Granola',
        calories: 130,
        protein: 3,
        carbs: 20,
        fat: 5,
        coordinates: { x: 32, y: 35 },
        glycemicIndex: 'high',
        baseWeightGrams: 30
      },
      {
        foodName: 'Fresh Banana Slices',
        calories: 90,
        protein: 1,
        carbs: 23,
        fat: 0.3,
        coordinates: { x: 50, y: 25 },
        glycemicIndex: 'medium',
        baseWeightGrams: 80
      },
      {
        foodName: 'Chia & Hemp Seeds',
        calories: 60,
        protein: 2,
        carbs: 5,
        fat: 4,
        coordinates: { x: 68, y: 42 },
        glycemicIndex: 'low',
        baseWeightGrams: 15
      }
    ],
    healthTips: [
      'High in antioxidants from the berries which fight oxidative stress.',
      'Greek yogurt provides a robust foundation of high-protein macros.',
      'Watch out for granola portions; honey-baked granolas are energy-dense and can quickly spike sugars.'
    ]
  }
];

/**
 * Helper to convert file data to Google GenAI format.
 */
async function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to convert file data to base64 string.
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Sends the image to the Gemini Vision API to analyze food.
 * @param {File} imageFile - The food image selected by the user.
 * @param {string} apiKey - The user's custom Google Gemini API Key.
 * @returns {Promise<Object>} The parsed nutrition analysis response.
 */
export async function analyzeFoodImage(imageFile, apiKey) {
  // 1. If the user provided a custom key in UI Settings, run analysis client-side
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const imagePart = await fileToGenerativePart(imageFile);
      
      const prompt = `
        Analyze this food image. Identify all individual food components visible on the plate/meal.
        For each item you detect:
        1. Provide a name.
        2. Estimate its calories, protein, carbs, and fat contents.
        3. Categorize its Glycemic Index as "low", "medium", or "high".
        4. Estimate the exact center coordinates {x, y} of the food item in the image as percentages from 0 to 100.
           (x is from left to right, y is from top to bottom. Help place UI markers on the plate).
        5. Provide an estimated baseWeightGrams for the typical portion seen.

        Also provide 2-3 tailored dietary health tips based on the meal combination.
        
        Respond STRICTLY in the following JSON format:
        {
          "detectedItems": [
            {
              "foodName": "Item Name",
              "calories": 150,
              "protein": 5,
              "carbs": 20,
              "fat": 4,
              "glycemicIndex": "low",
              "coordinates": { "x": 45, "y": 60 },
              "baseWeightGrams": 120
            }
          ],
          "healthTips": [
            "Tip 1...",
            "Tip 2..."
          ]
        }
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const parsedData = JSON.parse(text);

      return {
        name: parsedData.detectedItems.map(item => item.foodName).join(' & '),
        detectedItems: parsedData.detectedItems,
        healthTips: parsedData.healthTips || [],
        isDemoMode: false
      };
    } catch (error) {
      console.warn('Client-side Gemini Vision analysis failed, trying backend proxy:', error);
    }
  }

  // 2. Otherwise (or if client call failed), call our secure serverless backend proxy
  try {
    const base64Data = await fileToBase64(imageFile);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Data,
        mimeType: imageFile.type
      })
    });

    if (!response.ok) {
      throw new Error(`Server API returned status code ${response.status}`);
    }

    const parsedData = await response.json();
    if (parsedData.error) {
      throw new Error(parsedData.error);
    }

    return {
      name: parsedData.detectedItems.map(item => item.foodName).join(' & '),
      detectedItems: parsedData.detectedItems,
      healthTips: parsedData.healthTips || [],
      isDemoMode: false
    };
  } catch (error) {
    console.error('API backend proxy analysis failed, falling back to Demo Mode:', error.message);
    
    // 3. Fallback to Demo Mode random mock plate
    const randomPlate = MOCK_PLATES[Math.floor(Math.random() * MOCK_PLATES.length)];
    return {
      ...randomPlate,
      isDemoMode: true,
      errorMsg: error.message
    };
  }
}
