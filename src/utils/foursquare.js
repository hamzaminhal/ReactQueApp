export async function searchPlaces(query) {
  const url = `/api/foursquare/places/search?query=${encodeURIComponent(query)}`;
  const options = {
    method: "GET",
    headers: {
      "X-Places-Api-Version": "2025-06-17",
      accept: "application/json",
      authorization: `Bearer ${import.meta.env.VITE_FOURSQUARE_KEY}`,
    },
  };

  try {
    const res = await fetch(url, options);
    console.log(url);
    if (!res.ok) throw new Error("Foursquare API error");
    const data = await res.json();
    return (data.results || []).map((place) => ({
      id: place.fsq_id,
      name: place.name,
      address:
        place.location?.formatted_address || place.location?.address || "",
      lat: place.geocodes?.main?.latitude || 0,
      lng: place.geocodes?.main?.longitude || 0,
      label: `${place.name}${place.location?.formatted_address ? ", " + place.location.formatted_address : ""}`,
    }));
  } catch (err) {
    console.error("Foursquare search error:", err);
    return [];
  }
}
