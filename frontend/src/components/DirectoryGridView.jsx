import React from 'react';

export default function DirectoryGridView({ places, onSelectPlace }) {
  return (
    <div className="directory-grid-container">
      <div className="dir-header">
        <h2>Global Places Directory ({places.length} Locations)</h2>
        <p>Explore curated world landmarks, tech centers, capitals, and natural wonders across the Earth.</p>
      </div>

      <div className="dir-cards-grid">
        {places.length === 0 ? (
          <div className="empty-dir-msg">No matching locations found for current search filter.</div>
        ) : (
          places.map(place => (
            <div key={place.id} className="dir-card glass-panel" onClick={() => onSelectPlace(place)}>
              <div className="dir-hero-img" style={{ backgroundImage: `url(${place.heroImage})` }}>
                <div className="dir-badge">{place.flag} {place.categoryName}</div>
              </div>

              <div className="dir-card-body">
                <h3 className="dir-place-name">{place.name}</h3>
                <div className="dir-place-location">{place.city}, {place.country}</div>

                <div className="dir-meta-row">
                  <span className="dir-weather">🌡️ {place.weather.temp}</span>
                  <span className="dir-rating">⭐ {place.rating}</span>
                  <span className="dir-elev">⛰️ {place.elevation}</span>
                </div>

                <p className="dir-desc-snippet">
                  {place.description.length > 100 ? `${place.description.substring(0, 100)}...` : place.description}
                </p>

                <button className="btn btn-primary btn-sm full-width" style={{ marginTop: '12px' }}>
                  Fly To on Map ➔
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
