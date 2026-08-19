import React from 'react';

const NAV_ITEMS = [
  { id: 'map', label: 'Map canvas', eyebrow: 'Navigate', glyph: '⌁' },
  { id: 'grid', label: 'Explore places', eyebrow: 'Explore', glyph: '◈' },
];

export default function CommandSidebar({
  viewMode,
  setViewMode,
  onOpenRoutePlanner,
  onOpenBookmarks,
  onOpenLiveEarth,
  isMeasuring,
  setIsMeasuring,
  bookmarkCount,
  isLocating,
  onMyLocation,
  isDarkMode,
  onToggleTheme,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <aside className={`command-sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="ResearchMap command navigation">
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true"><span>RM</span></div>
        {!collapsed && <div><strong>ResearchMap</strong><span>Navigator / 02</span></div>}
        <button className="icon-button sidebar-collapse" onClick={onToggleCollapsed} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <div className="sidebar-scroll">
        <div className="sidebar-group">
          {!collapsed && <p className="sidebar-label">Workspace</p>}
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sidebar-item ${viewMode === item.id ? 'active' : ''}`} onClick={() => setViewMode(item.id)} title={collapsed ? item.label : undefined}>
              <span className="sidebar-glyph" aria-hidden="true">{item.glyph}</span>
              {!collapsed && <span><small>{item.eyebrow}</small>{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-group">
          {!collapsed && <p className="sidebar-label">Operations</p>}
          <button className="sidebar-item" onClick={onOpenRoutePlanner} title={collapsed ? 'Plan a route' : undefined}>
            <span className="sidebar-glyph" aria-hidden="true">↗</span>
            {!collapsed && <span><small>Navigate</small>Plan a route</span>}
          </button>
          <button className="sidebar-item" onClick={onOpenBookmarks} title={collapsed ? 'Saved locations' : undefined}>
            <span className="sidebar-glyph" aria-hidden="true">☆</span>
            {!collapsed && <span><small>Library</small>Saved locations <b className="sidebar-count">{bookmarkCount}</b></span>}
          </button>
          <button className={`sidebar-item ${isMeasuring ? 'active' : ''}`} onClick={() => setIsMeasuring(!isMeasuring)} title={collapsed ? 'Measure distance' : undefined}>
            <span className="sidebar-glyph" aria-hidden="true">⌁</span>
            {!collapsed && <span><small>Analyze</small>{isMeasuring ? 'Stop measuring' : 'Measure distance'}</span>}
          </button>
        </div>

        <div className="sidebar-group">
          {!collapsed && <p className="sidebar-label">Visualize</p>}
          <button className="sidebar-item" onClick={onOpenLiveEarth} title={collapsed ? 'Open global view' : undefined}>
            <span className="sidebar-glyph" aria-hidden="true">◎</span>
            {!collapsed && <span><small>Immersive</small>Global view</span>}
          </button>
          <button className="sidebar-item" onClick={onMyLocation} title={collapsed ? 'Center on location' : undefined}>
            <span className={`sidebar-glyph ${isLocating ? 'pulse' : ''}`} aria-hidden="true">⊙</span>
            {!collapsed && <span><small>Location</small>{isLocating ? 'Locating…' : 'Center on me'}</span>}
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        {!collapsed && <div className="sidebar-status"><span className="status-dot" /> <span>Systems nominal</span></div>}
        <button className="sidebar-item utility-item" onClick={onToggleTheme} title={isDarkMode ? 'Use light theme' : 'Use dark theme'}>
          <span className="sidebar-glyph" aria-hidden="true">{isDarkMode ? '☼' : '◐'}</span>
          {!collapsed && <span><small>Appearance</small>{isDarkMode ? 'Light interface' : 'Dark interface'}</span>}
        </button>
      </div>
    </aside>
  );
}
