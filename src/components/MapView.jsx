import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation } from "lucide-react";

// Fix default marker icon issue in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ lat, lng, zoom = 15, className = "", label = "" }) {
  const center = [lat || 33.6844, lng || 73.0479]; // Default to Islamabad
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        className={className}
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          height: className.includes("h-") ? undefined : "250px",
          minHeight: "200px",
          position: "relative",
          zIndex: 0,
        }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
          scrollWheelZoom={false}
        >
          <ChangeView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lat && lng && (
            <Marker position={[lat, lng]}>
              <Popup>
                <div style={{ textAlign: "center" }}>
                  {label && <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{label}</p>}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#6366f1", fontSize: "12px", fontWeight: 500, textDecoration: "none" }}
                  >
                    Get Directions →
                  </a>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {lat && lng && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
        >
          <Navigation size={14} />
          Open in Google Maps
        </a>
      )}
    </div>
  );
}
