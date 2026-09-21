'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onPick={(p) => { setPos(p); onChange(p); }} />
        <FlyTo initial={initial} />
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

/** Pans the map to a new pin position (e.g. an autocomplete choice). */
function FlyTo({ initial }: { initial: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([initial.lat, initial.lng], 13);
  }, [initial.lat, initial.lng, map]);
  return null;
}
