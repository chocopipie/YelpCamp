// contains the script required for using Mapbox GL JS
// https://docs.mapbox.com/mapbox-gl-js/guides/install/#quickstart
// includes this script on any html/ejs rendering the map
// this file also customize the map

const parsedCampground = JSON.parse(campground);
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: parsedCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

// Create a default Marker and add it to the map.
new mapboxgl.Marker()
.setLngLat(parsedCampground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${parsedCampground.title}</h3><p>${parsedCampground.location}</p>`
        )
)
.addTo(map);
