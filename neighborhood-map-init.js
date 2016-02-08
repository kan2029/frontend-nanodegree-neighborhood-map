//hardcoded locations in map
initialPlaces = [
	{
		name: 'McDonalds',
		id: 0,
		geolocation: {lat: 12.973565, lng: 77.633414},
		marker: ''
	},
	{
		name: "Gold's Gym",
		id: 1,
		geolocation: {lat: 12.970510, lng: 77.645462},
		marker: ''
	},
	{
		name: "Pizza hut",
		id: 2,
		geolocation: {lat: 12.978221, lng: 77.640676},
		marker: ''
	},
	{
		name: "Dominos",
		id: 3,
		geolocation: {lat: 12.978158, lng: 77.639394},
		marker: ''
	}, 
	{
		name: "Burger King",
		id: 4,
		geolocation: {lat: 12.978025, lng: 77.646311},
		marker: ''	 
	}
];

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

			googleMap.initialMarkers[i].addListener('click', (function(j, thisInfowindow) {
			 	return function() {
			 		for( infowind in googleMap.infowindows){
						googleMap.infowindows[infowind].close();
					}
			 		googleMap.initialMarkers[j].setAnimation(google.maps.Animation.BOUNCE);
			        setTimeout(function(){
			            googleMap.initialMarkers[j].setAnimation(null);
				 		thisInfowindow.setContent('fetching data ...');
				    	thisInfowindow.open(googleMap.map, googleMap.initialMarkers[j]);
						googleMap.getWikiData(j, thisInfowindow);
					}, 700);	
			  	}
			})(i, infowindow));
			this.infowindows.push(infowindow);
		}	
		//shifted this line here because of synchronous loading of google maps api
		ko.applyBindings(new viewModel);	
	},
	errorHandling: function(){
		alert('Google map could not be loaded. Please try again later');
	},

	getWikiData: function(index, thisInfowindow){
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
				thisInfowindow.setContent(wikiResponse);
			},
			timeout: 5000,
			error: function (request, status, err) {
		        thisInfowindow.setContent('Request could not be completed because of status: '+request.status+', error: '+err+'. Please try again');
		    }
		});
	}
};