import React from 'react';

/**
 * Dashboard Component
 * Renders daily progress, circular calorie SVG tracker, and macronutrient targets.
 */
export default function Dashboard({ loggedMeals = [], goals, setActiveTab }) {
  // Filter meals logged today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysMeals = loggedMeals.filter((meal) => {
    const mealDate = new Date(meal.timestamp);
    return mealDate >= todayStart;
  });

  // Aggregate today's macros
  const stats = todaysMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.totalCalories || 0;
      acc.protein += meal.totalProtein || 0;
      acc.carbs += meal.totalCarbs || 0;
      acc.fat += meal.totalFat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calRemaining = Math.max(0, goals.calories - stats.calories);
  const calPercent = Math.min(100, Math.round((stats.calories / goals.calories) * 100));

  // SVG Circular progress math (circumference is 2 * PI * radius)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  return (
    <div className="dashboard-main">
      <div className="glass-panel stats-summary-card">
        {/* Calorie circular progress meter */}
        <div className="svg-progress-container">
          <svg viewBox="0 0 120 120" className="circular-chart">
            <circle className="circle-bg" cx="60" cy="60" r={radius} />
            <circle
              className="circle-progress calories"
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="circle-percentage-text">
            <div className="calorie-val">{stats.calories}</div>
            <div className="calorie-lbl">of {goals.calories} kcal</div>
          </div>
        </div>

        {/* Macros panel with customized neon gradient progress bars */}
        <div className="macros-grid">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Macronutrients</h3>

          <div className="macro-item">
            <div className="macro-header">
              <span>Protein</span>
              <span>{Math.round(stats.protein)}g / {goals.protein}g</span>
            </div>
            <div className="macro-bar-outer">
              <div
                className="macro-bar-inner protein"
                style={{ width: `${Math.min(100, (stats.protein / goals.protein) * 100)}%` }}
              />
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-header">
              <span>Carbs</span>
              <span>{Math.round(stats.carbs)}g / {goals.carbs}g</span>
            </div>
            <div className="macro-bar-outer">
              <div
                className="macro-bar-inner carbs"
                style={{ width: `${Math.min(100, (stats.carbs / goals.carbs) * 100)}%` }}
              />
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-header">
              <span>Fats</span>
              <span>{Math.round(stats.fat)}g / {goals.fat}g</span>
            </div>
            <div className="macro-bar-outer">
              <div
                className="macro-bar-inner fat"
                style={{ width: `${Math.min(100, (stats.fat / goals.fat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards: Left and Remaining metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Remaining Calories</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--emerald)' }}>
            {calRemaining} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kcal</span>
          </h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Meals Logged Today</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--sky)' }}>
            {todaysMeals.length}
          </h2>
        </div>
      </div>

      {/* Log list for today */}
      <div className="glass-panel" style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Today's Food Journal</h3>
        {todaysMeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            <p>No meals logged today yet.</p>
            <button
              className="btn-primary"
              style={{ marginTop: '1rem', fontSize: '0.9rem' }}
              onClick={() => setActiveTab('scanner')}
            >
              Analyze a Plate
            </button>
          </div>
        ) : (
          <div className="history-list">
            {todaysMeals.map((meal) => (
              <div className="history-card" key={meal.id}>
                <div className="history-card-left">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="history-card-img" />
                  ) : (
                    <div className="brand-logo" style={{ borderRadius: '10px', width: '48px', height: '48px' }}>🥗</div>
                  )}
                  <div className="history-card-info">
                    <h4>{meal.name}</h4>
                    <p>{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="history-card-right">
                  <div className="history-card-calories">+{meal.totalCalories} kcal</div>
                  <div className="history-card-macros">
                    P: {Math.round(meal.totalProtein)}g | C: {Math.round(meal.totalCarbs)}g | F: {Math.round(meal.totalFat)}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
