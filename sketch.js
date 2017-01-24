/*

	Port from python
	Converting geodesic coordinates lat, lon, h to geocentric X, Y, Z coordinates.

	Porting to visualize it in 3D.

*/

var theEllipsoid;
var geocentricCoordinates = [];
var coastlines;

var zoomLevel = 0;

function preload(){
	coastlines = loadJSON("coastlines.geojson");
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	background(50);

	coastlines = coastlines.features;
	console.log("geoJSON loaded");

	theEllipsoid = new Ellipsoid();
	
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