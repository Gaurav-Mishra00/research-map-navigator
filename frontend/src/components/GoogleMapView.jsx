import { useCallback, useRef, useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  TrafficLayer,
  TransitLayer,
  DirectionsRenderer,
  Polyline,
  Circle,
} from '@react-google-maps/api';
import { EARTH_PLACES } from '../services/earthPlacesData';

// ── Stable libraries array (must not be recreated on each render) ──────────
const LIBRARIES = ['places', 'geometry'];

const CONTAINER_STYLE = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.0, lng: 0.0 };
const DEFAULT_ZOOM = 3;

// ── Google Maps Night/Dark style ────────────────────────────────────────────
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7ec8c8' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9eaab5' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c4d4df' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6b9aaa' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1f12' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4a7c59' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1e2233' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b8a99' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#222b3a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2f4a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#37a8cf' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#44576b' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#5d6b77' }] },
  { featureType: 'transit.station', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060f1a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1f3749' }] },
];

// ── Category → marker color mapping ────────────────────────────────────────
const CATEGORY_COLORS = {
  landmark:  '#00d4ff',
  tech:      '#a78bfa',
  nature:    '#34d399',
  airport:   '#f59e0b',
  default:   '#ff6b6b',
};

function makeSvgIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
      </filter>
    </defs>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26s18-14 18-26C36 8.06 27.94 0 18 0z"
      fill="${color}" filter="url(#shadow)" opacity="0.95"/>
    <circle cx="18" cy="18" r="7" fill="white" opacity="0.9"/>
  </svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: { width: 36, height: 44 },
    anchor: { x: 18, y: 44 },
  };
}

const DROP_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
  <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26s18-14 18-26C36 8.06 27.94 0 18 0z" fill="#f43f5e" opacity="0.95"/>
  <circle cx="18" cy="18" r="7" fill="white" opacity="0.9"/>
</svg>`;

export default function GoogleMapView({
  mapTypeId,
  showTraffic,
  showTransit,
  tilt3D,
  isDarkMode,
  directionsResult,
  selectedPlace,
  customPin,
  userLocation,
  onMapLoad,
  onPlaceClick,
  onMapClick,
  onMapRightClick,
  measurePoints,
  isMeasuring,
}) {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    onMapLoad?.(map);
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Fly to selected place
  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      mapRef.current.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      mapRef.current.setZoom(14);
    }
  }, [selectedPlace]);

  // Fly to custom pin
  useEffect(() => {
    if (customPin && mapRef.current) {
      mapRef.current.panTo(customPin);
    }
  }, [customPin]);

  const handleMapClick = useCallback((e) => {
    setActiveInfoWindow(null);
    const latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    onMapClick?.(latlng);
  }, [onMapClick]);

  const handleMapRightClick = useCallback((e) => {
    const latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    onMapRightClick?.(latlng);
  }, [onMapRightClick]);

  const mapOptions = {
    mapTypeId: mapTypeId || 'roadmap',
    styles: (mapTypeId === 'roadmap' && isDarkMode) ? DARK_MAP_STYLE : undefined,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    tilt: tilt3D ? 45 : 0,
    minZoom: 2,
    maxZoom: 20,
    clickableIcons: false,
    backgroundColor: isDarkMode ? '#0f0f1a' : '#e8ecf0',
  };

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ff6b6b', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <span>Google Maps failed to load. Check your API key.</span>
        <code style={{ fontSize: 12, color: '#aaa' }}>{loadError.message}</code>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
        <div className="gm-loading-ring"></div>
        <span style={{ color: '#7ec8c8', fontSize: 14, letterSpacing: 1 }}>Loading Google Maps…</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      onRightClick={handleMapRightClick}
    >
      {/* ── Live Layers ──────────────────────────────────── */}
      {showTraffic && <TrafficLayer />}
      {showTransit && <TransitLayer />}

      {/* ── Directions Route ─────────────────────────────── */}
      {directionsResult && (
        <DirectionsRenderer
          directions={directionsResult}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#00d4ff',
              strokeOpacity: 0.85,
              strokeWeight: 5,
            },
          }}
        />
      )}

      {/* ── Place Markers ────────────────────────────────── */}
      {EARTH_PLACES.map((place) => {
        const color = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.default;
        return (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            icon={makeSvgIcon(color)}
            title={place.name}
            onClick={() => {
              setActiveInfoWindow(place.id);
              onPlaceClick?.(place);
            }}
          >
            {activeInfoWindow === place.id && (
              <InfoWindow
                position={{ lat: place.lat, lng: place.lng }}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 220, padding: '4px 2px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f0f1a', marginBottom: 4 }}>
                    {place.flag} {place.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#444', marginBottom: 6 }}>
                    📍 {place.city}, {place.country}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4, marginBottom: 8 }}>
                    {place.description.slice(0, 100)}…
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onPlaceClick?.(place)}
                      style={{ padding: '5px 10px', background: '#0f0f1a', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}

      {/* ── User Location (You Are Here) ───────────────── */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="rgba(66,133,244,0.2)" stroke="#4285f4" stroke-width="2"/><circle cx="20" cy="20" r="8" fill="#4285f4"/><circle cx="20" cy="20" r="4" fill="white"/></svg>`),
            scaledSize: { width: 40, height: 40 },
            anchor: { x: 20, y: 20 },
          }}
          title="You are here"
          zIndex={9999}
        >
          <InfoWindow position={userLocation} onCloseClick={() => {}}>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 130 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#4285f4', marginBottom: 4 }}>📍 You Are Here</div>
              <div style={{ fontSize: 11, color: '#555' }}>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</div>
            </div>
          </InfoWindow>
        </Marker>
      )}

      {/* ── Custom Dropped Pin ───────────────────────────── */}
      {customPin && (
        <Marker
          position={customPin}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(DROP_PIN_SVG),
            scaledSize: { width: 36, height: 44 },
            anchor: { x: 18, y: 44 },
          }}
          title={`Dropped Pin: ${customPin.lat.toFixed(5)}, ${customPin.lng.toFixed(5)}`}
        >
          <InfoWindow position={customPin} onCloseClick={() => {}}>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 170 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📍 Dropped Pin</div>
              <div style={{ fontSize: 11, color: '#555' }}>
                {customPin.lat.toFixed(6)}, {customPin.lng.toFixed(6)}
              </div>
            </div>
          </InfoWindow>
        </Marker>
      )}

      {/* ── Distance Measurement Polyline ────────────────── */}
      {isMeasuring && measurePoints.length >= 2 && (
        <Polyline
          path={measurePoints}
          options={{
            strokeColor: '#f59e0b',
            strokeOpacity: 0.9,
            strokeWeight: 3,
            geodesic: true,
          }}
        />
      )}
      {isMeasuring && measurePoints.map((pt, i) => (
        <Circle
          key={i}
          center={pt}
          radius={8000}
          options={{
            strokeColor: '#f59e0b',
            strokeWeight: 2,
            fillColor: '#f59e0b',
            fillOpacity: 0.5,
          }}
        />
      ))}
    </GoogleMap>
  );
}
