import React, { useState } from 'react';
import { PLACE_CATEGORIES } from '../services/earthPlacesData';

export default function MapHeader({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  onOpenRoutePlanner,
  onOpenBookmarks,
  bookmarksCount,
  onGoogleSearch,
  isDarkMode,
  onToggleTheme,
  onOpenLiveEarth,
  onOpenCommand,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onGoogleSearch) onGoogleSearch(searchQuery);
  };

  return (
    <header className="map-header glass-panel-heavy">
      {/* Brand */}
      <div className="header-brand">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
        </div>
        <div className="brand-title-wrap">
          <span className="brand-main">Earth Map</span>
          <span className="brand-accent glow-text-cyan">Navigator</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="header-search-wrap">
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search anywhere on Earth — Tokyo, Grand Canyon, Eiffel Tower…"
            aria-label="Search anywhere on Earth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
          {onOpenCommand && (
            <button className="search-shortcut" onClick={onOpenCommand} title="Open command search (Ctrl or Cmd + K)">
              <kbd>⌘K</kbd>
            </button>
          )}
          {onGoogleSearch && (
            <button className="search-go-btn" onClick={() => onGoogleSearch(searchQuery)} title="Search on Google Maps" aria-label="Search on Google Maps">
              🔍
            </button>
          )}
        </div>
      </div>

      {/* Desktop controls */}
      <div className="header-controls">
        <div className="category-pills">
          {PLACE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="view-mode-tabs">
          <button className={`tab-item ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
            🗺️ Map
          </button>
          <button className={`tab-item ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
            📋 Explore
          </button>
        </div>

        <div className="header-actions">
          {/* Live Earth Button */}
          <button className="btn btn-earth btn-sm" onClick={onOpenLiveEarth} title="View live rotating Earth globe">
            🌍 Live Earth
          </button>

          <button className="btn btn-primary btn-sm" onClick={onOpenRoutePlanner}>
            🧭 Directions
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onOpenBookmarks}>
            🔖 {bookmarksCount}
          </button>

          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Mobile hamburger menu */}
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(m => !m)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile expanded menu */}
      {menuOpen && (
        <div className="mobile-header-menu glass-panel-heavy">
          <div className="mobile-menu-pills">
            {PLACE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat.id); setMenuOpen(false); }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
          <div className="mobile-menu-actions">
            <button className="btn btn-earth btn-sm" onClick={() => { onOpenLiveEarth(); setMenuOpen(false); }}>
              🌍 Live Earth
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { onOpenRoutePlanner(); setMenuOpen(false); }}>
              🧭 Directions
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { onOpenBookmarks(); setMenuOpen(false); }}>
              🔖 Bookmarks ({bookmarksCount})
            </button>
            <button className="theme-toggle-btn" onClick={() => { onToggleTheme(); setMenuOpen(false); }}>
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
