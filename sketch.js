/*

	Port from python
	Converting geodesic coordinates lat, lon, h to geocentric X, Y, Z coordinates.

	Porting to visualize it in 3D.

*/

function setup() {
	bessel = new Ellipsoid(6377397.155, 299.1528128);
	bessel_geocentric = bessel.getGeocentric(58, 17, 30);
	console.log(bessel_geocentric);
	console.log(bessel.getLatLon(bessel_geocentric));
}

function draw() {
  
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