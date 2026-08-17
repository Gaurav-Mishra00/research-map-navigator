import { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { optimizeRoute } from './api/client';
import { Navigation, Settings2, Trash2, Car, Footprints, Bike, RotateCcw, Moon, Sun, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons
const createCustomMarker = (color, text) => {
  const svg = `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.95 0 0 8.95 0 20c0 12 20 30 20 30s20-18 20-30c0-11.05-8.95-20-20-20z" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="20" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial">${text}</text>
  </svg>`;
  
  // Use encodeURIComponent for proper Unicode handling
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  
  return L.icon({
    iconUrl: `data:image/svg+xml,${encoded}`,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

const START_MARKER = createCustomMarker('#10B981', 'S');
const END_MARKER = createCustomMarker('#EF4444', 'E');
const INTERMEDIATE_MARKER = createCustomMarker('#3B82F6', '●');

// Draggable stop item component
function SortableStopItem({ id, stop, index, totalStops, distance, onRemove, distances }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="stop-item">
      <button 
        className="drag-handle" 
        {...listeners} 
        {...attributes}
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className={`stop-number ${index === 0 ? 'start' : index === totalStops - 1 ? 'end' : 'intermediate'}`}>
        {index === 0 ? 'S' : index === totalStops - 1 ? 'E' : index}
      </div>
      <div className="stop-info">
        <div>Location {index + 1}</div>
        <div className="stop-coords">{stop.coordinates[1].toFixed(4)}, {stop.coordinates[0].toFixed(4)}</div>
        {index < totalStops - 1 && distances[index] && (
          <div className="stop-distance">↓ {distances[index]?.toFixed(2)} km to next</div>
        )}
      </div>
      <button className="stop-remove" onClick={() => onRemove(stop.id)} title="Remove stop">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// Map click handler component
function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

// Calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const toRad = Math.PI / 180;
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * toRad;
  const dLng = (coord2[0] - coord1[0]) * toRad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coord1[1] * toRad) * Math.cos(coord2[1] * toRad) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function App() {
  const [stops, setStops] = useState([]);
  const [route, setRoute] = useState(null);
  const [mode, setMode] = useState('driving');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLocationSelect = useCallback((coords) => {
    setStops(prev => [...prev, { id: Date.now(), coordinates: coords }]);
    setRoute(null);
  }, []);

  const removeStop = useCallback((id) => {
    setStops(prev => prev.filter(stop => stop.id !== id));
    setRoute(null);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStops((items) => {
        const oldIndex = items.findIndex(item => item.id.toString() === active.id);
        const newIndex = items.findIndex(item => item.id.toString() === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setRoute(null); // Clear route when reordering
    }
  }, []);

  const handleOptimize = useCallback(async () => {
    if (stops.length < 2) {
      setError("Please add at least 2 stops.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const coords = stops.map(s => s.coordinates);
      const result = await optimizeRoute(coords, mode);
      
      const decodedPath = result.geometry.coordinates.map(c => [c[1], c[0]]);
      const newStopsOrder = result.optimized_indices.map(i => stops[i]);
      setStops(newStopsOrder);
      
      setRoute({
        path: decodedPath,
        distance: (result.distance / 1000).toFixed(2),
        duration: Math.round(result.duration / 60)
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to optimize route.");
    } finally {
      setIsLoading(false);
    }
  }, [stops, mode]);

  const clearAllStops = useCallback(() => {
    setStops([]);
    setRoute(null);
    setError(null);
  }, []);

  // Calculate distances between consecutive stops
  const distances = useMemo(() => {
    const dists = [];
    for (let i = 0; i < stops.length - 1; i++) {
      dists.push(calculateDistance(stops[i].coordinates, stops[i + 1].coordinates));
    }
    return dists;
  }, [stops]);

  // Get marker icon based on position
  const getMarkerIcon = (index, total) => {
    if (total === 1) return START_MARKER;
    if (index === 0) return START_MARKER;
    if (index === total - 1) return END_MARKER;
    return INTERMEDIATE_MARKER;
  };

  // Get polyline color based on travel mode
  const getPolylineColor = () => {
    switch (mode) {
      case 'driving': return '#4F46E5';
      case 'walking': return '#10B981';
      case 'cycling': return '#F59E0B';
      default: return '#4F46E5';
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar UI */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1>Research-map Navigator</h1>
              <p>AI-powered multi-stop route optimization</p>
            </div>
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <label className="input-label">Stops ({stops.length})</label>
              {stops.length > 0 && (
                <button 
                  className="clear-btn" 
                  onClick={clearAllStops}
                  title="Clear all stops"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
            {stops.length === 0 ? (
              <p style={{fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic'}}>Click on the map to add stops.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stops.map(s => s.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="stops-list">
                    {stops.map((stop, index) => (
                      <SortableStopItem
                        key={stop.id}
                        id={stop.id}
                        stop={stop}
                        index={index}
                        totalStops={stops.length}
                        distance={distances[index]}
                        onRemove={removeStop}
                        distances={distances}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {error && (
            <div className="error-container">
              <div className="error-message">⚠️ {error}</div>
              <button 
                className="retry-btn" 
                onClick={handleOptimize}
                disabled={stops.length < 2 || isLoading}
              >
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          )}

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
            <Marker 
              key={stop.id} 
              position={[stop.coordinates[1], stop.coordinates[0]]}
              icon={getMarkerIcon(index, stops.length)}
            >
              <Popup>
                <div style={{fontSize: '12px'}}>
                  <strong>Stop {index + 1}</strong><br/>
                  Lat: {stop.coordinates[1].toFixed(4)}<br/>
                  Lng: {stop.coordinates[0].toFixed(4)}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {route && (
            <Polyline 
              positions={route.path} 
              pathOptions={{ 
                color: getPolylineColor(), 
                weight: 6, 
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '0',
                className: 'route-polyline'
              }} 
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
