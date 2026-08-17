import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import MapHeader from './components/MapHeader';
import GoogleMapView from './components/GoogleMapView';
import MapControls from './components/MapControls';
import PlaceInspectorDrawer from './components/PlaceInspectorDrawer';
import RouteNavigatorDrawer from './components/RouteNavigatorDrawer';
import BookmarksDrawer from './components/BookmarksDrawer';
import DirectoryGridView from './components/DirectoryGridView';
import LiveEarthView from './components/LiveEarthView';

import { EARTH_PLACES } from './services/earthPlacesData';
import './styles/App.css';

export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mapTheme') !== 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('mapTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ── Search & View ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('map');

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
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState([EARTH_PLACES[0], EARTH_PLACES[1]]);

  // ── User Location ─────────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // ── Drawers ────────────────────────────────────────────────────────────────
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // ── Routing ────────────────────────────────────────────────────────────────
  const [directionsResult, setDirectionsResult] = useState(null);

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
          alert(`Could not calculate route: ${status}`);
        }
      }
    );
  }, []);

  // ── Google Places Search ───────────────────────────────────────────────
  const handleGoogleSearch = useCallback((query) => {
    if (!query.trim() || !mapRef.current || !window.google) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.textSearch({ query }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const loc = results[0].geometry.location;
        mapRef.current.panTo(loc);
        mapRef.current.setZoom(14);
      }
    });
  }, []);

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
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
      />

      <main className="main-viewport">
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
          onClearRoute={() => setDirectionsResult(null)}
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
          <div className="location-toast" onClick={() => setLocationError(null)}>
            📍 {locationError}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <button className={`mob-nav-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
          <span>🗺️</span><span>Map</span>
        </button>
        <button className="mob-nav-btn" onClick={() => setIsRoutePlannerOpen(true)}>
          <span>🧭</span><span>Directions</span>
        </button>
        <button className="mob-nav-btn earth-globe-btn" onClick={() => setShowLiveEarth(true)}>
          <span>🌍</span><span>Live Earth</span>
        </button>
        <button className={`mob-nav-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
          <span>📋</span><span>Explore</span>
        </button>
        <button className="mob-nav-btn" onClick={() => setIsBookmarksOpen(true)}>
          <span>🔖</span><span>Saved</span>
        </button>
      </nav>

      {/* Live Earth Globe Overlay */}
      {showLiveEarth && <LiveEarthView onClose={() => setShowLiveEarth(false)} isDarkMode={isDarkMode} />}
    </div>
  );
}
