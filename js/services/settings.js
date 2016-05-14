myApp.factory('Settings', ['$rootScope', '$cookies', function($rootScope, $cookies) {
    var selectedService = '';
    if ($cookies.get('selectedService') === "Marvel" ||
        $cookies.get('selectedService') === "Comic Vine") {
        selectedService = $cookies.get('selectedService');
    } else {
        selectedService = 'Marvel';
        $cookies.put('selectedService', selectedService);
    }

    var myObject = {
        getSelectedServicePrefix: function() {
            var selectedServicePrefix = '';
            if (selectedService == 'Marvel') {
                selectedServicePrefix = 'marvel';
            } else if (selectedService == 'Comic Vine') {
                selectedServicePrefix = 'comic-vine';
            }
            return selectedServicePrefix;
        },
        getSelectedService: function() {
            return selectedService;
        },
        setSelectedService: function(service) {
            selectedService = service;
            console.log("Set!");
            $cookies.put('selectedService', selectedService);
        },
    };
    return myObject;
}]);
