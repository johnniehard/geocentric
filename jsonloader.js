
//from: http://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

//===================================
// geojson to geocentric coordinates
//===================================

 //TODO: add transform = false logic
 //		 or is that even nessesary? well yes maybe, that way you can set the 
 //		 size of the unprojected coordinates...
 //TODO: add argument to define the ellipsoid
function loadLineString(path, semiMajor3D, callback, transform = true){
	fetchJSONFile(path, function(data){
		var theEllipsoid = new Ellipsoid();
		for(var feature = 0; feature < data.features.length; feature++){
			var geometry = data.features[feature].geometry.coordinates;
			for(var pair = 0; pair < geometry.length; pair += 1){
				var lat = geometry[pair][1];
				var lon = geometry[pair][0];
				var coordinates = theEllipsoid.getGeocentric(lat, lon, 0);
				for(var i = 0; i < coordinates.length; i++){
					coordinates[i] = map(coordinates[i], 0, theEllipsoid.a, 0, semiMajor3D);
				}
				geometry[pair][0] = coordinates[0];
				geometry[pair][1] = coordinates[1];
				geometry[pair][2] = coordinates[2];
			}			
		}
		console.log("File " + path + " loaded.\n");
		callback(data);
	});
}

function loadPoint(path, semiMajor3D, callback, transform = true){
	fetchJSONFile(path, function(data){
		var theEllipsoid = new Ellipsoid();
		for(var feature = 0; feature < data.features.length; feature++){
			var pair = data.features[feature].geometry.coordinates;
			var lat = pair[1];
			var lon = pair[0];
			var coordinates = theEllipsoid.getGeocentric(lat, lon, 0);
			for(var i = 0; i < coordinates.length; i++){ pair[i] = map(coordinates[i], 0, theEllipsoid.a, 0, semiMajor3D); }
		}
		console.log("File " + path + " loaded.\n");
		callback(data);
	});
}