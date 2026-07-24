import React, { useState, useEffect } from 'react';
import { FaChartBar, FaCamera, FaHistory, FaCog, FaHeartbeat } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import VisionScanner from './components/VisionScanner';
import NutritionPanel from './components/NutritionPanel';
import HistoryLog from './components/HistoryLog';
import Settings from './components/Settings';

// Default daily calorie and macronutrient targets
const DEFAULT_GOALS = {
  calories: 2000,
  protein: 130,
  carbs: 220,
  fat: 65
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Daily target goals
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('nutri_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  // Food log journal history
  const [loggedMeals, setLoggedMeals] = useState(() => {
    const saved = localStorage.getItem('logged_meals');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist goals to localstorage
  useEffect(() => {
    localStorage.setItem('nutri_goals', JSON.stringify(goals));
  }, [goals]);

  // Persist meals history to localstorage
  useEffect(() => {
    localStorage.setItem('logged_meals', JSON.stringify(loggedMeals));
  }, [loggedMeals]);

  // Save Settings panel configuration
  const handleSaveSettings = ({ apiKey: newKey, goals: newGoals }) => {
    setApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
    setGoals(newGoals);
    setIsSettingsOpen(false);
  };

  // Add meal to daily journal
  const handleSaveMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setLoggedMeals((prev) => [...prev, newMeal]);
    setAnalysisResult(null); // Reset current analysis panel
    setActiveTab('dashboard'); // Redirect to home dashboard
  };

  // Delete logged meal item
  const handleDeleteMeal = (mealId) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">
              <FaHeartbeat />
            </div>
            <h1 className="brand-name">NutriScan AI</h1>
          </div>

          <nav className="nav-links">
            <li
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <FaChartBar /> Dashboard
            </li>
            <li
              className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={() => setActiveTab('scanner')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <FaCamera /> Scan Food
            </li>
            <li
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <FaHistory /> Log History
            </li>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setIsSettingsOpen(true)}
          >
            <FaCog /> Settings
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="content-wrapper">
        {/* Settings Modal */}
        {isSettingsOpen && (
          <Settings
            goals={goals}
            apiKey={apiKey}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        {/* Tab Selection Switch */}
        {activeTab === 'dashboard' && (
          <>
            <h2 className="header-title">Daily Overview</h2>
            <p className="header-subtitle">Track your calorie limits and macronutrients summary.</p>
            <Dashboard loggedMeals={loggedMeals} goals={goals} setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'scanner' && (
          <>
            <h2 className="header-title">Vision AI Analyzer</h2>
            <p className="header-subtitle">Scan plate contents and dynamically configure weight portions.</p>
            
            {/* Split layout: If an image has been successfully scanned, show nutrition details side-by-side */}
            {analysisResult ? (
              <div className="scanner-container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <VisionScanner
                    apiKey={apiKey}
                    onAnalysisComplete={(res) => setAnalysisResult(res)}
                  />
                  {/* Small card to reset analysis */}
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Want to analyze a different plate?
                    </p>
                    <button
                      className="btn-secondary"
                      style={{ marginTop: '0.75rem', width: '100%' }}
                      onClick={() => setAnalysisResult(null)}
                    >
                      Reset Scanner
                    </button>
                  </div>
                </div>

                <NutritionPanel
                  analysisResult={analysisResult}
                  onSaveMeal={handleSaveMeal}
                />
              </div>
            ) : (
              <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                <VisionScanner
                  apiKey={apiKey}
                  onAnalysisComplete={(res) => setAnalysisResult(res)}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <h2 className="header-title">Weekly Journals</h2>
            <p className="header-subtitle">Review your weekly intake analysis and analytics graph.</p>
            <HistoryLog
              loggedMeals={loggedMeals}
              goals={goals}
              onDeleteMeal={handleDeleteMeal}
            />
          </>
        )}
      </main>
    </div>
  );
}
