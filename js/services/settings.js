myApp.factory('Settings', ['$rootScope', '$cookies', 'localStorageService', function($rootScope, $cookies, localStorageService) {
    var selectedService = '';
    var viewMode = '';
    var firstIssueHighlight = "true";
    var coverQuality = "large";

    if (localStorageService.isSupported) {
        // Selected Service
        if (localStorageService.get('selectedService') === "Marvel" ||
            localStorageService.get('selectedService') === "Comic Vine") {
            selectedService = localStorageService.get('selectedService');
        } else {
            selectedService = 'Marvel';
            localStorageService.set('selectedService', selectedService);
        }

        // View Mode
        if (localStorageService.get('viewMode') === "standard" ||
            localStorageService.get('viewMode') === "compact") {
            viewMode = localStorageService.get('viewMode');
        } else {
            viewMode = 'standard';
            localStorageService.set('viewMode', viewMode);
        }

        // First Issue Highlight
        if (localStorageService.get('firstIssueHighlight')) {
            firstIssueHighlight = localStorageService.get('firstIssueHighlight');
        } else {
            firstIssueHighlight = "true";
            localStorageService.set('firstIssueHighlight', firstIssueHighlight);
        }

        // Cover Quality
        if (localStorageService.get('coverQuality')) {
            coverQuality = localStorageService.get('coverQuality');
        } else {
            coverQuality = "large";
            localStorageService.set('coverQuality', coverQuality);
        }
    } else {
        // Selected Service
        if ($cookies.get('selectedService') === "Marvel" ||
            $cookies.get('selectedService') === "Comic Vine") {
            selectedService = $cookies.get('selectedService');
        } else {
            selectedService = 'Marvel';
            $cookies.put('selectedService', selectedService);
        }

        // View Mode
        if ($cookies.get('viewMode') === "standard" ||
            $cookies.get('viewMode') === "compact") {
            viewMode = $cookies.get('viewMode');
        } else {
            viewMode = 'standard';
            $cookies.put('viewMode', viewMode);
        }

        // First Issue Highlight
        if ($cookies.get('firstIssueHighlight')) {
            firstIssueHighlight = $cookies.get('firstIssueHighlight');
        } else {
            firstIssueHighlight = "true";
            $cookies.put('firstIssueHighlight', firstIssueHighlight);
        }

        // Cover Quality
        if ($cookies.get('coverQuality')) {
            coverQuality = $cookies.get('coverQuality');
        } else {
            coverQuality = "large";
            $cookies.put('coverQuality', coverQuality);
        }
    }

    var myObject = {
        // Selected Service
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
        // View Mode
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
        },

        // First Issue Highlight
        getFirstIssueHighlight: function() {
            return firstIssueHighlight;
        },
        setFirstIssueHighlight: function(highlightSetting) {
            firstIssueHighlight = highlightSetting;
            if (localStorageService.isSupported) {
                localStorageService.set('firstIssueHighlight', firstIssueHighlight);
            } else {
                $cookies.put('firstIssueHighlight', firstIssueHighlight);
            }
        },

        // Cover Quality
        getCoverQuality: function() {
            return coverQuality;
        },
        setCoverQuality: function(quality) {
            coverQuality = quality;
            if (localStorageService.isSupported) {
                localStorageService.set('coverQuality', coverQuality);
            } else {
                $cookies.put('coverQuality', coverQuality);
            }
        }
    };
    return myObject;
}]);
