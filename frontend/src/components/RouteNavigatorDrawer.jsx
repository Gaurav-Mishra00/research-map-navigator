import React, { useState, useEffect, useCallback } from 'react';
import { PRESET_ROUTES } from '../services/earthPlacesData';

const TRAVEL_MODES = [
  { id: 'DRIVING',  label: '🚗 Driving' },
  { id: 'TRANSIT',  label: '🚆 Transit' },
  { id: 'WALKING',  label: '🚶 Walking' },
  { id: 'BICYCLING', label: '🚴 Cycling' },
];

function StripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '');
}

export default function RouteNavigatorDrawer({
  isOpen,
  onClose,
  places,
  directionsResult,
  onCalculateDirections,
  onClearRoute,
  destinationPlace,
}) {
  const [originId, setOriginId] = useState(places[12]?.id || places[0]?.id);
  const [targetId, setTargetId] = useState(destinationPlace?.id || places[0]?.id);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [isLoading, setIsLoading] = useState(false);

  // ── All hooks MUST be declared before any conditional return ──────────────
  useEffect(() => {
    if (destinationPlace) setTargetId(destinationPlace.id);
  }, [destinationPlace]);

  useEffect(() => {
    if (directionsResult) setIsLoading(false);
  }, [directionsResult]);

  // Early return after all hooks
  if (!isOpen) return null;

  const handleCalculate = () => {
    const origin = places.find(p => p.id === originId);
    const destination = places.find(p => p.id === targetId);
    if (!origin || !destination) return;
    if (origin.id === destination.id) {
      alert('Please choose different origin and destination.');
      return;
    }
    setIsLoading(true);
    onCalculateDirections(origin, destination, travelMode);
  };

  const handleExportGPX = () => {
    if (!directionsResult) return;
    const leg = directionsResult.routes[0].legs[0];
    const waypoints = leg.steps.map(s => ({
      lat: s.start_location.lat(),
      lng: s.start_location.lng(),
      name: StripHtml(s.instructions),
    }));
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Earth Map Navigator">
  <trk>
    <name>${leg.start_address} → ${leg.end_address}</name>
    <trkseg>
      ${waypoints.map(w => `<trkpt lat="${w.lat}" lon="${w.lng}"><name>${w.name.slice(0, 60)}</name></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;
    const dataStr = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpxContent);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `route_${Date.now()}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSwap = () => {
    const tmp = originId;
    setOriginId(targetId);
    setTargetId(tmp);
  };

  const leg = directionsResult?.routes?.[0]?.legs?.[0];

  return (
    <aside className="route-drawer glass-panel-heavy">
      <div className="drawer-header">
        <div className="drawer-title">🧭 Route Navigator</div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="drawer-body">
        {/* Travel Mode Switcher */}
        <div className="mode-switcher">
          {TRAVEL_MODES.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${travelMode === mode.id ? 'active' : ''}`}
              onClick={() => setTravelMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Origin & Destination */}
        <div className="inputs-card glass-panel" style={{ marginTop: 12 }}>
          <div className="input-row">
            <span className="dot origin-dot"></span>
            <select value={originId} onChange={e => setOriginId(e.target.value)} className="select-box">
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.flag} {p.name} — {p.city}, {p.country}</option>
              ))}
            </select>
          </div>

          <button className="swap-btn" onClick={handleSwap} title="Swap origin and destination">⇅</button>

          <div className="input-row">
            <span className="dot dest-dot"></span>
            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="select-box">
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.flag} {p.name} — {p.city}, {p.country}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary full-width"
          onClick={handleCalculate}
          style={{ marginTop: 12 }}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Calculating…' : '🗺️ Get Google Directions'}
        </button>

        {/* Popular Preset Routes */}
        <div className="preset-routes-section" style={{ marginTop: 16 }}>
          <div className="section-label">Popular Curated Tours</div>
          <div className="preset-list">
            {PRESET_ROUTES.map(preset => {
              const origin = places.find(p => p.id === preset.originId);
              const destination = places.find(p => p.id === preset.destinationId);
              return (
                <button
                  key={preset.id}
                  className="preset-route-card glass-panel"
                  onClick={() => {
                    setOriginId(preset.originId);
                    setTargetId(preset.destinationId);
                    if (origin && destination) {
                      onCalculateDirections(origin, destination, travelMode);
                    }
                  }}
                >
                  <div className="preset-title">{preset.name}</div>
                  <div className="preset-sub">{preset.distanceKm} km · {preset.durationText}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Google Directions Result */}
        {leg && (
          <div className="route-results-card glass-panel" style={{ marginTop: 18 }}>
            <div className="result-header">
              <div>
                <div className="route-distance glow-text-cyan">{leg.distance.text}</div>
                <div className="route-duration">{leg.duration.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {leg.start_address.split(',').slice(0, 2).join(',')} → {leg.end_address.split(',').slice(0, 2).join(',')}
                </div>
              </div>
              <div className="result-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleExportGPX} title="Export route as GPX file">
                  💾 GPX
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { onClearRoute(); }}>
                  Clear
                </button>
              </div>
            </div>

            {/* Turn-by-Turn Steps (real from Google) */}
            <div className="steps-list" style={{ marginTop: 14 }}>
              <div className="section-label">Turn-by-Turn Directions</div>
              {leg.steps.slice(0, 12).map((step, idx) => (
                <div key={idx} className="step-item">
                  <span className="step-num">{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <span className="step-text">{StripHtml(step.instructions)}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {step.distance.text} · {step.duration.text}
                    </span>
                  </div>
                </div>
              ))}
              {leg.steps.length > 12 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                  +{leg.steps.length - 12} more steps on map
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
