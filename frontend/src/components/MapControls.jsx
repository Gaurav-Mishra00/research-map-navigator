import React, { useState } from 'react';

const MAP_TYPES = [
  { id: 'roadmap',   name: 'Dark Road', icon: '🗺️' },
  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
  { id: 'hybrid',    name: 'Hybrid',    icon: '🌍' },
  { id: 'terrain',   name: 'Terrain',   icon: '⛰️' },
];

export default function MapControls({
  mapTypeId,
  setMapTypeId,
  showTraffic,
  setShowTraffic,
  showTransit,
  setShowTransit,
  tilt3D,
  setTilt3D,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onResetWorldView,
  isMeasuring,
  setIsMeasuring,
  onClearMeasurement,
  onMyLocation,
  isLocating,
  locationError,
}) {
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const activeType = MAP_TYPES.find(t => t.id === mapTypeId) || MAP_TYPES[0];

  return (
    <div className="map-controls-floating">
      {/* Zoom & Camera */}
      <div className="controls-panel glass-panel">
        <button className="control-btn" onClick={onZoomIn} title="Zoom In">+</button>
        <button className="control-btn" onClick={onZoomOut} title="Zoom Out">−</button>
        <div className="control-divider"></div>
        <button className="control-btn" onClick={onResetNorth} title="Reset North">🧭</button>
        <button className="control-btn" onClick={onResetWorldView} title="World View">🌐</button>
        <button
          className={`control-btn ${tilt3D ? 'active' : ''}`}
          onClick={() => setTilt3D(!tilt3D)}
          title="Toggle 45° 3D Tilt"
        >
          📐
        </button>
      </div>

      {/* Live Location */}
      <div className="controls-panel glass-panel">
        <button
          className={`control-btn location-btn ${isLocating ? 'locating' : ''}`}
          onClick={onMyLocation}
          title="Find My Live Location"
          disabled={isLocating}
        >
          {isLocating ? (
            <span className="locating-spinner"></span>
          ) : '📍'}
        </button>
        <span className="location-label">{isLocating ? 'Locating…' : 'My Location'}</span>
      </div>

      {/* Layers & Overlays */}
      <div className="controls-panel glass-panel style-switcher-panel">
        <button
          className="control-btn layer-btn"
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          title="Switch Map Type"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span className="layer-label">{activeType.icon} {activeType.name}</span>
        </button>

        <div className="control-divider"></div>

        <button
          className={`control-btn overlay-pill-btn ${showTraffic ? 'active' : ''}`}
          onClick={() => setShowTraffic(!showTraffic)}
          title="Live Google Traffic"
        >
          🚦 Traffic
        </button>

        <button
          className={`control-btn overlay-pill-btn ${showTransit ? 'active' : ''}`}
          onClick={() => setShowTransit(!showTransit)}
          title="Google Transit Network"
        >
          🚇 Transit
        </button>

        {isLayerMenuOpen && (
          <div className="layer-menu glass-panel-heavy">
            <div className="menu-header">Google Maps Type</div>
            {MAP_TYPES.map(type => (
              <button
                key={type.id}
                className={`layer-option ${mapTypeId === type.id ? 'active' : ''}`}
                onClick={() => { setMapTypeId(type.id); setIsLayerMenuOpen(false); }}
              >
                <span>{type.icon}</span>
                <span className="option-name">{type.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Measure */}
      <div className="controls-panel glass-panel">
        <button
          className={`control-btn measure-btn ${isMeasuring ? 'active' : ''}`}
          onClick={() => setIsMeasuring(!isMeasuring)}
          title="Measure distance between points"
        >
          📏 {isMeasuring ? 'Measuring…' : 'Measure'}
        </button>
        {isMeasuring && (
          <button className="control-btn text-red" onClick={onClearMeasurement}>Clear</button>
        )}
      </div>
    </div>
  );
}
