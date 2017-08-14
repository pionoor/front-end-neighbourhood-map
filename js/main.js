// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

var MapViewModel = function() {
    var self = this;
    var infoWindowContent = '';
    self.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 18,
        mapTypeControl: false,
        style: [{
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#bdbdbd"
                }]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#dadada"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#c9c9c9"
                }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }
        ]

    });
    self.locations = [
        { title: 'Alhambra', location: { lat: 37.1760954, lng: -3.5878516 } },
        { title: 'Mecca', location: { lat: 21.422597, lng: 39.825761 } },
        { title: 'Sagrada Família', location: { lat: 41.397184, lng: 2.1679638 } },
        { title: 'Mykonos', location: { lat: 37.4445213, lng: 25.3005934 } },
        { title: 'Baghdad', location: { lat: 33.311686, lng: 44.355905 } },
    ];
    self.filteredLocations = ko.observableArray(self.locations.slice(0));
    self.query = ko.observableArray();
    self.markers = [];
    self.infoWindow = new google.maps.InfoWindow();
    self.bounds = new google.maps.LatLngBounds();


    self.search = function(value) {
        self.filteredLocations.removeAll();

        for (var x in self.locations) {
            if (self.locations[x].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.filteredLocations.push(self.locations[x]);
            }
        }
        self.populateMarkers();
    };

    self.removeMarkers = function() {
        for (i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(null);

        }
        while (self.markers.length > 0) {
            self.markers.pop();
        }
    };


    self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            $.ajax({
                    url: 'http://en.wikipedia.org/w/api.php',
                    data: { action: 'opensearch', list: 'search', search: marker.title, format: 'json' },
                    type: 'GET',
                    dataType: 'jsonp',
                    success: function(response) {
                        infoWindowContent = "<h3>" + response[0] + "</h3> <p>" + response[2][0] + "</p>";
                    }
                }).done(function() {

                    console.log("success");
                })
                .fail(function() {
                    console.log("error");
                    infoWindowContent = "Error loading request!";
                })
                .always(function() {
                    console.log("complete");
                    infowindow.marker = marker;
                    infowindow.setContent('<div>' + infoWindowContent + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', function() {
                        infowindow.marker = null;
                    });
                });
        }
    };

    self.populateMarkers = function() {
        //clear markers array
        self.removeMarkers();

        var length = self.filteredLocations().length;
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < length; i++) {
            // Get the position from the location array.
            var position = self.filteredLocations()[i].location;
            var title = self.filteredLocations()[i].title;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                self.populateInfoWindow(this, self.infoWindow);
            });
            // Push the marker to our array of markers.
            self.markers.push(marker);
        }
        self.renderMarkers();
    };

    self.renderMarkers = function() {
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(self.map);
            self.bounds.extend(self.markers[i].position);
        }
        self.map.fitBounds(self.bounds);
        self.map.panToBounds(self.bounds);
    };
};

var mView;

function main() {
    mView = new MapViewModel();
    mView.populateMarkers();
    mView.query.subscribe(mView.search);
    ko.applyBindings(mView);

}