
//hardcoded locations in map
var initialPlaces = [
	{
		name: 'McDonalds',
		id: 0,
		geolocation: {lat: 12.973565, lng: 77.633414},
	},
	{
		name: "Gold's Gym",
		id: 1,
		geolocation: {lat: 12.970510, lng: 77.645462},
	},
	{
		name: "Pizza hut",
		id: 2,
		geolocation: {lat: 12.978221, lng: 77.640676},
	},
	{
		name: "Dominos",
		id: 3,
		geolocation: {lat: 12.978158, lng: 77.639394},
	}, 
	{
		name: "Burger King",
		id: 4,
		geolocation: {lat: 12.978025, lng: 77.646311},	 
	}
];

//GoogleMap object: contains methods that handle map initialization, map markers, infowindows, wiki ajax call
googleMap = {
	initialMarkers: [],
	map: '',
	infowindows: [],
	init: function(){
		this.map = new google.maps.Map(document.getElementById('mapSection'), {
		    center: {lat: 12.977230, lng: 77.640904},
		    scrollwheel: false,
		    zoom: 15
		});

		for(var i=0; i < initialPlaces.length; i++){
			this.initialMarkers[i] = new google.maps.Marker({
			   position: initialPlaces[i].geolocation,
			   map: googleMap.map
			});	
			var infowindow = new google.maps.InfoWindow({
			});	

			googleMap.initialMarkers[i].addListener('click', (function(j) {
			 	return function() {
			 		googleMap.initialMarkers[j].setAnimation(google.maps.Animation.BOUNCE);
			        setTimeout(function(){
			            googleMap.initialMarkers[j].setAnimation(null);
				 		infowindow.setContent('fetching data ...');
				    	infowindow.open(googleMap.map, googleMap.initialMarkers[j]);
				    	
				    	var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+initialPlaces[j].name+'&format=json&callback=wikiCallback';
						var wikiResponse = '<ul>';
						$.ajax({
							url: wikiUrl,
							dataType: 'jsonp',
							success: function(response){
								var articleList = response[1];
								for(var i=0; i < articleList.length; i++){
									articleStr = articleList[i]
									var url = 'http://en.wikipedia.org/wiki/'+articleStr;
									wikiResponse = wikiResponse + '<li><a href="'+url+'">'+articleStr+'</a></li>';
								}
								wikiResponse = wikiResponse + '</ul>';
								infowindow.setContent(wikiResponse);
							},
							timeout: 5000,
							error: function (request, status, err) {
						        infowindow.setContent('Request could not be completed because of status: '+request.status+', error: '+err+'. Please try again');
						    }
						});
					}, 750);	
			  	}
			})(i));
			this.infowindows.push(infowindow);
		}		
	},

	getWikiData: function(index){
		var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+initialPlaces[index].name+'&format=json&callback=wikiCallback';
		var wikiResponse = '<ul>';
		$.ajax({
			url: wikiUrl,
			dataType: 'jsonp',
			success: function(response){
				var articleList = response[1];

				for(var i=0; i < articleList.length; i++){
					articleStr = articleList[i]
					var url = 'http://en.wikipedia.org/wiki/'+articleStr;
					wikiResponse = wikiResponse + '<li><a href="'+url+'">'+articleStr+'</a></li>';
				}
				wikiResponse = wikiResponse + '</ul>';
				googleMap.infowindows[index].setContent(wikiResponse);
			},
			timeout: 5000,
			error: function (request, status, err) {
		        infowindow.setContent('Request could not be completed because of status: '+request.status+', error: '+err+'. Please try again');
		    }
		});
	}
};

//A location constructor
var Place = function(data){
	this.name = ko.observable(data.name);
	this.geolocation = ko.observable(data.geolocation);
	this.id = ko.observable(data.id);
};

//The octopus!
var viewModel = function(){
	var self = this;

	self.placeList = ko.observableArray([]);
	initialPlaces.forEach(function(place){
		self.placeList.push(new Place(place));
	});

	//used to filter places using text input
	self.searchString = ko.observable('');

	//returns those locations that has the string entered by user. Displays all places when no input it there
	self.filteredPlaceList = ko.observableArray([]);
	self.filteredPlaceList = ko.computed(function () {
	    return ko.utils.arrayFilter(self.placeList(), function (rec) {
            return (
               (self.searchString().length == 0 || rec.name().toLowerCase().indexOf(self.searchString().toLowerCase()) > -1)
            );
	    });
	});

	//animate marker and make ajax call to wikipedia url. sets wikipedia information in corresponding infowindow
	animateMarker = function(thisObj){
		for( infowindow in googleMap.infowindows){
			googleMap.infowindows[infowindow].close();
		}
		googleMap.initialMarkers[thisObj.id()].setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            googleMap.initialMarkers[thisObj.id()].setAnimation(null);
        	googleMap.infowindows[thisObj.id()].setContent('fetching data ...');
	    	googleMap.infowindows[thisObj.id()].open(googleMap.map, googleMap.initialMarkers[thisObj.id()]);
	    	googleMap.getWikiData(thisObj.id());	
        },750);
	}
}


ko.applyBindings(new viewModel);


$(document).ready(function(){
	googleMap.init();

	//This keyup event shows only those markers that are filtered by user by entering infilter text box
	$('#searchBox').keyup(function(){
		//get filtered places
		var filteredNames = [];
		var filteredGeolocation = [];
		var listElement = $('#locationListSection').find('li');
		for(var i = 0; i < listElement.length; i++){
			filteredNames.push(listElement.eq(i).html());
		}
		for(var i=0; i < filteredNames.length; i++){
			for(var j=0; j< initialPlaces.length; j++){
				if(filteredNames[i] == initialPlaces[j].name){
					filteredGeolocation.push(initialPlaces[j].geolocation);
				}
			}
		}

		//Show markers of only filtered places
		for (var i = 0; i < googleMap.initialMarkers.length; i++) {
			googleMap.initialMarkers[i].setMap(null);
		}
		for (var i = 0; i < googleMap.initialMarkers.length; i++) {
			for(var j=0; j < filteredGeolocation.length; j++){
				if(filteredGeolocation[j].lat == googleMap.initialMarkers[i].position.lat().toFixed(6) && filteredGeolocation[j].lng == googleMap.initialMarkers[i].position.lng().toFixed(6)){
				   	googleMap.initialMarkers[i].setMap(googleMap.map);
				}   		
			}
		}
	});
});