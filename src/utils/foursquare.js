// TODO: Replace with your real Foursquare API key
const FSQ_API_KEY = "fsq3E48C8O1gnps3su8D76+JjtfWb0IoSWBuO57RpvBNITY=";

export async function searchPlaces(query) {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          Accept: "application/json",
          Authorization: FSQ_API_KEY,
        },
      },
    );

    if (!response.ok) throw new Error("Foursquare API error");

    const data = await response.json();
    return (data.results || []).map((place) => ({
      id: place.fsq_id,
      name: place.name,
      address:
        place.location?.formatted_address || place.location?.address || "",
      lat: place.geocodes?.main?.latitude || 0,
      lng: place.geocodes?.main?.longitude || 0,
      label: `${place.name}${place.location?.formatted_address ? ", " + place.location.formatted_address : ""}`,
    }));
  } catch (error) {
    console.error("Foursquare search error:", error);
    return [];
  }
}
