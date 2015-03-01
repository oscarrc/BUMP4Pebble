// BCN Urban Mobility for Pebble (aka. BUM4Pebble )

// Oscar R.C. oscarrc.tic@gmail.com

// Based on Barcelona Urban Mobility API REST by Marc Pous
// http://barcelonaapi.marcpous.com/

// Copyright (C) 2015  Oscar R.C.

//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


//Include needed modules
var UI = require('ui');
var ajax = require('ajax');
var vector = require('vector2');
var vibe = require('ui/vibe');

var loadScreen = new UI.Card({
	title: 'PLEASE WAIT',
	body: 'While Barcelona Urban Mobility for Pebble is fetching rerquested data'
});

//Generating error card
var getError = function(error){
	var errorCard = new UI.Card({
		title: error.error.type,
		subtitle: '(Error ' + error.code + ')\n',
		body: error.error.message,
		banner: 'images/error.png',
		style: 'small'
	});
	
	vibe.vibrate('short');
	loadScreen.hide();
	return errorCard;
};

var getAddress = function(lat,lon)
{
	var address = '';
	
	ajax(
		{
			url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon,			
			type: 'json',
			async: false,
		},
		
		function (data)
		{	
			address = data.results[0].formatted_address;
		},
		
		function (error)
		{
			address = 'Sorry, address was unreachable';
		}
	);
	
	return address;
};



