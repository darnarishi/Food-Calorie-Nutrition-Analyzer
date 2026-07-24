import React, { useState, useEffect } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import DigestionSimulator from './DigestionSimulator';

export default function NutritionPanel({ analysisResult, onSaveMeal }) {
  // Store scaling factors (portion multipliers) for each food component
  // 1.0 means 100% of the base portion weight
  const [multipliers, setMultipliers] = useState({});
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Reset portion scales when a new scan result arrives
  useEffect(() => {
    if (analysisResult && analysisResult.detectedItems) {
      const initialMultipliers = {};
      analysisResult.detectedItems.forEach((_, index) => {
        initialMultipliers[index] = 1.0;
      });
      setMultipliers(initialMultipliers);
      setSelectedItemIndex(0);
    }
  }, [analysisResult]);

  if (!analysisResult) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <p>Awaiting food analysis scan...</p>
      </div>
    );
  }

  const { detectedItems = [], healthTips = [] } = analysisResult;

  // Handle portion slider adjustments
  const handleScaleChange = (index, value) => {
    setMultipliers((prev) => ({
      ...prev,
      [index]: parseFloat(value)
    }));
  };

  // Compute live scaled totals for the entire plate
  const totals = detectedItems.reduce(
    (acc, item, index) => {
      const mult = multipliers[index] || 1.0;
      acc.calories += Math.round(item.calories * mult);
      acc.protein += parseFloat((item.protein * mult).toFixed(1));
      acc.carbs += parseFloat((item.carbs * mult).toFixed(1));
      acc.fat += parseFloat((item.fat * mult).toFixed(1));
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Package the meal details and log it
  const handleLogClick = () => {
    // Construct scaled sub-items list
    const scaledItems = detectedItems.map((item, index) => {
      const mult = multipliers[index] || 1.0;
      return {
        ...item,
        calories: Math.round(item.calories * mult),
        protein: parseFloat((item.protein * mult).toFixed(1)),
        carbs: parseFloat((item.carbs * mult).toFixed(1)),
        fat: parseFloat((item.fat * mult).toFixed(1)),
        weightGrams: Math.round((item.baseWeightGrams || 100) * mult)
      };
    });

    onSaveMeal({
      name: analysisResult.name || detectedItems.map(i => i.foodName).join(' & '),
      gradient: analysisResult.gradient,
      imageUrl: analysisResult.imageUrl,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      items: scaledItems,
      healthTips
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Plate Composition Breakdown */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Plate Composition</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {detectedItems.map((item, index) => {
            const mult = multipliers[index] || 1.0;
            const currentWeight = Math.round((item.baseWeightGrams || 100) * mult);
            const isSelected = selectedItemIndex === index;

            return (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  padding: '1rem', 
                  border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.04)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedItemIndex(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.foodName}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentWeight}g</span>
                </div>

                {isSelected && (
                  <div className="portion-slider-container">
                    <div className="slider-label-row">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Portion Scale</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{Math.round(mult * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="2.5"
                      step="0.05"
                      className="custom-range"
                      value={mult}
                      onChange={(e) => handleScaleChange(index, e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span>Cal: {Math.round(item.calories * mult)} kcal</span>
                      <span>P: {Math.round(item.protein * mult)}g | C: {Math.round(item.carbs * mult)}g | F: {Math.round(item.fat * mult)}g</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Plate Nutrition Label Card */}
      <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center' }}>Nutrition Summary</h3>
        
        {/* Sleek Modern Nutrition facts layout */}
        <div style={{ border: '2px solid var(--text-primary)', padding: '1rem', fontFamily: 'inherit', color: 'var(--text-primary)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, borderBottom: '6px solid var(--text-primary)', paddingBottom: '0.25rem' }}>Nutrition Facts</h2>
          
          <div style={{ borderBottom: '1px solid var(--text-primary)', padding: '0.25rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
            Total Plate Portion
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '8px solid var(--text-primary)', padding: '0.5rem 0', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Amount Per Serving</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Calories {totals.calories}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--text-primary)', padding: '0.4rem 0', fontSize: '0.9rem' }}>
            <span><strong>Protein</strong></span>
            <span><strong>{totals.protein}g</strong></span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--text-primary)', padding: '0.4rem 0', fontSize: '0.9rem' }}>
            <span><strong>Total Carbohydrate</strong></span>
            <span><strong>{totals.carbs}g</strong></span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid var(--text-primary)', padding: '0.4rem 0', fontSize: '0.9rem' }}>
            <span><strong>Total Fat</strong></span>
            <span><strong>{totals.fat}g</strong></span>
          </div>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
          onClick={handleLogClick}
        >
          Add to Daily Journal (+{totals.calories} kcal)
        </button>
      </div>

      {/* Blood Sugar Simulation Curve */}
      <DigestionSimulator detectedItems={detectedItems.map((item, index) => {
        const mult = multipliers[index] || 1.0;
        return {
          ...item,
          carbs: item.carbs * mult,
          protein: item.protein * mult,
          fat: item.fat * mult
        };
      })} />

      {/* AI Food Health Insights List */}
      {healthTips.length > 0 && (
        <div className="glass-panel">
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaLightbulb style={{ color: 'var(--amber)' }} /> AI Dietary Insights
          </h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {healthTips.map((tip, idx) => (
              <li key={idx} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, borderLeft: '2px solid var(--primary)', paddingLeft: '0.75rem' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
