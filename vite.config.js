import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          // Add local server-side middleware for handling image analysis
          server.middlewares.use('/api/analyze', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const { image, mimeType } = JSON.parse(body);
                const apiKey = env.VITE_GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'API Key not configured in server environment' }));
                  return;
                }

                // Initialize Gemini server-side using the protected API key
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

                // Run the vision analysis using the base64 image data
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
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              } catch (err) {
                console.error("Local API Proxy Error:", err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error executing Gemini API' }));
              }
            });
          });
        }
      }
    ]
  };
});
