import { useState, useRef } from "react";
import { searchPlaces } from "../utils/foursquare";
import MapView from "./MapView";
import { MapPin, Search, X } from "lucide-react";

export default function AddressSearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.label || "");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  function handleInputChange(e) {
    const q = e.target.value;
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const places = await searchPlaces(q);
      setResults(places);
      setShowDropdown(true);
      setSearching(false);
    }, 400);
  }

  function selectPlace(place) {
    setQuery(place.label);
    setShowDropdown(false);
    onChange({
      label: place.label,
      lat: place.lat,
      lng: place.lng,
    });
  }

  function clearAddress() {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    onChange(null);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Search address via Foursquare..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearAddress}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {showDropdown && results.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
            {results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => selectPlace(place)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <MapPin size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{place.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{place.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && !searching && query.length >= 3 && (
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No places found
          </div>
        )}
      </div>

      {value?.lat && value?.lng && (
        <MapView lat={value.lat} lng={value.lng} className="h-48" />
      )}
    </div>
  );
}
