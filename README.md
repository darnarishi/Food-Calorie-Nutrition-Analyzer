# NutriScan AI — Calorie & Nutrition Vision Tracker

NutriScan AI is a premium, state-of-the-art React web application designed to identify food items from images, estimate calorie/nutritional profiles, and track daily eating habits. 

Built with **React (Vite)** and styled using custom **Vanilla CSS** with modern dark-theme glassmorphism aesthetics, it integrates directly with the **Google Gemini 1.5 Flash Vision API** for instant meal parsing.

---

## ✨ Features & Software Engineering Highlights

### 1. 📷 Vision AI & Interactive Image Hotspots
* Drag-and-drop or select any food image to run a local laser scanner animation.
* The application processes the visual plate and plots absolute-positioned glowing hotspots (X & Y coordinates) directly over the detected food items (e.g., Avocado vs. Toast) on the image canvas.
* Users can tap a hotspot to scale its portion size or remove it from the plate dynamically.

### 2. 📈 "Caloric Velocity" Digestion Curve Simulator
* Plots a dynamic SVG bezier spline showing a simulated 4-hour blood glucose & energy absorption window.
* A custom mathematical engine calculates the curve based on the meal's glycemic profile (simple carbohydrates vs. complex grains, fats, and high-fiber proteins).
  * **Spikes/Crashes:** Projected for meals dominated by high glycemic simple carbs.
  * **Steady Release:** Projected for plates high in fiber, fats, and proteins.

### 3. 📊 Interactive Dashboard & 7-Day Analytics
* Dynamic circular SVG calorie target progress rings.
* Customized neon-gradient progress bars indicating daily targets for Protein, Carbohydrates, and Fats.
* Historical SVG line graph showing calorie consumption patterns over the last 7 days.
* Client-side persistence using browser `localStorage`.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 19 (Vite)
* **Icons:** FontAwesome SVG Icons via `react-icons`
* **Styling:** Custom CSS Variables & Animations (No Tailwind or external component libraries)
* **Vision Model:** Google Gemini 1.5 Flash (via `@google/generative-ai`)
* **Local Storage:** Automated JSON serialization for daily state tracking.

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone and Install Dependencies
Navigate into the directory and install packages:
```powershell
npm install
```

### 3. Environment Variables Configuration
To add your Gemini API Key directly, copy the example environment file:
```powershell
cp .env.example .env
```
Open the `.env` file and insert your key:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

### 4. Start Development Server
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Alternative API Key Setup
If you don't configure the `.env` file:
1. Open the **Settings ⚙️** panel from the Sidebar inside the application.
2. Paste your Google Gemini API Key.
3. Save. The key is securely saved locally in your browser storage (`localStorage`).
*If no API key is specified in either `.env` or settings, the application defaults to **Demo Mode**, letting you click any of the preloaded plates to experience the visual hotspots and absorption graphs instantly.*
