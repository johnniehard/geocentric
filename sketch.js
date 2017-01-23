/*

	Port from python
	Converting geodesic coordinates lat, lon, h to geocentric X, Y, Z coordinates.

	Porting to visualize it in 3D.

*/

var bessel;
var geocentricCoordinates = [];

function setup() {
	bessel = new Ellipsoid(6377397.155, 299.1528128);

	createCanvas(windowWidth, windowHeight, WEBGL);
	


	for(var lon = 0; lon < 360; lon += 10){
		for(var lat = 0; lat < 360; lat += 10){

			var coordinates = bessel.getGeocentric(lat, lon, 0);
			for(var i = 0; i < coordinates.length; i++){
				coordinates[i] = map(coordinates[i], 0, bessel.a, 0, 300);
			}

			geocentricCoordinates.push(coordinates);

		}
	}

	console.log(geocentricCoordinates.length);
	console.log(geocentricCoordinates);

	

	// camera



}

function draw() {
	background(50);

	camera(0, 0, 100);
	// rotateX(HALF_PIZ);
	rotateX(map(mouseY, 0, height, -HALF_PI, HALF_PI));
	rotateZ(map(mouseX, 0, width, 0, HALF_PI));

	//camera(map(mouseX, 0, width, -10000, 10000), 0, map(mouseY, 0, height, 0, 200000));

	for(var i = 0; i < geocentricCoordinates.length; i++){

		

		push();
		translate(geocentricCoordinates[i][0], geocentricCoordinates[i][1], geocentricCoordinates[i][2]);
		ambientMaterial(255);
		fill(255);
		sphere(5);
		//sphere(map(mouseY, 0, height, 2, 200));
		pop();

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