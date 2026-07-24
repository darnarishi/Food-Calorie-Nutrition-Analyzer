import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Settings Panel Modal. 
 * Allows setting a custom Gemini API Key and editing daily target goals.
 */
export default function Settings({ goals, apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [calories, setCalories] = useState(goals.calories || 2000);
  const [protein, setProtein] = useState(goals.protein || 150);
  const [carbs, setCarbs] = useState(goals.carbs || 200);
  const [fat, setFat] = useState(goals.fat || 70);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      apiKey: key,
      goals: {
        calories: parseInt(calories) || 2000,
        protein: parseInt(protein) || 150,
        carbs: parseInt(carbs) || 200,
        fat: parseInt(fat) || 70
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Profile & Target Settings</h2>
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Gemini API Key input block */}
          <div className="form-group">
            <label className="form-label">Gemini API Key</label>
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
              <input
                type={showKey ? 'text' : 'password'}
                className="form-input"
                style={{ flexGrow: 1 }}
                placeholder="Enter AI API Key..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.85rem' }}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Your key is saved locally in your browser. Leave empty to use Demo Mode.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            {/* Daily target settings */}
            <div className="form-group">
              <label className="form-label">Calorie Goal (kcal)</label>
              <input
                type="number"
                className="form-input"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Protein Goal (g)</label>
              <input
                type="number"
                className="form-input"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carbs Goal (g)</label>
              <input
                type="number"
                className="form-input"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fats Goal (g)</label>
              <input
                type="number"
                className="form-input"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
