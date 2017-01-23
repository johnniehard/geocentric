/*

	Port from python
	Converting geodesic coordinates lat, lon, h to geocentric X, Y, Z coordinates.

	Porting to visualize it in 3D.

*/

var theEllipsoid;
var geocentricCoordinates = [];
var coastlines;

var wgs84 = {
	a: 6378137,
	f: 298.257223563
};

var zoomLevel = 0;

function preload(){
	coastlines = loadJSON("coastlines.geojson");
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	background(50);

	coastlines = coastlines.features;
	console.log("geoJSON loaded");

	// theEllipsoid = new Ellipsoid(6377397.155, 299.1528128); // bessel
	theEllipsoid = new Ellipsoid(wgs84.a, wgs84.f);
	
	for(var feature = 0; feature < coastlines.length; feature++){

		var geometry = coastlines[feature].geometry.coordinates;

		for(var pair = 0; pair < geometry.length; pair += 1){

			var lat = geometry[pair][1];
			var lon = geometry[pair][0];
			lon *= -1;
			var coordinates = theEllipsoid.getGeocentric(lat, lon, 0);
			for(var i = 0; i < coordinates.length; i++){
				coordinates[i] = map(coordinates[i], 0, theEllipsoid.a, 0, 300);
			}

			geometry[pair][0] = coordinates[0];
			geometry[pair][1] = coordinates[1];
			geometry[pair][2] = coordinates[2];
		}

	}

	console.log(geocentricCoordinates.length);
	console.log(geocentricCoordinates);
}

function draw() {
	background(0);

	camera(0, 0, zoomLevel);

	push();
		rotateX(-HALF_PI);
		rotateX(map(mouseY, 0, height, -HALF_PI, HALF_PI));
		rotateZ(map(mouseX, 0, width, -PI, PI));

		for(var feature = 0; feature < coastlines.length; feature++){
			var geometry = coastlines[feature].geometry.coordinates;
			beginShape();
			fill(255);
				for(var i = 0; i < geometry.length; i+=1){
					vertex(geometry[i][0], geometry[i][1], geometry[i][2]);
				}
			endShape();
		}

	pop();

	fill(0, 200);
	plane(width * 2, height * 2);

	fill(255);
}

function mouseWheel(event){
	zoomLevel += event.delta;
}

function convertAllLatlon(){ //no currently used, just put it here to save it. May need some rewrite to work.
	for(var lon = 0; lon < 360; lon += 10){
		for(var lat = 0; lat < 360; lat += 10){

			var coordinates = theEllipsoid.getGeocentric(lat, lon, 0);
			for(var i = 0; i < coordinates.length; i++){
				coordinates[i] = map(coordinates[i], 0, theEllipsoid.a, 0, 300);
			}

			geocentricCoordinates.push(coordinates);
		}
	}
}

/*
	The ellipsoid stuff
*/

function Ellipsoid(a, f){

	this.a = a;
	this.f = 1/f;
	this.eSq = this.geteSquared(this.f);

}

Ellipsoid.prototype.getX = function(lat, lon, h){
	return (this.getNprime(lat) + h) * cos(radians(lat)) * cos(radians(lon));
}

Ellipsoid.prototype.getY = function(lat, lon, h){
	return (this.getNprime(lat) + h) * cos(radians(lat)) * sin(radians(lon));
}

Ellipsoid.prototype.getZ = function(lat, h){
	return (this.getNprime(lat) * (1 - this.eSq) + h) * sin(radians(lat));
}

Ellipsoid.prototype.getGeocentric = function(lat, lon, h){
	return [this.getX(lat, lon, h), this.getY(lat, lon, h), this.getZ(lat, h)];
}

Ellipsoid.prototype.getNprime = function(lat){
	return this.a / Math.sqrt(1 - this.eSq * Math.pow(sin(radians(lat)), 2))
}

Ellipsoid.prototype.geteSquared = function(f){
	return f * (2 - f);
}

Ellipsoid.prototype.getLatLon = function(geocentric){
	var lon = degrees(atan(geocentric[1] / geocentric[0]))
	// p = Math.sqrt((geocentric[0]**2) + (geocentric[1]**2))
	var p = Math.sqrt((Math.pow(geocentric[0], 2)) + (Math.pow(geocentric[1], 2)))
	var theta = degrees(atan((geocentric[2]) / (p * Math.sqrt(1 - this.eSq))))
	// prep for lat
	var inner_division = (this.a * this.eSq) / (Math.sqrt(1 - this.eSq))
	var above_division = geocentric[2] + inner_division * (sin(radians(theta)) ** 3)
	// below division
	var below_division = p - this.a * this.eSq * (cos(radians(theta)) ** 3)
	var lat = degrees(atan(above_division / below_division))
	var h = ((p) / (cos(radians(lat)))) - this.getNprime(lat)
	return [lat, lon, h]
}