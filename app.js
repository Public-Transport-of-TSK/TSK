// Initialize the map
const map = L.map('map').setView([48.8867, 18.048], 10);

// Add the base tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to fetch and display points of interest
function displayPointsOfInterest(type, icon, color) {
    // Clear existing markers of the specified type
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.options.icon.options.iconUrl.includes(icon)) {
            map.removeLayer(layer);
        }
    });

    // Get the map bounds
    const bounds = map.getBounds();

    // Fetch OSM data for the Trenciansky Kraj region, including points of interest of the specified type
    axios.get(`https://overpass-api.de/api/interpreter?data=[out:json];(node["${type}"](48.3711,17.3376,49.0795,18.9167););out;`)
        .then(response => {
            // Process OSM data
            const data = response.data;

            data.elements.forEach(element => {
                // Check if element matches the specified type and has a name
                if (element.tags[type] && element.tags.name) {
                    const name = element.tags.name;
                    const lat = element.lat;
                    const lon = element.lon;

                    // Check if the element is within the map bounds and belongs to Trenciansky Kraj
                    if (bounds.contains([lat, lon]) && !bounds.contains([48.5946, 17.7373]) && !bounds.contains([48.8767, 17.6213])) {
                        // Create marker with specified SVG icon and color
                        const marker = L.marker([lat, lon], {
                            icon: L.icon({
                                iconUrl: `icons/${icon}`,
                                iconSize: [32, 32], // Adjust icon size if necessary
                                iconAnchor: [16, 32], // Adjust icon anchor if necessary
                            })
                        }).bindPopup(`<b>${name}</b><br>Latitude: ${lat}<br>Longitude: ${lon}`);
                        marker.setIconColor(color); // Set marker color
                        map.addLayer(marker);
                    }
                }
            });
        })
        .catch(error => console.error(`Error fetching ${type} data:`, error));
}

// Event listeners for map events
map.on('zoomend moveend', function() {
    // Display points of interest when zoomed in and moved
    if (map.getZoom() >= 12) {
        // Display bus stops
        displayPointsOfInterest("highway=bus_stop", "bus_stop.svg", "#008bcb");
        // Display tram stops
        displayPointsOfInterest("amenity=tram_stop", "tram_stop.svg", "#560000");
        // Display train stations
        displayPointsOfInterest("railway=station", "train_station.svg", "#ff671f");
        // Display bus stations
        displayPointsOfInterest("amenity=bus_station", "bus_station.svg", "#008bcb");
    } else {
        // Clear markers if zoomed out
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }
});

// Display points of interest initially
displayPointsOfInterest("highway=bus_stop", "bus_stop.svg", "#008bcb");
displayPointsOfInterest("amenity=tram_stop", "tram_stop.svg", "#560000");
displayPointsOfInterest("railway=station", "train_station.svg", "#ff671f");
displayPointsOfInterest("amenity=bus_station", "bus_station.svg", "#008bcb");
