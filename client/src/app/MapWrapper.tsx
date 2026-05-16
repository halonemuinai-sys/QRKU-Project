"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapWrapper({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);

  function LocationPicker() { 
    useMapEvents({ 
      click(e: any) { 
        setPosition([e.latlng.lat, e.latlng.lng]); 
        onLocationSelect(e.latlng.lat, e.latlng.lng); 
      } 
    }); 
    return <Marker position={position} />; 
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker />
    </MapContainer>
  );
}
