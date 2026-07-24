# NutriScan AI — Calorie & Nutrition Vision Tracker

NutriScan AI is a React-based web application designed to identify food items from images, estimate caloric and macronutrient profiles, and track daily nutritional intake. 

Built on a Vite-scaffolding and styled with modular, custom CSS variables, the application leverages the Google Gemini Vision API to parse meals, map interactive visual hotspots over food regions, and simulate post-meal blood glucose curves.

---

## Core Features and Architecture

### 1. Computer Vision and Interactive Image Hotspots
* The application processes uploaded images through the Google Gemini multimodal model, which returns structured JSON data containing identified food components, macro profiles, and spatial coordinate tags.
* Absolute-positioned visual markers are dynamically rendered on top of the food items on the image preview using the parsed coordinates.
* Tapping a marker isolates that specific item, allowing the user to scale its weight slider (25% to 250%) and recalculate the overall plate macros in real-time.

### 2. Caloric Velocity (Digestion Curve Simulator)
* Computes a simulated 4-hour blood glucose and energy absorption curve using a dynamic SVG cubic bezier spline.
* The shape of the curve is calculated by a mathematical model based on the glycemic profile of the analyzed meal (simple carbohydrates vs. complex grains, healthy fats, and high-fiber proteins).
  * **Spikes/Crashes:** Projected for meals dominated by high glycemic index carbohydrates.
  * **Sustained Plateau:** Projected for meals balanced with protein, dietary fiber, and healthy fats.

### 3. Analytics Dashboard and Data Persistence
* Renders daily target rings and macronutrient gauges using custom SVG paths and CSS animations.
* Integrates a weekly trend line graph charting calorie intake against daily targets over a rolling 7-day period.
* Implements client-side state management persisted via the browser's `localStorage` API.

---

## Technical Stack

* **Frontend:** React 19 (Vite)
* **API Integration:** Google Gemini API (via `@google/generative-ai`)
* **Icons:** FontAwesome SVG Icons (`react-icons/fa`)
* **Styling:** Custom CSS Variables & dark mode glassmorphic interface
* **Proxy Server:** Node.js dev server middleware integration to protect API credentials

---

## Local Installation and Setup

### 1. Prerequisites
Ensure you have Node.js installed (v18 or higher recommended).

### 2. Clone and Install Dependencies
Navigate into the project directory and run:
```powershell
npm install
```

### 3. Configure API Credentials
To secure your Google Gemini API key and prevent client-side exposure, the project utilizes a local backend proxy server. 

Copy the environment template file:
```powershell
cp .env.example .env
```
Open the `.env` file and insert your API key:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

### 4. Run the Application
Start the development server:
```powershell
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## Alternative Client-Side Configuration
If no server-side environment key is detected, the application automatically falls back to an offline Demo Mode utilizing pre-loaded food plates. Users can also enter a custom key in the Settings modal if they choose to run calls directly from their browser.
