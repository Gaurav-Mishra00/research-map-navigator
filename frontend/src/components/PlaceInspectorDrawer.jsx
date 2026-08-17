import React, { useState } from 'react';

export default function PlaceInspectorDrawer({
  place,
  onClose,
  onOpenDirectionsTo,
  isBookmarked,
  onToggleBookmark
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!place) return null;

  const photosList = place.photos && place.photos.length > 0 ? place.photos : [place.heroImage];
  const currentPhoto = photosList[activePhotoIdx] || place.heroImage;

  const handleNextPhoto = () => {
    setActivePhotoIdx((activePhotoIdx + 1) % photosList.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((activePhotoIdx - 1 + photosList.length) % photosList.length);
  };

  const handleCopyCoords = () => {
    const coordsStr = `${place.lat.toFixed(4)}°, ${place.lng.toFixed(4)}°`;
    navigator.clipboard.writeText(coordsStr);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <aside className="place-inspector glass-panel-heavy">
      {/* Hero Photo Carousel */}
      <div className="inspector-hero" style={{ backgroundImage: `url(${currentPhoto})` }}>
        <div className="hero-overlay"></div>
        <button className="close-btn" onClick={onClose}>✕</button>

        {photosList.length > 1 && (
          <div className="photo-nav-controls">
            <button className="photo-nav-btn" onClick={handlePrevPhoto}>❮</button>
            <span className="photo-counter">{activePhotoIdx + 1} / {photosList.length}</span>
            <button className="photo-nav-btn" onClick={handleNextPhoto}>❯</button>
          </div>
        )}

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge badge-cyan">{place.flag} {place.categoryName}</span>
            <span className="rating-pill">⭐ {place.rating} ({place.reviewsCount.toLocaleString()})</span>
          </div>
          <h2 className="hero-title">{place.name}</h2>
          <div className="hero-sub">{place.city}, {place.country}</div>
        </div>
      </div>

      <div className="inspector-body">
        {/* Live Weather Widget */}
        <div className="weather-card glass-panel">
          <div className="weather-title">Live Weather Overview</div>
          <div className="weather-grid">
            <div className="weather-item">
              <span className="w-label">Temperature</span>
              <span className="w-val glow-text-cyan">{place.weather.temp}</span>
            </div>
            <div className="weather-item">
              <span className="w-label">Condition</span>
              <span className="w-val">{place.weather.condition}</span>
            </div>
            <div className="weather-item">
              <span className="w-label">Wind Speed</span>
              <span className="w-val">{place.weather.wind}</span>
            </div>
            <div className="weather-item">
              <span className="w-label">Humidity</span>
              <span className="w-val">{place.weather.humidity}</span>
            </div>
          </div>
        </div>

        {/* Location Coordinates, Elevation & Timezone */}
        <div className="coords-card glass-panel">
          <div className="coords-row">
            <div>
              <div className="row-label">GPS Coordinates</div>
              <div className="row-val">{place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyCoords}>
              {copiedCoords ? 'Copied! ✓' : 'Copy'}
            </button>
          </div>

          <div className="coords-row" style={{ marginTop: '10px' }}>
            <div>
              <div className="row-label">Elevation / Height</div>
              <div className="row-val">{place.elevation}</div>
            </div>
            <div>
              <div className="row-label">Local Timezone</div>
              <div className="row-val">{place.timezone || 'UTC Standard'}</div>
            </div>
          </div>
        </div>

        {/* Overview Description */}
        <section className="desc-section">
          <h3 className="section-title">Overview & History</h3>
          <p className="desc-text">{place.description}</p>
        </section>

        {/* Nearby Points of Interest (POIs) */}
        {place.nearbyPois && place.nearbyPois.length > 0 && (
          <section className="pois-section">
            <h3 className="section-title">Nearby Attractions & Dining</h3>
            <div className="pois-list">
              {place.nearbyPois.map((poi, idx) => (
                <div key={idx} className="poi-item glass-panel">
                  <div className="poi-name">{poi.name}</div>
                  <div className="poi-meta">{poi.type} • {poi.dist} away</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary full-width" onClick={() => onOpenDirectionsTo(place)}>
            🧭 Directions To Here
          </button>

          <button
            className={`btn ${isBookmarked ? 'btn-secondary' : 'btn-secondary'} full-width`}
            onClick={() => onToggleBookmark(place)}
          >
            {isBookmarked ? '🔖 Saved in Bookmarks ✓' : '🔖 Add to Bookmarks'}
          </button>

          {place.wikipediaUrl && (
            <a
              href={place.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm full-width"
            >
              Read Wikipedia Article ↗
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
