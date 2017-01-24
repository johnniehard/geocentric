/*
	Johnnie Hård 2017
	Transforms geodesic lat, lon coordinates into geocentric X, Y, Z coordinates.
	I use it to plot 2D shapefiles on a 3D globe.
*/

function Ellipsoid(a = 6378137, f = 298.257223563){ //defaults to wgs84

	this.a = a;
	this.f = 1/f;
	this.eSq = this.geteSquared(this.f);

}

Ellipsoid.prototype.getX = function(lat, lon, h){
	return (this.getNprime(lat) + h) * Math.cos(radians(lat)) * Math.cos(radians(lon));
}

Ellipsoid.prototype.getY = function(lat, lon, h){
	return (this.getNprime(lat) + h) * Math.cos(radians(lat)) * Math.sin(radians(lon));
}

Ellipsoid.prototype.getZ = function(lat, h){
	return (this.getNprime(lat) * (1 - this.eSq) + h) * Math.sin(radians(lat));
}

Ellipsoid.prototype.getGeocentric = function(lat, lon, h){
	return [this.getX(lat, lon, h), this.getY(lat, lon, h), this.getZ(lat, h)];
}

Ellipsoid.prototype.getNprime = function(lat){
	return this.a / Math.sqrt(1 - this.eSq * Math.pow(Math.sin(radians(lat)), 2))
}

Ellipsoid.prototype.geteSquared = function(f){
	return f * (2 - f);
}

Ellipsoid.prototype.getLatLon = function(geocentric){
	var lon = degrees(atan(geocentric[1] / geocentric[0]))
	var p = Math.sqrt((Math.pow(geocentric[0], 2)) + (Math.pow(geocentric[1], 2)))
	var theta = degrees(atan((geocentric[2]) / (p * Math.sqrt(1 - this.eSq))))
	// prep for lat
	var inner_division = (this.a * this.eSq) / (Math.sqrt(1 - this.eSq))
	var above_division = geocentric[2] + inner_division * (Math.sin(radians(theta)) ** 3)
	// below division
	var below_division = p - this.a * this.eSq * (Math.cos(radians(theta)) ** 3)
	var lat = degrees(atan(above_division / below_division))
	var h = ((p) / (Math.cos(radians(lat)))) - this.getNprime(lat)
	return [lat, lon, h]
}

function radians(degrees){
	return degrees * Math.PI / 180;
}

function degrees(radians){
	return radians * 180 / Math.PI;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};