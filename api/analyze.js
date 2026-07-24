import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function Proxy Handler
 * Receives the base64 image data and queries Gemini securely in production.
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').send('Method Not Allowed');
    return;
  }

  try {
    const { image, mimeType } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({ error: 'API Key not configured in server environment' });
      return;
    }

    // Initialize Gemini using the server-side environment key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

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

    // Query Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text();
    
    res.status(200)
       .setHeader('Content-Type', 'application/json')
       .send(text);

  } catch (err) {
    console.error("Vercel API Proxy Error:", err);
    res.status(500).json({ error: err.message || 'Error executing Gemini API' });
  }
}
