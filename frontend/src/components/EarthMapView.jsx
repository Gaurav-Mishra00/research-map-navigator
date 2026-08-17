import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_STYLES, OVERLAY_LAYERS } from '../services/mapStyles';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const createCustomPinIcon = (category, isSelected) => {
  const iconEmoji = category === 'wonders' ? '🏛️' : category === 'tech' ? '💻' : category === 'nature' ? '🏔️' : category === 'airports' ? '✈️' : '🏙️';
  return L.divIcon({
    className: `custom-map-pin ${isSelected ? 'selected' : ''}`,
    html: `<div class="pin-ring">${iconEmoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const droppedPinIcon = L.divIcon({
  className: 'custom-map-pin dropped-pin',
  html: `<div class="pin-ring dropped">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

// Map Fly-To controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener for custom pin drop / measurement
function MapEventsListener({ onMapClick, onRightClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
    contextmenu(e) {
      if (onRightClick) {
        onRightClick(e.latlng);
      }
    }
  });
  return null;
}

export default function EarthMapView({
  places,
  selectedPlace,
  onSelectPlace,
  mapStyleId,
  showWeatherOverlay,
  showTrafficOverlay,
  mapCenter,
  mapZoom,
  activeRoute,
  measurePoints,
  isMeasuring,
  onMapClick,
  customDroppedPin,
  onDropPin
}) {
  const activeStyle = MAP_STYLES.find(s => s.id === mapStyleId) || MAP_STYLES[0];

  const routePolylineCoords = activeRoute ? activeRoute.waypoints.map(w => [w.lat, w.lng]) : [];
  const measurePolylineCoords = measurePoints.map(p => [p.lat, p.lng]);

  return (
    <div className="earth-map-container">
      <MapContainer
        center={mapCenter || [20, 0]}
        zoom={mapZoom || 3}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapEventsListener
          onMapClick={onMapClick}
          onRightClick={(latlng) => onDropPin(latlng)}
        />

        {/* Base Tile Layer */}
        <TileLayer
          key={activeStyle.id}
          url={activeStyle.url}
          attribution={activeStyle.attribution}
          subdomains={activeStyle.subdomains || 'abc'}
          maxZoom={activeStyle.maxZoom || 18}
        />

        {/* Hybrid Overlay Labels if applicable */}
        {activeStyle.overlayUrl && (
          <TileLayer
            url={activeStyle.overlayUrl}
            subdomains={activeStyle.subdomains || 'abc'}
            maxZoom={activeStyle.maxZoom || 18}
          />
        )}

        {/* Real-time Weather Radar Layer */}
        {showWeatherOverlay && (
          <TileLayer
            url={OVERLAY_LAYERS.weather.url}
            opacity={OVERLAY_LAYERS.weather.opacity}
            attribution={OVERLAY_LAYERS.weather.attribution}
          />
        )}

        {/* Real-time Traffic Flow Layer */}
        {showTrafficOverlay && (
          <TileLayer
            url={OVERLAY_LAYERS.traffic.url}
            opacity={OVERLAY_LAYERS.traffic.opacity}
            attribution={OVERLAY_LAYERS.traffic.attribution}
          />
        )}

        {/* Render Place Markers */}
        {places.map(place => {
          const isSelected = selectedPlace?.id === place.id;
          const pinIcon = createCustomPinIcon(place.category, isSelected);

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onSelectPlace(place)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-card">
                  <div className="popup-badge">{place.flag} {place.categoryName}</div>
                  <div className="popup-title">{place.name}</div>
                  <div className="popup-sub">{place.city}, {place.country}</div>
                  <div className="popup-temp">🌡️ {place.weather.temp} • {place.weather.condition}</div>
                  <button
                    className="btn btn-primary btn-sm full-width"
                    style={{ marginTop: '8px' }}
                    onClick={() => onSelectPlace(place)}
                  >
                    Inspect Location Details ➔
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Dropped Custom Pin */}
        {customDroppedPin && (
          <Marker
            position={[customDroppedPin.lat, customDroppedPin.lng]}
            icon={droppedPinIcon}
          >
            <Popup className="custom-leaflet-popup">
              <div className="popup-card">
                <div className="popup-badge">📍 Dropped Pin Location</div>
                <div className="popup-title">Custom Coordinates</div>
                <div className="popup-sub">{customDroppedPin.lat.toFixed(4)}° N, {customDroppedPin.lng.toFixed(4)}° E</div>
                <button
                  className="btn btn-primary btn-sm full-width"
                  style={{ marginTop: '8px' }}
                  onClick={() => onSelectPlace({
                    id: `custom-${Date.now()}`,
                    name: `Dropped Pin (${customDroppedPin.lat.toFixed(2)}°, ${customDroppedPin.lng.toFixed(2)}°)`,
                    category: 'cities',
                    categoryName: 'Custom Location',
                    city: 'Custom GPS Coordinate',
                    country: 'Earth',
                    countryCode: 'GPS',
                    flag: '📍',
                    lat: customDroppedPin.lat,
                    lng: customDroppedPin.lng,
                    elevation: 'Surface Level',
                    timezone: 'Local Meridian',
                    rating: 5.0,
                    reviewsCount: 1,
                    weather: { temp: '21°C', condition: 'Variable', wind: '10 km/h', humidity: '50%' },
                    description: `User dropped pin at coordinates ${customDroppedPin.lat.toFixed(6)}°, ${customDroppedPin.lng.toFixed(6)}°.`,
                    photos: ['https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80'],
                    heroImage: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
                    nearbyPois: []
                  })}
                >
                  Inspect Custom Location ➔
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Navigation Route Polyline */}
        {routePolylineCoords.length > 0 && (
          <Polyline
            positions={routePolylineCoords}
            color="#38bdf8"
            weight={4}
            opacity={0.85}
            dashArray="8, 6"
          />
        )}

        {/* Distance Measurement Line */}
        {measurePolylineCoords.length > 0 && (
          <Polyline
            positions={measurePolylineCoords}
            color="#ef4444"
            weight={3}
            opacity={0.9}
          />
        )}

        {/* Distance Measure Points */}
        {measurePoints.map((pt, i) => (
          <Marker
            key={i}
            position={[pt.lat, pt.lng]}
            icon={L.divIcon({
              className: 'measure-pin',
              html: `<div style="background:#ef4444; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #ef4444;"></div>`
            })}
          />
        ))}
      </MapContainer>
    </div>
  );
}
