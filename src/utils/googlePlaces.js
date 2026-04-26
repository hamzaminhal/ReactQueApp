const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise = null;

/**
 * Load the Google Maps JavaScript API with Places library.
 * Only loads once, subsequent calls return the same promise.
 */
function loadGoogleMaps() {
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY in .env"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Search for places using the new Google Places AutocompleteSuggestion API.
 * Returns an array of place objects matching the component's expected shape.
 * @param {string} query - Search query string.
 * @returns {Promise<Array<{id: string, name: string, address: string, lat: number, lng: number, label: string}>>}
 */
export async function searchPlaces(query) {
  if (!query || query.length < 3) return [];

  try {
    await loadGoogleMaps();

    const { AutocompleteSessionToken, AutocompleteSuggestion } =
      await google.maps.importLibrary("places");

    const sessionToken = new AutocompleteSessionToken();

    // Fetch suggestions using the new API
    const { suggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken,
      });

    // Get place details (coordinates) for each suggestion (limit to 5)
    const places = await Promise.all(
      suggestions.slice(0, 5).map(async (suggestion) => {
        const placePrediction = suggestion.placePrediction;
        let lat = 0;
        let lng = 0;
        let name = placePrediction.mainText?.toString() || "";
        let address = placePrediction.secondaryText?.toString() || "";
        let label = placePrediction.text?.toString() || "";

        try {
          // Fetch place details to get coordinates
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ["location", "displayName", "formattedAddress"],
          });

          if (place.location) {
            lat = place.location.lat();
            lng = place.location.lng();
          }
          if (place.displayName) name = place.displayName;
          if (place.formattedAddress) address = place.formattedAddress;
          if (!label) label = `${name}, ${address}`;
        } catch (e) {
          console.warn("Failed to fetch place details:", e);
        }

        return {
          id: placePrediction.placeId,
          name,
          address,
          lat,
          lng,
          label: label || `${name}, ${address}`,
        };
      }),
    );

    return places;
  } catch (error) {
    console.error("Google Places search error:", error);
    return [];
  }
}
