import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for marker icons in leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  center: [number, number];
  popupContent: {
    title: string;
    content: string;
  };
  markers?: Array<{
    position: [number, number];
    title: string;
    content?: string;
    icon?: L.Icon;
  }>;
  zoom?: number;
  onMapClick?: (e: L.LeafletMouseEvent) => void;
  showRouteLine?: boolean;
  routePoints?: [number, number][];
}

const MapView = ({ center, popupContent, markers = [], zoom = 13, onMapClick, showRouteLine = false, routePoints = [] }: MapViewProps) => {
  // State to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  
  // Create a ref to hold the map container
  const [mapRef, setMapRef] = useState<HTMLDivElement | null>(null);
  
  // Use state to track the map instance
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    // Return early if the map container isn't ready
    if (!mapRef) return;
    
    // Initialize map only on client-side
    if (typeof window !== 'undefined' && !leafletMap) {
      // Create new map instance
      const map = L.map(mapRef).setView(center, zoom);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add center marker with popup
      L.marker(center)
        .addTo(map)
        .bindPopup(`<b>${popupContent.title}</b><br>${popupContent.content}`)
        .openPopup();
      
      // Add additional markers if provided
      markers.forEach(marker => {
        L.marker(marker.position, { icon: marker.icon || DefaultIcon })
          .addTo(map)
          .bindPopup(`<b>${marker.title}</b>${marker.content ? `<br>${marker.content}` : ''}`)
      });
      
      // Add route line if requested
      if (showRouteLine && routePoints.length >= 2) {
        const polyline = L.polyline(routePoints, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
        map.fitBounds(polyline.getBounds());
      }
      
      // Add click handler if provided
      if (onMapClick) {
        map.on('click', onMapClick);
      }
      
      // Save map instance to state
      setLeafletMap(map);

      // Clean up function
      return () => {
        if (map) {
          map.remove();
        }
      };
    }
    
    return undefined;
  }, [mapRef, center, zoom, popupContent, markers, onMapClick, showRouteLine, routePoints]);

  // Update map view when center or zoom changes
  useEffect(() => {
    if (leafletMap) {
      leafletMap.setView(center, zoom);
    }
  }, [leafletMap, center, zoom]);

  // Don't render anything on server-side
  if (!isMounted) {
    return (
      <div style={{ height: '100%', width: '100%', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={setMapRef}
      style={{ height: '100%', width: '100%' }}
      id="map-container"
    />
  );
};

export default MapView;
