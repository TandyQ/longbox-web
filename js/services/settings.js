myApp.factory('Settings', ['$rootScope', function($rootScope) {

    var selectedService = 'Comic Vine';

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
        },
    };
    return myObject;
}]);
