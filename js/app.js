var myApp = angular.module('myApp', ['ngRoute', 'ngCookies', 'LocalStorageModule', 'firebase', 'mm.foundation', 'hmTouchEvents', 'angular.datepicker'])
    .constant('FIREBASE_URL', 'https://longbox.firebaseio.com/'); // change this URL to your Firebase URL

myApp.controller('MainController', ['$scope', function($scope) {
    if (("standalone" in window.navigator) && window.navigator.standalone) {
        $scope.layout = "standalone";
    } else {
        $scope.layout = "style";
    }
}]);

myApp.run(['$rootScope', '$location',
    function($rootScope, $location) {
        $rootScope.$on('$routeChangeError',
            function(event, next, previous, error) {
                if (error == 'AUTH_REQUIRED') {
                    $rootScope.message = 'Sorry, you must log in to access that page';
                    $location.path('/login');
                } // AUTH REQUIRED
            }); //event info
    }
]); //run

myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/login', {
        templateUrl: 'views/login.html',
        controller: 'RegistrationController'
    }).
    when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegistrationController'
    }).
    when('/all-new-issues', {
        templateUrl: 'views/all-new-issues.html',
        controller: 'AllNewIssuesController'
    }).
    when('/search/:seriesSearch', {
        templateUrl: 'views/search.html',
        controller: 'SearchController'
    }).
    when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController',
        resolve: {
            currentAuth: function(Authentication) {
                    return Authentication.requireAuth();
                } // current authentication
        } // resolve
    }).
    when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchController'
    }).
    when('/pull-list', {
        templateUrl: 'views/pull-list.html',
        controller: 'PullListController',
        resolve: {
            currentAuth: function(Authentication) {
                    return Authentication.requireAuth();
                } // current authentication
        } // resolve
    }).
    otherwise({
        redirectTo: '/all-new-issues'
    });
}]);

myApp.factory('PullList', ['$rootScope', '$firebaseArray', '$firebaseAuth', 'FIREBASE_URL',
    function($rootScope, $firebaseArray, $firebaseAuth, FIREBASE_URL) {

        var myObject = {
            getPullList: function() {
                var ref = new Firebase(FIREBASE_URL);
                var auth = $firebaseAuth(ref);

                auth.$onAuth(function(authUser) {
                    if (authUser) {
                        var pullRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
                        var pullListInfo = $firebaseArray(pullRef);

                        pullListInfo.$loaded().then(function(data) {
                            $rootScope.pullList = data;
                        }).catch(function(error) {
                            // handle error
                        });
                    } else {
                        $rootScope.pullList = {};
                    }
                });
            }
        };

        return myObject;
    }
]);

myApp.directive('ngEnter', function($parse) {
    return {
        restrict: 'A',
        compile: function($element, attr) {
            var fn = $parse(attr.myEnter, null, true);
            return function(scope, element, attrs) {
                element.on("keydown keypress", function(event) {
                    if (event.which === 13) {
                        element[0].blur();
                        scope.$apply(function() {
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                });
            };
        }
    };
});

myApp.filter('limitFromToChar', function() {
    return function(input, from, toString) {
        if (input.indexOf(toString) !== -1) {
            return (input !== undefined) ? input.slice(from, input.indexOf(toString)) : '';
        } else {
            return input;
        }

    };
});

myApp.filter('joinBy', function() {
    return function(input, delimiter) {
        return (input || []).join(delimiter || ',');
    };
});
