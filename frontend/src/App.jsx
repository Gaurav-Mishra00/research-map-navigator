import React, { Suspense, lazy, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import MapHeader from './components/MapHeader';
import GoogleMapView from './components/GoogleMapView';
import MapControls from './components/MapControls';
import PlaceInspectorDrawer from './components/PlaceInspectorDrawer';
import RouteNavigatorDrawer from './components/RouteNavigatorDrawer';
import BookmarksDrawer from './components/BookmarksDrawer';
import DirectoryGridView from './components/DirectoryGridView';
const LiveEarthView = lazy(() => import('./components/LiveEarthView'));
import CommandSidebar from './components/CommandSidebar';

import { EARTH_PLACES } from './services/earthPlacesData';
import './styles/App.css';
import { optimizeRoute } from './api/client';

export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mapTheme') !== 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('mapTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen(true);
      }
      if (event.key === 'Escape') setIsCommandOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Search & View ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('map');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // ── Map State ──────────────────────────────────────────────────────────────
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [tilt3D, setTilt3D] = useState(false);

  // ── Live Earth ────────────────────────────────────────────────────────────
  const [showLiveEarth, setShowLiveEarth] = useState(false);

  // ── Places & Pins ─────────────────────────────────────────────────────────
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [customPin, setCustomPin] = useState(null);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('researchmap-bookmarks') || 'null');
      return Array.isArray(saved) && saved.length ? saved : [EARTH_PLACES[0], EARTH_PLACES[1]];
    } catch {
      return [EARTH_PLACES[0], EARTH_PLACES[1]];
    }
  });

  useEffect(() => {
    localStorage.setItem('researchmap-bookmarks', JSON.stringify(bookmarkedPlaces));
  }, [bookmarkedPlaces]);

  // ── User Location ─────────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // ── Drawers ────────────────────────────────────────────────────────────────
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // ── Routing ────────────────────────────────────────────────────────────────
  const [directionsResult, setDirectionsResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);

  // ── Measurement ───────────────────────────────────────────────────────────
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);

  // ── Google Map ref ─────────────────────────────────────────────────────────
  const mapRef = useRef(null);

  // Filter places
  const filteredPlaces = useMemo(() => {
    return EARTH_PLACES.filter(place => {
      if (selectedCategory !== 'all' && place.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          place.name.toLowerCase().includes(q) ||
          place.city.toLowerCase().includes(q) ||
          place.country.toLowerCase().includes(q) ||
          place.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const handleSelectPlace = useCallback((place) => {
    setSelectedPlace(place);
    setViewMode('map');
    if (mapRef.current) {
      mapRef.current.panTo({ lat: place.lat, lng: place.lng });
      mapRef.current.setZoom(14);
    }
  }, []);

  const handleToggleBookmark = useCallback((place) => {
    setBookmarkedPlaces(prev =>
      prev.some(p => p.id === place.id) ? prev.filter(p => p.id !== place.id) : [...prev, place]
    );
  }, []);

  const handleMapClick = useCallback((latlng) => {
    if (isMeasuring) setMeasurePoints(prev => [...prev, latlng]);
  }, [isMeasuring]);

  const handleMapRightClick = useCallback((latlng) => { setCustomPin(latlng); }, []);

  const handleZoomIn  = useCallback(() => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1); }, []);
  const handleZoomOut = useCallback(() => { if (mapRef.current) mapRef.current.setZoom(Math.max(mapRef.current.getZoom() - 1, 2)); }, []);
  const handleResetWorldView = useCallback(() => { if (mapRef.current) { mapRef.current.panTo({ lat: 20, lng: 0 }); mapRef.current.setZoom(3); } }, []);
  const handleResetNorth = useCallback(() => { if (mapRef.current) mapRef.current.setHeading(0); }, []);

  // ── Live Location (GPS) ─────────────────────────────────────────────────
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(latlng);
        setIsLocating(false);
        if (mapRef.current) {
          mapRef.current.panTo(latlng);
          mapRef.current.setZoom(15);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(err.message || 'Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ── Google Directions ──────────────────────────────────────────────────
  const handleCalculateDirections = useCallback((origin, destination, travelMode) => {
    if (!window.google) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode[travelMode.toUpperCase()],
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResult(result);
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].legs[0].steps.forEach(s => { bounds.extend(s.start_location); bounds.extend(s.end_location); });
            mapRef.current.fitBounds(bounds, { padding: 80 });
          }
        } else {
          setLocationError(`Route unavailable: ${status}`);
        }
      }
    );
  }, []);

  const handleOptimizeRoute = useCallback(async (origin, destination, travelMode) => {
    try {
      const result = await optimizeRoute(
        [{ lng: origin.lng, lat: origin.lat }, { lng: destination.lng, lat: destination.lat }],
        travelMode.toLowerCase() === 'bicycling' ? 'cycling' : travelMode.toLowerCase()
      );
      setOptimizationResult(result);
      return result;
    } catch {
      setLocationError('Route optimization service is unavailable; Google Directions remains available.');
      return null;
    }
  }, []);

  // ── Google Places Search ───────────────────────────────────────────────
  const handleGoogleSearch = useCallback((query) => {
    if (!query.trim()) return;
    if (!mapRef.current || !window.google) {
      setLocationError('Map services are still loading. Try again in a moment.');
      return;
    }
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.textSearch({ query }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const loc = results[0].geometry.location;
        mapRef.current.panTo(loc);
        mapRef.current.setZoom(14);
        setLocationError(null);
      } else {
        setLocationError(`No location found for “${query}”.`);
      }
    });
  }, []);

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <CommandSidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenLiveEarth={() => setShowLiveEarth(true)}
        isMeasuring={isMeasuring}
        setIsMeasuring={setIsMeasuring}
        bookmarkCount={bookmarkedPlaces.length}
        isLocating={isLocating}
        onMyLocation={handleMyLocation}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(d => !d)}
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(value => !value)}
      />
      <MapHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarkedPlaces.length}
        onGoogleSearch={handleGoogleSearch}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(d => !d)}
        onOpenLiveEarth={() => setShowLiveEarth(true)}
        onOpenCommand={() => setIsCommandOpen(true)}
      />

      <main className="main-viewport">
        <div className="workspace-telemetry" aria-label="Workspace status">
          <span className="telemetry-kicker">LIVE WORKSPACE</span>
          <span className="telemetry-divider" />
          <span>{viewMode === 'map' ? 'Map canvas' : 'Place directory'}</span>
          <span className="telemetry-divider" />
          <span className="telemetry-coordinate">{userLocation ? `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : '20.000, 0.000'}</span>
          <span className="telemetry-live"><span className="status-dot" /> ONLINE</span>
        </div>
        {(directionsResult || isMeasuring) && (
          <section className="analysis-dock" aria-label="Active analysis">
            {directionsResult && <>
              <div><small>ACTIVE ROUTE</small><strong>{directionsResult.routes?.[0]?.legs?.[0]?.start_address?.split(',')[0] || 'Origin'} → {directionsResult.routes?.[0]?.legs?.[0]?.end_address?.split(',')[0] || 'Destination'}</strong></div>
              <div><small>DISTANCE</small><strong>{directionsResult.routes?.[0]?.legs?.[0]?.distance?.text || '—'}</strong></div>
              <div><small>EST. TIME</small><strong>{directionsResult.routes?.[0]?.legs?.[0]?.duration?.text || '—'}</strong></div>
              <div><small>STEPS</small><strong>{directionsResult.routes?.[0]?.legs?.[0]?.steps?.length || 0}</strong></div>
            </>}
            {isMeasuring && <div className="measure-status"><small>MEASUREMENT MODE</small><strong>{measurePoints.length} point{measurePoints.length === 1 ? '' : 's'} selected · click map to continue</strong></div>}
          </section>
        )}
        {viewMode === 'map' && (
          <div className="earth-map-container">
            <GoogleMapView
              mapTypeId={mapTypeId}
              showTraffic={showTraffic}
              showTransit={showTransit}
              tilt3D={tilt3D}
              isDarkMode={isDarkMode}
              directionsResult={directionsResult}
              selectedPlace={selectedPlace}
              customPin={customPin}
              userLocation={userLocation}
              onMapLoad={handleMapLoad}
              onPlaceClick={handleSelectPlace}
              onMapClick={handleMapClick}
              onMapRightClick={handleMapRightClick}
              measurePoints={measurePoints}
              isMeasuring={isMeasuring}
            />

            <MapControls
              mapTypeId={mapTypeId}
              setMapTypeId={setMapTypeId}
              showTraffic={showTraffic}
              setShowTraffic={setShowTraffic}
              showTransit={showTransit}
              setShowTransit={setShowTransit}
              tilt3D={tilt3D}
              setTilt3D={setTilt3D}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetNorth={handleResetNorth}
              onResetWorldView={handleResetWorldView}
              isMeasuring={isMeasuring}
              setIsMeasuring={setIsMeasuring}
              onClearMeasurement={() => setMeasurePoints([])}
              onMyLocation={handleMyLocation}
              isLocating={isLocating}
              locationError={locationError}
            />
          </div>
        )}

        {viewMode === 'grid' && (
          <DirectoryGridView places={filteredPlaces} onSelectPlace={handleSelectPlace} />
        )}

        {selectedPlace && (
          <PlaceInspectorDrawer
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onOpenDirectionsTo={(place) => { setSelectedPlace(place); setIsRoutePlannerOpen(true); }}
            isBookmarked={bookmarkedPlaces.some(p => p.id === selectedPlace.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        <RouteNavigatorDrawer
          isOpen={isRoutePlannerOpen}
          onClose={() => setIsRoutePlannerOpen(false)}
          places={EARTH_PLACES}
          directionsResult={directionsResult}
          onCalculateDirections={handleCalculateDirections}
          onOptimizeRoute={handleOptimizeRoute}
          optimizationResult={optimizationResult}
          onClearRoute={() => { setDirectionsResult(null); setOptimizationResult(null); }}
          destinationPlace={selectedPlace}
        />

        <BookmarksDrawer
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          bookmarkedPlaces={bookmarkedPlaces}
          onSelectPlace={handleSelectPlace}
          onRemoveBookmark={(id) => setBookmarkedPlaces(prev => prev.filter(p => p.id !== id))}
        />

        {/* Location error toast */}
        {locationError && (
          <div className="location-toast" role="alert" tabIndex="0" onClick={() => setLocationError(null)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setLocationError(null); }}>
            📍 {locationError}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav" aria-label="Mobile workspace navigation">
        <button aria-label="Open map view" className={`mob-nav-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
          <span>🗺️</span><span>Map</span>
        </button>
        <button aria-label="Open directions" className="mob-nav-btn" onClick={() => setIsRoutePlannerOpen(true)}>
          <span>🧭</span><span>Directions</span>
        </button>
        <button aria-label="Open live Earth globe" className="mob-nav-btn earth-globe-btn" onClick={() => setShowLiveEarth(true)}>
          <span>🌍</span><span>Live Earth</span>
        </button>
        <button aria-label="Open place explorer" className={`mob-nav-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
          <span>📋</span><span>Explore</span>
        </button>
        <button aria-label="Open saved places" className="mob-nav-btn" onClick={() => setIsBookmarksOpen(true)}>
          <span>🔖</span><span>Saved</span>
        </button>
      </nav>

      {isCommandOpen && (
        <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Search ResearchMap" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCommandOpen(false); }}>
          <div className="command-dialog">
            <div className="command-search-row"><span className="command-search-icon">⌕</span><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { handleGoogleSearch(searchQuery); setIsCommandOpen(false); } }} placeholder="Search places, coordinates, landmarks…" aria-label="Search places, coordinates, landmarks" /><kbd>ESC</kbd></div>
            <div className="command-results">
              <p className="command-label">Quick actions</p>
              <button onClick={() => { setIsCommandOpen(false); setIsRoutePlannerOpen(true); }}>↗ <span>Plan a route</span><small>Navigate between places</small></button>
              <button onClick={() => { setIsCommandOpen(false); setViewMode('grid'); }}>◈ <span>Explore places</span><small>Browse the landmark directory</small></button>
              <button onClick={() => { setIsCommandOpen(false); setShowLiveEarth(true); }}>◎ <span>Open global view</span><small>Switch to the immersive globe</small></button>
              {searchQuery && filteredPlaces.slice(0, 4).map(place => <button key={place.id} onClick={() => { handleSelectPlace(place); setIsCommandOpen(false); }}><span className="result-index">{place.category?.slice(0, 1).toUpperCase()}</span><span>{place.name}</span><small>{place.city}, {place.country}</small></button>)}
            </div>
          </div>
        </div>
      )}

      {/* Live Earth Globe Overlay */}
      {showLiveEarth && <Suspense fallback={<div className="globe-loading" role="status">Initializing global view…</div>}><LiveEarthView onClose={() => setShowLiveEarth(false)} isDarkMode={isDarkMode} /></Suspense>}
    </div>
  );
}
