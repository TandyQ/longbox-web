var myApp = angular.module('myApp', ['ngRoute', 'firebase', 'mm.foundation'])
    .constant('FIREBASE_URL', 'https://longbox.firebaseio.com/');

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
    when('/thisweek', {
        templateUrl: 'views/thisweek.html',
        controller: 'ThisWeekController'
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
        redirectTo: '/thisweek'
    });
}]);

myApp.factory('PullList', ['$rootScope', '$firebaseArray', 'FIREBASE_URL',
    function($rootScope, $firebaseArray, FIREBASE_URL) {

        var ref = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
        console.log(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');

        return $firebaseArray(ref);
    }
]);

myApp.filter('limitFromToChar', function(){
    return function(input, from, toString) {
        return (input !== undefined) ? input.slice(from, input.indexOf(toString)) : '';
    };
});
