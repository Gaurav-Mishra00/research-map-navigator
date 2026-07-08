import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { optimizeRoute } from './api/client';
import { Navigation, Settings2, Trash2, Car, Footprints, Bike } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

function App() {
  const [stops, setStops] = useState([]);
  const [route, setRoute] = useState(null);
  const [mode, setMode] = useState('driving');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = useCallback((coords) => {
    setStops(prev => [...prev, { id: Date.now(), coordinates: coords }]);
    setRoute(null); // Clear route when adding new stops
  }, []);

  const removeStop = (id) => {
    setStops(prev => prev.filter(stop => stop.id !== id));
    setRoute(null);
  };

  const handleOptimize = async () => {
    if (stops.length < 2) {
      setError("Please add at least 2 stops.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const coords = stops.map(s => s.coordinates);
      const result = await optimizeRoute(coords, mode);
      
      // Decode OSRM polyline geometry to an array of [lat, lng] for leaflet
      const decodedPath = result.geometry.coordinates.map(c => [c[1], c[0]]);
      
      // Reorder stops based on optimization
      const newStopsOrder = result.optimized_indices.map(i => stops[i]);
      setStops(newStopsOrder);
      
      setRoute({
        path: decodedPath,
        distance: (result.distance / 1000).toFixed(2), // km
        duration: Math.round(result.duration / 60) // minutes
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to optimize route.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar UI */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Research-map Navigator</h1>
          <p>AI-powered multi-stop route optimization</p>
        </div>
        
        <div className="sidebar-content">
          <div className="travel-mode-selector">
            <button className={`mode-btn ${mode === 'driving' ? 'active' : ''}`} onClick={() => setMode('driving')}>
              <Car size={16} /> Drive
            </button>
            <button className={`mode-btn ${mode === 'walking' ? 'active' : ''}`} onClick={() => setMode('walking')}>
              <Footprints size={16} /> Walk
            </button>
            <button className={`mode-btn ${mode === 'cycling' ? 'active' : ''}`} onClick={() => setMode('cycling')}>
              <Bike size={16} /> Cycle
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Stops ({stops.length})</label>
            {stops.length === 0 ? (
              <p style={{fontSize: '13px', color: '#6B7280', fontStyle: 'italic'}}>Click on the map to add stops.</p>
            ) : (
              <div className="stops-list">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="stop-item">
                    <div className="stop-number">{index + 1}</div>
                    <div>Location {index + 1} <span style={{fontSize: '11px', color: '#9CA3AF', display: 'block'}}>{stop.coordinates[1].toFixed(4)}, {stop.coordinates[0].toFixed(4)}</span></div>
                    <button className="stop-remove" onClick={() => removeStop(stop.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{color: '#EF4444', fontSize: '13px', marginBottom: '16px', padding: '10px', background: '#FEF2F2', borderRadius: '6px'}}>{error}</div>}

          <button 
            className="primary-btn" 
            onClick={handleOptimize} 
            disabled={stops.length < 2 || isLoading}
            style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
          >
            {isLoading ? <Settings2 size={18} className="animate-spin" /> : <Navigation size={18} />}
            {isLoading ? 'Optimizing Route...' : 'Optimize Route'}
          </button>

          {route && (
            <div className="route-stats">
              <h3 style={{fontSize: '15px', fontWeight: '600', marginBottom: '16px'}}>Optimized Route Details</h3>
              <div className="stat-row">
                <span>Total Distance</span>
                <span className="stat-value">{route.distance} km</span>
              </div>
              <div className="stat-row">
                <span>Estimated Time</span>
                <span className="stat-value">{route.duration} mins</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="map-container">
        <MapContainer center={[28.6139, 77.2090]} zoom={11} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapEvents onLocationSelect={handleLocationSelect} />
          
          {stops.map((stop, index) => (
            <Marker key={stop.id} position={[stop.coordinates[1], stop.coordinates[0]]}>
              <Popup>Stop {index + 1}</Popup>
            </Marker>
          ))}
          
          {route && (
            <Polyline 
              positions={route.path} 
              pathOptions={{ color: '#4F46E5', weight: 5, opacity: 0.8 }} 
            />
          )}
        </MapContainer>
        <div className="map-instructions">
          👆 Click anywhere on the map to add destinations
        </div>
      </div>
    </div>
  );
}

export default App;
