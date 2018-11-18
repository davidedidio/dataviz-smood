/*var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];

function initmap() {
    // set up the map
    map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

    // start the map in South-East England
    map.setView(new L.LatLng(51.3, 0.7),9);
    map.addLayer(osm);
}
initmap()*/

var mymap = L.map('mapid',{
     trackResize: false
}).setView([46.519962, 6.64], 12);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA'
}).addTo(mymap);

var marker = L.marker([46.517116,6.630342]).addTo(mymap);

marker.bindPopup("Pickup").openPopup();

var marker1 = L.marker([46.508528,6.627598]).addTo(mymap);

marker1.bindPopup("Delivery").openPopup();

var circle = L.circle([46.519962, 6.64], {
    color: 'green',
    fillColor: 'green',
    fillOpacity: 0.5,
    radius: 5000
}).addTo(mymap);

var polygon = L.polygon([
    [46.517116,6.630342],
	[46.508528,6.627598]
]).addTo(mymap);

polygon.bindPopup("First delivery!").openPopup();

var popup = L.popup()
    .setLatLng([46.517116,6.6])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
	
	
	
	
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);