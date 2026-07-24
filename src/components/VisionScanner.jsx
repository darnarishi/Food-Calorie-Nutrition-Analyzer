import React, { useState, useRef } from 'react';
import { FaCamera, FaUtensils, FaInfoCircle } from 'react-icons/fa';
import { analyzeFoodImage, MOCK_PLATES } from '../services/geminiService';

// Organic CSS background gradients to serve as elegant placeholders for the demo meals
const DEMO_GRADIENTS = {
  'med-bowl': 'linear-gradient(135deg, #11998e, #38ef7d)',
  'avo-toast': 'linear-gradient(135deg, #F1F2B5, #135058)',
  'smoothie-bowl': 'linear-gradient(135deg, #ef32d9, #89fffd)'
};

export default function VisionScanner({ onAnalysisComplete }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedDemoId, setSelectedDemoId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Trigger file dialog
  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setSelectedDemoId(null);
        triggerAnalysis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick select a demo plate
  const handleDemoSelect = (plate) => {
    setImageSrc(null); // Clear custom image
    setSelectedDemoId(plate.id);
    setIsAnalyzing(true);

    // Simulate scanning
    setTimeout(() => {
      setIsAnalyzing(false);
      onAnalysisComplete({
        ...plate,
        imageUrl: null, // Indicates we use gradient card style
        gradient: DEMO_GRADIENTS[plate.id]
      });
    }, 2000);
  };

  // Perform Gemini analysis
  const triggerAnalysis = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(file, apiKey);
      setIsAnalyzing(false);
      onAnalysisComplete({
        ...result,
        imageUrl: URL.createObjectURL(file),
        gradient: null
      });
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Food scanner</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Snap or upload a photo of your food plate. Gemini Vision will analyze and tag each ingredient.
      </p>


      {/* Main Upload / Scanning Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: imageSrc || selectedDemoId ? '1fr' : '1fr', gap: '2rem' }}>
        
        {/* State: Idle / Initial upload view */}
        {!imageSrc && !selectedDemoId && (
          <div className="upload-dropzone" onClick={handleZoneClick}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div className="upload-icon">
              <FaCamera />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                Drag & Drop or Tap to Browse
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Supports JPEG, PNG, WEBP
              </p>
            </div>
          </div>
        )}

        {/* State: Active scan or analyzed view */}
        {(imageSrc || selectedDemoId) && (
          <div className="image-preview-wrapper" style={{ height: '350px', background: '#181a26', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Laser scanning beam overlay */}
            {isAnalyzing && <div className="scanner-laser" />}

            {/* Display user photo or colorful gradient for demo meal */}
            {imageSrc ? (
              <img src={imageSrc} alt="Preview" className="image-preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: DEMO_GRADIENTS[selectedDemoId],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <FaUtensils />
              </div>
            )}

            {isAnalyzing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>
                    AI Analysis in progress...
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Identifying ingredients & portions</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick demo presets section */}
      {!imageSrc && !selectedDemoId && !isAnalyzing && (
        <div style={{ marginTop: '2.5rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No photos handy? Try one of these demo meals:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {MOCK_PLATES.map((plate) => (
              <div
                key={plate.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  transition: 'var(--transition-smooth)'
                }}
                onClick={() => handleDemoSelect(plate)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Microgradient display */}
                <div
                  style={{
                    height: '80px',
                    borderRadius: '12px',
                    background: DEMO_GRADIENTS[plate.id],
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <FaUtensils />
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2 }}>{plate.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {plate.detectedItems.length} components
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(imageSrc || selectedDemoId) && !isAnalyzing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setImageSrc(null);
              setSelectedDemoId(null);
            }}
          >
            Clear and Reset
          </button>
        </div>
      )}
    </div>
  );
}
