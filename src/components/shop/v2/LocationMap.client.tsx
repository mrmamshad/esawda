'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Point Leaflet at absolute CDN URLs so bundlers don't need to
// resolve the default marker PNGs (Next.js + Leaflet gotcha).
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export default function LocationMapClient({
  initial, onChange, height,
}: { initial: { lat: number; lng: number }; onChange: (v: { lat: number; lng: number }) => void; height: number }) {
  const [pos, setPos] = useState(initial);

  useEffect(() => { setPos(initial); }, [initial.lat, initial.lng]);

  return (
    <div
      className="relative z-0 overflow-hidden rounded-lg border"
      style={{ borderColor: 'var(--shp-border)', height }}
    >
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={(p) => { setPos(p); onChange(p); }} />
        <Marker
          position={[pos.lat, pos.lng]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const ll = m.getLatLng();
              const next = { lat: ll.lat, lng: ll.lng };
              setPos(next); onChange(next);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}

function ClickHandler({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}
