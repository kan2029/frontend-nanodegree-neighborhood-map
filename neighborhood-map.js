
//A location constructor
var Place = function(data){
	this.name = ko.observable(data.name);
	this.geolocation = ko.observable(data.geolocation);
	this.id = ko.observable(data.id);
	this.marker = googleMap.initialMarkers[data.id];
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
	    	for( infowind in googleMap.infowindows){
				googleMap.infowindows[infowind].close();
			}
	    	if(self.searchString().length == 0 || rec.name().toLowerCase().indexOf(self.searchString().toLowerCase()) > -1){
	    		rec.marker.setVisible(true);
	    		return true;
	    	}else{
	    		rec.marker.setVisible(false);
	    		return false;
	    	}
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
	    	googleMap.getWikiData(thisObj.id(), googleMap.infowindows[thisObj.id()]);	
        },700);
	}
}