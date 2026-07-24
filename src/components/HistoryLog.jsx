import React from 'react';

/**
 * HistoryLog Component
 * Displays the historical log of logged meals and plots a weekly SVG calorie chart.
 */
export default function HistoryLog({ loggedMeals = [], goals, onDeleteMeal }) {
  // Generate the last 7 days labels and calorie counts
  const getLast7DaysData = () => {
    const daysData = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString([], { weekday: 'short' });
      const dateStr = date.toDateString();

      // Start & end bounds of this specific day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Total calories for this day
      const dayCalories = loggedMeals
        .filter((meal) => {
          const mealDate = new Date(meal.timestamp);
          return mealDate >= startOfDay && mealDate <= endOfDay;
        })
        .reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);

      daysData.push({
        dayName,
        dateStr,
        calories: dayCalories
      });
    }
    return daysData;
  };

  const chartData = getLast7DaysData();
  const maxCalories = Math.max(...chartData.map((d) => d.calories), goals.calories, 1000);

  // SVG Chart Plotting Calculations (Viewport: 400 x 150)
  const chartHeight = 150;
  const paddingBottom = 25;
  const paddingTop = 20;
  const paddingLeft = 35;
  const paddingRight = 15;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = 400 - paddingLeft - paddingRight;

  const points = chartData.map((data, index) => {
    const x = paddingLeft + (index / 6) * graphWidth;
    // Map calories value: 0 corresponds to bottom, maxCalories corresponds to top (paddingTop)
    const y = chartHeight - paddingBottom - (data.calories / maxCalories) * graphHeight;
    return { x, y, calories: data.calories, day: data.dayName };
  });

  // Construct SVG Polyline or Spline path
  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Calculate target goal Y position on chart
  const targetGoalY = chartHeight - paddingBottom - (goals.calories / maxCalories) * graphHeight;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 7-day Calorie Trend Chart */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Weekly Calorie Trend</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          Your daily calorie consumption compared to your target goal.
        </p>

        <svg viewBox="0 0 400 150" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Goal Line Indicator */}
          <line
            x1={paddingLeft}
            y1={targetGoalY}
            x2={400 - paddingRight}
            y2={targetGoalY}
            stroke="var(--emerald)"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            style={{ opacity: 0.8 }}
          />
          <text
            x={400 - paddingRight - 5}
            y={targetGoalY - 5}
            fill="var(--emerald)"
            fontSize="8"
            fontWeight="700"
            textAnchor="end"
          >
            Goal: {goals.calories} kcal
          </text>

          {/* Calorie markers on the left Y-axis */}
          <text x={paddingLeft - 8} y={paddingTop + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
            {Math.round(maxCalories)}
          </text>
          <text x={paddingLeft - 8} y={paddingTop + graphHeight / 2 + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
            {Math.round(maxCalories / 2)}
          </text>
          <text x={paddingLeft - 8} y={chartHeight - paddingBottom + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
            0
          </text>

          {/* Chart filled gradient area and stroke path */}
          {points.length > 0 && (
            <>
              {/* Fill area */}
              <path
                d={`${pathString} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`}
                fill="url(#chart-gradient)"
              />
              {/* Outline stroke */}
              <path d={pathString} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Point nodes and tooltips */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#fff"
                stroke="var(--primary)"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'r 0.1s ease' }}
                onMouseEnter={(e) => e.target.setAttribute('r', '6.5')}
                onMouseLeave={(e) => e.target.setAttribute('r', '4.5')}
              />
              {/* Values above points */}
              <text x={p.x} y={p.y - 8} fill="var(--text-primary)" fontSize="7" fontWeight="600" textAnchor="middle">
                {p.calories > 0 ? `${p.calories}` : ''}
              </text>
              {/* Day names along X-axis */}
              <text x={p.x} y={chartHeight - paddingBottom + 16} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Historical List Log */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Meal Log History</h3>
        {loggedMeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No meals recorded yet.
          </div>
        ) : (
          <div className="history-list">
            {loggedMeals.slice().reverse().map((meal) => (
              <div className="history-card" key={meal.id}>
                <div className="history-card-left">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="history-card-img" />
                  ) : (
                    <div className="brand-logo" style={{ borderRadius: '10px', width: '48px', height: '48px' }}>🥗</div>
                  )}
                  <div className="history-card-info">
                    <h4>{meal.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(meal.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="history-card-right">
                    <div className="history-card-calories">+{meal.totalCalories} kcal</div>
                    <div className="history-card-macros">
                      P: {Math.round(meal.totalProtein)}g | C: {Math.round(meal.totalCarbs)}g | F: {Math.round(meal.totalFat)}g
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--rose)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = 1)}
                    onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
                    title="Delete log"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
