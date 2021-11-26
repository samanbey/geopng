/**
 * class GeoPNG
 *
 * to load georeferenced PNG files 
 * (currently not designed to display image, only to retrieve pixel values
 * at specified locations)
 *
 * assuming a normal position image in EPSG:4326 - longitudes grow to the right, latitudes upwards
 *  
 * MIT License
 * Copyright (c) 2021 Gede Mátyás
 */
 
class GeoPNG {                
    wReady=false; // world file loaded or georeference is specified by constructor arguments
    iReady=false; // image loaded
    ready=false;
    
    /**
     * @param {string} url - url of png image
     * @param {(string|number)} lng0 - url of world file or longitude of top left corner
     * @param {number} lat0 - latitude of top left corner (omitted if world file was provided)
     * @param {number} pixSize - pixel size in geographic degrees (omitted if world file was provided)
     */
    constructor(url,lng0,lat0,pixSize) {
        if (typeof lng0=='string') {
            // if second parameter is a string, treat it as url of the world file
            fetch(lng0).then(r=>r.text()).then(t=>{
                let w=t.split('\n');
                this.lng0=parseFloat(w[4]);
                this.lat0=parseFloat(w[5]);
                this.pixSize=parseFloat(w[0]);
                this.wReady=true;
                console.log('GeoPNG: world file loaded');
                if (this.iReady) {
                    // if the image file is already loaded, set georeference
                    this.lng1=this.lng0+this.pixSize*this.w;
                    this.lat1=this.lat0-this.pixSize*this.w;
                    this.ready=true;
                }
            });
        }
        else {
            // otherwise set georeference from arguments
            this.lng0=lng0; this.lat0=lat0; this.pixSize=pixSize;
            this.wReady=true;
        }
        this.img=new Image();
        this.img.onload=e=>{
            this.w=this.img.width;
            this.h=this.img.height;
            this.iReady=true;
            console.log('GeoPNG: image file loaded');
            if (this.wReady) {
                // if the world file is already loaded, set georeference
                this.lng1=this.lng0+this.pixSize*this.w;
                this.lat1=this.lat0-this.pixSize*this.w;
                this.ready=true;
            }
        }
        this.img.src=url;
        // a 1 by 1 pixel canvas is created to help retrieving pixel data from the image
        this._c=document.createElement('canvas');
        this._c.width=1;this._c.height=1;
        this._ct=this._c.getContext('2d');
    }
    
    /**
     * @param {(number|object)} lat - either the latitude or an object having 'lat' and 'lng' properties
     * @param {number} - longitude. Not used if lat is an object.
     * @returns {(Uint8ClampedArray(4)|boolean|number)} array of RGBA pixel intensity at given location
     *          or false if image has not been loaded yet
     *          or -1 if location is out of bounds
     */
    getValueAtLatLng(lat,lng) {
        if (!this.ready) {
            console.warn('GeoPNG: image not loaded yet!');
            return false;
        }
        if (typeof lat=='object'&&typeof lat.lat!='undefined'&&typeof lat.lng!='undefined') {
            // allows the use of Leaflet LatLng objects
            lng=lat.lng;
            lat=lat.lat;
        }
        if (typeof lat=='array') {
            // also allows the use of an [lat,lng] array
            lng=lat[1];
            lat=lat[0];
        }
        if (lat<this.lat1||lat>this.lat0||lng<this.lng0||lng>this.lng1) {
            console.warn('GeoPNG: location out of bounds!');
            return -1;
        }
        let i=Math.floor((this.lat0-lat)/this.pixSize); // pixel row
        let j=Math.floor((lng-this.lng0)/this.pixSize); // pixel column
        this._ct.drawImage(this.img,j,i,1,1,0,0,1,1);
        let iD=this._ct.getImageData(0,0,1,1).data;
        return iD;
    }
}
