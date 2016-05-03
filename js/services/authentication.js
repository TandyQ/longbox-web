myApp.factory('Authentication', ['$rootScope', '$firebaseAuth', '$firebaseObject', '$location', 'FIREBASE_URL',
    function($rootScope, $firebaseAuth, $firebaseObject, $location, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid);
                var userObj = $firebaseObject(userRef);
                $rootScope.currentUser = userObj;
            } else {
                $rootScope.currentUser = '';
            }
        });

        var myObject = {
            login: function(user) {
                auth.$authWithPassword({
                    email: user.email,
                    password: user.password
                }).then(function(regUser) {
                    $location.path('/all-new-issues');
                }).catch(function(error) {
                    $rootScope.message = error.message;
                });
                $rootScope.message = "Welcome " + user.email;
            }, // login
            logout: function() {
                return auth.$unauth();
            }, // logout
            requireAuth: function() {
                return auth.$requireAuth();
            }, // require authentication
            register: function(user) {
                    auth.$createUser({
                        email: user.email,
                        password: user.password
                    }).then(function(regUser) {

                        var regRef = new Firebase(FIREBASE_URL + 'users');
                        regRef.child(regUser.uid).set({
                            date: Firebase.ServerValue.TIMESTAMP,
                            regUser: regUser.uid,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email
                        }); // user info

                        myObject.login(user); // log new user in
                    }).catch(function(error) {
                        $rootScope.message = error.message;
                    }); // create user
                } // register
        };

        return myObject;
    }
]); // factory