//Parse station info
var parseInfo = function(data, transportation)
{
	//Building commong window elements
	var info = new UI.Window({
		fullscreen: true,
		backgroundColor: 'black'
	});
	
	var clock = new UI.TimeText({
		position: new vector(0,2),
		size: new vector(144, 54),
		text: '%H:%M',
		font: 'ROBOTO_BOLD_SUBSET_49',
		color: 'white',
		textOverflow: 'wrap',
		textAlign: 'center',
		backgroundColor: 'black'
	});
	
	var card = new UI.Rect({
		position: new vector(0,89),
		size: new vector(144,80),
		backgroundColor: 'white'
	});	
	
	var tab = new UI.Image({
		position: new vector(0,60),
		size: new vector(36,29),
		image: 'images/tab.png',
		compositing: 'or'
	});	
				
	var transportIcon = new UI.Image({
		position: new vector(4,61),
		size: new vector(28,28),
		image: 'images/' + transportation + '.png',
		compositing: 'normal'
	});
	
	var infoIcon = new UI.Image({
		position: new vector(41,61),
		size: new vector(28,28),
		image: 'images/marker.png',
		compositing: 'invert'
	});
	
	var clockIcon = new UI.Image({
		position: new vector(77,61),
		size: new vector(28,28),
		image: 'images/clock.png',
		compositing: 'invert'
	});
	
	var moreIcon = new UI.Image({
		position: new vector(115,61),
		size: new vector(28,28),
		image: 'images/plus.png',
		compositing: 'invert'
	});
	
	var transportTitle = new UI.Text({
		position: new vector(0,85),
		size: new vector(144,75),
		backgroundColor: 'clear',
		color: 'black',
	});
	
	var transportCard = new UI.Text({
		position: new vector(0,109),
		size: new vector(144,55),
		backgroundColor: 'clear',
		color: 'black'
	});
	
	var addressCard = new UI.Text({
		position: new vector(0,85),
		size: new vector(144,75),
		backgroundColor: 'clear',
		color: 'black',
	});
	
	var scheduleTitle = new UI.Text({
		position: new vector(0,85),
		size: new vector(144,75),
		backgroundColor: 'clear',
		color: 'black',
	});
	
	var scheduleCard = new UI.Text({
		position: new vector(0,109),
		size: new vector(144,75),
		backgroundColor: 'clear',
		color: 'black',
	});
	
	var id = '';		
	var title = '';
	var name = '';
	var address = '';
	var lines = '';
	var connections = '';
	var coord = {};
	var URL = '';
	
	//Creating info tabs by transportation
	switch (transportation)
	{
		case 'bicing':	
			id = data.data.bici.id;
			name = data.data.bici.name;
			coord[0] = data.data.bici.lat;
			coord[1] = data.data.bici.lon;
			lines = ' Nearby Stations ';
			connections = data.data.bici.nearby_stations;
			URL = '/bicing/stations.json';
			break;
		case 'bus':			
			id = data.data.tmb.id;
			name = data.data.tmb.street_name;
			title = data.data.tmb.furniture;
			coord[0] = data.data.tmb.lat;
			coord[1] = data.data.tmb.lon;
			lines = ' Bus Lines ';
			connections = data.data.tmb.buses;
			URL = '/bus/lines.json';
			break;
		case 'metro':
			id = data.data.metro.id;
			name = data.data.metro.name;
			title = data.data.metro.zone;
			coord[0] = data.data.metro.lat;
			coord[1] = data.data.metro.lon;
			lines = ' Line ' + data.data.metro.line;
			if (data.data.metro.connections === ''){
				connections = ' Connections: No connections';
			}else{
				connections = ' Connections ' + data.data.metro.connections;
			}		
			URL = '/metro/edges.json';
			break;
		case 'parking':
			id = data.data.park.id;
			name = data.data.park.name.replace(/Aparcament /i, '');
			title = 'Aparcament';
			coord[0] = data.data.park.lat;
			coord[1] = data.data.park.lon;
			connections = "No more info";
			break;
		case 'renfe':
			id = data.data.renfe.id;
			name = data.data.renfe.name;
			if ( data.data.renfe.zone != 'No intengrat'){
				title = data.data.renfe.zone;
			}
			coord[0] = data.data.renfe.lat;
			coord[1] = data.data.renfe.lon;
			lines = ' Renfe Lines ';
			connections = data.data.renfe.line;
			URL = '/renfe/edges.json';
			break;
		case 'fgc':
			id = data.data.fgc.id;
			name = data.data.fgc.name;
			transportCard.text(name);
			if ( data.data.fgc.zone == 'No intengrat'){
				title = ' ';
			}else{
				title = data.data.fgc.zone;
			}
			coord[0] = data.data.fgc.lat;
			coord[1] = data.data.fgc.lon;	
			lines = data.data.fgc.line;
			if (data.data.fgc.connections === ''){
				connections = ' No connections';
			}else{
				connections = data.data.fgc.connections;
			}
			URL = '/fgc/edges.json';
			break;
		case 'tram':
			id = data.data.tram.id;
			name = data.data.tram.name;
			title = data.data.tram.zone;
			coord[0] = data.data.tram.lat;
			coord[1] = data.data.tram.lon;
			lines = ' Line ' + data.data.tram.line;
			if (data.data.tram.connections === ''){
				connections = ' Connections: No connections';
			}else{
				connections = ' Connections: ' + data.data.tram.connections;
			}			
			URL = '/tram/edges.json';
			break;
	}
	
	address = getAddress(coord[0],coord[1]);
	transportTitle.text(title);
	transportCard.text(name);
	addressCard.text(address.slice(0,-19));
	scheduleTitle.text(lines);
	scheduleCard.text(connections);
	
	//Adding elements
	info.add(tab);	
	info.add(transportIcon);
	info.add(infoIcon);
	info.add(clockIcon);	
	info.add(clock);
	info.add(card);
	info.add(transportTitle);
	info.add(transportCard);
	
	
	//Define button and tap acctions
	var tabIndex = 1;
	var pos;
	
	info.on('click', 'down', function() {
		switch (tabIndex){
			case 1:
				transportIcon.compositing('invert');
				infoIcon.compositing('normal');
				pos = new vector(37,60);
				tab.position(pos);	
				info.remove(transportTitle);
				info.remove(transportCard);				
				info.add(addressCard);							
				break;
			case 2:
				infoIcon.compositing('invert');
				clockIcon.compositing('normal');
				pos = new vector(73,60);
				tab.position(pos);
				info.remove(addressCard);
				info.add(scheduleTitle);
				info.add(scheduleCard);
				if (transportation != 'parking'){
					info.add(moreIcon);
				}
				break;
		}
		
		if (tabIndex < 3){
			tabIndex++;
		}
	});

	info.on('click', 'select', function() {
	});

	info.on('click', 'up', function() {			
		switch (tabIndex){
			case 3:
				clockIcon.compositing('invert');
				infoIcon.compositing('normal');
				pos = new vector(37,60);
				tab.position(pos);
				info.remove(scheduleTitle);
				info.remove(scheduleCard);
				info.add(addressCard);
				info.remove(moreIcon);
				break;
			case 2:
				infoIcon.compositing('invert');
				transportIcon.compositing('normal');
				pos = new vector(0,60);
				tab.position(pos);
				info.remove(addressCard);
				info.add(transportCard);
				info.add(transportTitle);				
				break;
		}
			
		if (tabIndex > 1){
			tabIndex--;
		}
	});
	
	return info;
};

//Parse nearby stations info
var parseNearby = function (data, total)
{
	var items = [];
		
	for (var i = 0; i < total; i++)
	{
		//Check that we have not gone out of range 
		if (data.data.nearstations[i] === undefined)
		{
			break;
		}
		
		//Building Menu items
		var transportation = data.data.transport;
		var id = data.data.nearstations[i].id;		
		var name = data.data.nearstations[i].name;
		
		if (transportation == 'bus')
		{
			name = data.data.nearstations[i].street_name;
		}else if( transportation == 'parking'){
			name = name.replace(/Aparcament /i, '');
		}
		
		var distance = Number(data.data.nearstations[i].distance);
		
		//Presentamos la distancia en la unidad correspondiente
		if ( distance >= 1 ){
			distance = Math.round(distance*100)/100 + ' Km.';
		}else if ( distance > 0 && distance < 1 ){
			distance = Math.round(distance*1000) + ' m.';
		}else{
			distance = 'Almost here';			
		}
		
		console.log(distance);
		
		items.push({
			id: id,
			ref: transportation,
			title: name,
			subtitle: distance
		});
	}
	
	return items;
};

