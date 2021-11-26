# geopng
Javascript class to help working with georeferenced PNG files

## Usage
- Download geopng.js and include it in your HTML file
``` html
<script src="geopng.js"></script>
```
- use the `GeoPNG` constructor to load georeferenced PNG file into memory
``` javascript
var g=new GeoPNG('p.png','p.pgw');
```
- use the `getValueAtLatLng()` method to retrieve pixel data of a given location.
Example: using on a Leaflet `map` object in `click` events:
``` javascript
map.on('click',e=>{
    alert(g.getValueAtLatLng(e.latlng));
});
```
