import React from 'react';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarkedPlaces,
  onSelectPlace,
  onRemoveBookmark
}) {
  if (!isOpen) return null;

  return (
    <aside className="bookmarks-drawer glass-panel-heavy">
      <div className="drawer-header">
        <div className="drawer-title">
          <span>🔖 Saved Bookmarks & Favorite Places ({bookmarkedPlaces.length})</span>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="drawer-body">
        {bookmarkedPlaces.length === 0 ? (
          <div className="empty-bookmarks">
            <div className="empty-icon">📍</div>
            <p>No saved bookmarks yet.</p>
            <p className="empty-sub">Click "Add to Bookmarks" on any location inspector drawer to save your favorite global places.</p>
          </div>
        ) : (
          <div className="bookmarks-list">
            {bookmarkedPlaces.map(place => (
              <div key={place.id} className="bookmark-card glass-panel">
                <div className="bm-top">
                  <span className="badge badge-cyan">{place.flag} {place.categoryName}</span>
                  <button className="remove-bm-btn" onClick={() => onRemoveBookmark(place.id)} title="Remove Bookmark">✕</button>
                </div>
                <div className="bm-title">{place.name}</div>
                <div className="bm-sub">{place.city}, {place.country}</div>
                <div className="bm-coords">{place.lat.toFixed(2)}°, {place.lng.toFixed(2)}° • ⭐ {place.rating}</div>
                <button
                  className="btn btn-primary btn-sm full-width"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    onSelectPlace(place);
                    onClose();
                  }}
                >
                  Locate on Map ➔
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
