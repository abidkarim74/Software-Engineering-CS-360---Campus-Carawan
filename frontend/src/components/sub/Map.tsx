import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: L.LatLngExpression;
  zoom?: number;
  darkMode?: boolean;
  className?: string;
  markers?: {
    position: L.LatLngExpression;
    popup: string;
  }[];
  route?: L.LatLngExpression[];
}

const Map = ({ 
  center = [0, 0], 
  zoom = 13, 
  darkMode = false, 
  className = "",
  markers = [],
  route = []
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapContainerRef.current.style.overflow = 'hidden';
      
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        preferCanvas: true,
      }).setView(center, zoom);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      tileLayerRef.current = L.tileLayer(
        darkMode 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          noWrap: true
        }
      ).addTo(mapRef.current);

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
        routeRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerInfo => {
      const marker = L.marker(markerInfo.position)
        .addTo(mapRef.current!)
        .bindPopup(markerInfo.popup);
      markersRef.current.push(marker);
    });
  }, [markers]);

  // Update route
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (route.length > 1) {
      routeRef.current = L.polyline(route, {
        color: darkMode ? '#ff7f00' : '#3388ff',
        weight: 5,
        opacity: 0.7,
        lineJoin: 'round'
      }).addTo(mapRef.current);
    }
  }, [route, darkMode]);

  // Update view when center changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
      mapRef.current.invalidateSize();
    }
  }, [center, zoom]);

  // Update tile layer when dark mode changes
  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      
      tileLayerRef.current = L.tileLayer(
        darkMode 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          noWrap: true
        }
      ).addTo(mapRef.current);
      
      // Update route color
      if (routeRef.current) {
        routeRef.current.setStyle({
          color: darkMode ? '#ff7f00' : '#3388ff'
        });
      }
      
      mapRef.current.invalidateSize();
    }
  }, [darkMode]);

  return (
    <div 
      ref={mapContainerRef}
      className={`h-full w-full ${className}`}
    />
  );
};

export default Map;