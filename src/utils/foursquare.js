// TODO: Replace with your real Foursquare API key
// const FSQ_API_KEY = "fsq3E48C8O1gnps3su8D76+JjtfWb0IoSWBuO57RpvBNITY=";

// export async function searchPlaces(query) {
//   if (!query || query.length < 3) return [];

//   try {
//     const response = await fetch(
//       `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=5`,
//       {
//         headers: {
//           Accept: "application/json",
//           Authorization: FSQ_API_KEY,
//         },
//       },
//     );

//     if (!response.ok) throw new Error("Foursquare API error");

//     const data = await response.json();
//     return (data.results || []).map((place) => ({
//       id: place.fsq_id,
//       name: place.name,
//       address:
//         place.location?.formatted_address || place.location?.address || "",
//       lat: place.geocodes?.main?.latitude || 0,
//       lng: place.geocodes?.main?.longitude || 0,
//       label: `${place.name}${place.location?.formatted_address ? ", " + place.location.formatted_address : ""}`,
//     }));
//   } catch (error) {
//     console.error("Foursquare search error:", error);
//     return [];
//   }
// }

export async function searchPlaces(query) {
  const url = `/api/foursquare/places/search?query=${encodeURIComponent(query)}`;
  const options = {
    method: "GET",
    headers: {
      "X-Places-Api-Version": "2025-06-17",
      accept: "application/json",
      authorization: "Bearer V2URRQ0K0TCOMMEP5MMLBOF2EREW10MF4R0DGOVE2P0KEJJ1",
    },
  };

  try {
    const res = await fetch(url, options);
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