//Get user location
function getLocation(transportation)
{
	//Define geolocation options
	var locationOptions = {
		enableHighAccuracy: true, 
		maximumAge: 60000, 
		timeout: 5000	
	};
	
	var locationSuccess = function(pos) {
		var URL = transportation + '/nearstation/latlon/' + pos.coords.latitude + '/' + pos.coords.longitude + '/2.json';
		//testing
		//var URL = transportation + '/nearstation/latlon/41.3985182/2.1917991/2.json';
		getNearby(URL,transportation);
	};
	
	//If location is not reachable
	var locationError = function(error) {
		console.log('location error (' + error.code + '): ' + error.message);
		var errorCode = new Object({
			code : '403',
			error : new Object ({
				message : 'Are location services enabled in your phone?',
				type: 'Location ' + error[1]
			})
		});	
		
		var alert =getError(errorCode);		
		alert.show();
	};
	
	//Getting Location
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}



//Get station info
function getInfo(id, transportation)
{
	var URL = transportation + '/station/id/' + id + '.json';
	
	if (transportation == 'bus' ){
		URL = transportation + '/next/id/' + id + '.json';
	}else if (transportation == 'parking'){
		URL = transportation + '/' + transportation + '/id/' + id + '.json';
	}
	
	ajax(
		{
			url: 'http://barcelonaapi.marcpous.com/' + URL,
			type: 'json'
		},
		
		function (data)
		{			
			var station = parseInfo(data, transportation);			
			station.show();
			loadScreen.hide();
		},
		
		function (error)
		{
			var errorCode = new Object({
				code : '503',
				error : new Object ({
					message : 'Can\'t connect with API. Try again later.',
					type: 'Connection ' + error[1]
				})
			});	
			var alert = getError(errorCode);
			alert.show();
			vibe.vibrate('short');
		}
	);
}

//Get neraby stations
function getNearby(URL, transportation)
{
	ajax(
		{
			url: 'http://barcelonaapi.marcpous.com/' + URL,
			type: 'json'
		},
		
		function(data)
		{
			var menuItems = parseNearby(data, 5);				

			var nearbyMenu = new UI.Menu({
				sections: [{
					title: 'Nearby ' + transportation + ' stations',
					items: menuItems
				}]
			});
				
			nearbyMenu.show();
			loadScreen.hide();	
			nearbyMenu.on('select', function(e) {
				loadScreen.show();
				getInfo(e.item.id, e.item.ref);
			});
		},
	
		function(error)
		{
			var alert = getError(error);
			alert.show();
		}
	);	
}

//Main function
function main(){

	//Creating splashScreen window
	var splashScreen = new UI.Window({
		fullscreen: true,
		backgroundColor: 'white'
	});

	var splashImage = new UI.Image({
		position: new vector(0,0),
		size: new vector(144,168),
		image: 'images/splash.png'
	});	
			
	//Define transportations array
	var transportations = [
		{
			ref: 'bicing',
			title: 'Bike',
			icon: 'images/bicing.png'
		},
		{
			ref: 'bus',
			title: 'Bus',
			icon: 'images/bus.png'
		},	
		{
			ref: 'parking',
			title: 'Parking',
			icon: 'images/parking.png'
		},
		{
			ref: 'metro',
			title: 'Subway',
			icon: 'images/metro.png'
		},	
		{
			ref: 'train',
			title: 'Train',
			icon: 'images/train.png'
		},
		{
			ref: 'tram',
			title: 'Tramway',
			icon: 'images/tram.png'
		},
	];

	//Define train operators array
	var operators = [
		{
			ref: 'renfe',
			title: 'Renfe',
			icon: 'images/renfe.png'
		},
		{
			ref: 'fgc',
			title: 'Ferrocarrils de la Generalitat',
			icon: 'images/fgc.png'
		}
	];

	//Building Transpportations Menu
	var transportationsMenu = new UI.Menu({
		sections: [{
			items: transportations
		}]
	});
		
	//Building Operators Menu
	var operatorsMenu = new UI.Menu({
		sections: [{
			title: 'Select operator',
			items: operators
		}]
	});
	
	splashScreen.add(splashImage);
	splashScreen.show();	
	
	setTimeout(function(){
		transportationsMenu.show();
		splashScreen.hide();
	}, 1000);
	
	//Handling Transportations menu options
	transportationsMenu.on('select', function(e) {
		if (e.item.ref == 'train'){
			operatorsMenu.show();
				operatorsMenu.on('select', function(e) {
					getLocation(e.item.ref);
				});
		}else{
			loadScreen.show();
			getLocation(e.item.ref);
		}
	});
}

main();