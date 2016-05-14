myApp.factory('Settings', ['$rootScope', '$cookies', 'localStorageService', function($rootScope, $cookies, localStorageService) {
    var selectedService = '';
    var viewMode = '';

    if (localStorageService.isSupported) {
        console.log("supported");
        if (localStorageService.get('selectedService') === "Marvel" ||
            localStorageService.get('selectedService') === "Comic Vine") {
            selectedService = localStorageService.get('selectedService');
        } else {
            selectedService = 'Marvel';
            localStorageService.set('selectedService', selectedService);
        }
        if (localStorageService.get('viewMode') === "standard" ||
            localStorageService.get('viewMode') === "compact") {
            viewMode = localStorageService.get('viewMode');
        } else {
            viewMode = 'standard';
            localStorageService.set('viewMode', viewMode);
        }
    } else {
        if ($cookies.get('selectedService') === "Marvel" ||
            $cookies.get('selectedService') === "Comic Vine") {
            selectedService = $cookies.get('selectedService');
        } else {
            selectedService = 'Marvel';
            $cookies.put('selectedService', selectedService);
        }
        if ($cookies.get('viewMode') === "standard" ||
            $cookies.get('viewMode') === "compact") {
            viewMode = $cookies.get('viewMode');
        } else {
            viewMode = 'standard';
            $cookies.put('viewMode', viewMode);
        }
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
            if (localStorageService.isSupported) {
                localStorageService.set('selectedService', selectedService);
            } else {
                $cookies.put('selectedService', selectedService);
            }
        },
        getViewMode: function() {
            return viewMode;
        },
        setViewMode: function(mode) {
            viewMode = mode;
            if (localStorageService.isSupported) {
                localStorageService.set('viewMode', viewMode);
            } else {
                $cookies.put('viewMode', viewMode);
            }

        }
    };
    return myObject;
}]);
