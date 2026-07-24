import React from 'react';

/**
 * Digestion Simulator Component
 * Plots a dynamic SVG bezier absorption curve based on the macronutrient profile.
 * High simple carbs -> High spike & rapid crash.
 * High protein, fiber, fat -> Slow absorption plateau.
 */
export default function DigestionSimulator({ detectedItems = [] }) {
  if (detectedItems.length === 0) return null;

  // Calculate glycemic parameters based on macronutrients
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let highGiCount = 0;

  detectedItems.forEach((item) => {
    totalCarbs += item.carbs || 0;
    totalProtein += item.protein || 0;
    totalFat += item.fat || 0;
    if (item.glycemicIndex === 'high') {
      highGiCount++;
    }
  });

  // Calculate glycemic ratio (0 to 1)
  // Higher value = rapid spike, lower value = sustained release
  const totalMacros = totalCarbs + totalProtein + totalFat;
  const carbRatio = totalMacros > 0 ? totalCarbs / totalMacros : 0.5;
  const bufferMacros = totalProtein + totalFat;

  // If mostly carbs or high-GI items are present, spike is higher
  const spikeFactor = totalCarbs > 0 
    ? (carbRatio * 0.7) + ((highGiCount / detectedItems.length) * 0.3)
    : 0.2;

  // SVG coordinate calculations for a 400x120 viewport
  // Baseline glucose/energy is at Y = 90
  const startX = 20;
  const startY = 90;
  const endX = 380;
  const endY = 90;

  let pathData = '';
  let peakLabel = '';
  let peakColor = 'var(--primary)';
  let curveDescription = '';

  if (spikeFactor > 0.6) {
    // High Glycemic Spike (rapid rise, sudden crash below baseline)
    const peakX = 120;
    const peakY = 20; // Lower Y is higher on screen
    const crashX = 240;
    const crashY = 110; // Below baseline Y=90

    pathData = `M ${startX} ${startY} 
                C ${startX + 40} ${startY - 10}, ${peakX - 40} ${peakY}, ${peakX} ${peakY}
                C ${peakX + 50} ${peakY}, ${crashX - 50} ${crashY}, ${crashX} ${crashY}
                C ${crashX + 45} ${crashY}, ${endX - 40} ${startY + 5}, ${endX} ${endY}`;
    
    peakLabel = 'Rapid Energy Spike & Crash';
    peakColor = 'var(--rose)';
    curveDescription = 'This meal contains simple carbs that quickly release energy, leading to a fast glucose spike and subsequent insulin crash. You might feel fatigued in 1.5 - 2 hours.';
  } else if (spikeFactor > 0.3) {
    // Moderate Balanced Curve
    const peakX = 160;
    const peakY = 45;

    pathData = `M ${startX} ${startY} 
                C ${startX + 50} ${startY - 15}, ${peakX - 60} ${peakY}, ${peakX} ${peakY}
                C ${peakX + 80} ${peakY}, ${endX - 80} ${startY}, ${endX} ${endY}`;
    
    peakLabel = 'Moderate Sustained Energy';
    peakColor = 'var(--amber)';
    curveDescription = 'Moderate carbohydrates combined with proteins. Provides balanced energy release, supporting focus and steady metabolism over 2-3 hours.';
  } else {
    // Slow Release / Low Glycemic (stable plateau)
    const peakX = 200;
    const peakY = 60;

    pathData = `M ${startX} ${startY} 
                C ${startX + 70} ${startY - 10}, ${peakX - 80} ${peakY}, ${peakX} ${peakY}
                C ${peakX + 80} ${peakY}, ${endX - 50} ${startY}, ${endX} ${endY}`;
    
    peakLabel = 'Steady Slow-Release Absorption';
    peakColor = 'var(--emerald)';
    curveDescription = 'High protein/fat/fiber layout. Energy is absorbed slowly, maintaining insulin stability and keeping you full for 3-4+ hours.';
  }

  return (
    <div className="glass-panel digestion-graph-card">
      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Caloric Velocity (Digestion Simulator)
      </h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
        Projected energy absorption and glycemic response curve over a 4-hour window.
      </p>

      {/* Dynamic SVG Spline */}
      <svg className="svg-graph" viewBox="0 0 400 120">
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="40%" stopColor={peakColor} />
            <stop offset="100%" stopColor="var(--sky)" />
          </linearGradient>
        </defs>
        
        {/* Baseline Indicator Line */}
        <line x1="20" y1="90" x2="380" y2="90" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="4 4" strokeWidth="1" />
        <text x="25" y="82" fill="var(--text-muted)" fontSize="8" fontWeight="600">Baseline Glucose</text>

        {/* Hour Timeline markers */}
        <text x="20" y="112" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Eat</text>
        <text x="110" y="112" fill="var(--text-muted)" fontSize="9" textAnchor="middle">1h</text>
        <text x="200" y="112" fill="var(--text-muted)" fontSize="9" textAnchor="middle">2h</text>
        <text x="290" y="112" fill="var(--text-muted)" fontSize="9" textAnchor="middle">3h</text>
        <text x="380" y="112" fill="var(--text-muted)" fontSize="9" textAnchor="middle">4h</text>

        {/* The Glycemic Absorption Spline Path */}
        <path d={pathData} className="graph-path-bg" />
        <path d={pathData} className="graph-glow-layer" style={{ stroke: peakColor }} />
        <path d={pathData} className="graph-path-main" />
      </svg>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: peakColor,
          boxShadow: `0 0 10px ${peakColor}`,
          marginTop: '0.2rem',
          flexShrink: 0
        }} />
        <div>
          <h5 style={{ fontWeight: 700, fontSize: '0.9rem', color: peakColor }}>{peakLabel}</h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
            {curveDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
