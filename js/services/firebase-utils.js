myApp.factory('FirebaseUtils', ['$rootScope', "PullListUtils", '$firebaseArray', '$firebaseAuth', 'FIREBASE_URL',
    function($rootScope, PullListUtils, $firebaseArray, $firebaseAuth, FIREBASE_URL) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        var myObject = {
            addToPullList: function(series) {
                auth.$onAuth(function(authUser) {
                    if (authUser) {
                        var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
                        var pullListInfo = $firebaseArray(pullListRef);

                        pullListInfo.$loaded().then(function(data) {
                            if (!PullListUtils.isInPullList(series.name, pullListInfo)) {
                                pullListInfo.$add({
                                    name: series.name,
                                    resourceURI: series.resourceURI
                                }).then(function() {
                                    // do something
                                });
                            } else {
                                // Already in pull list
                            }
                        }).catch(function(error) {
                            console.log(error);
                        });


                    } else {
                        // No authorized user
                    }
                });
            },
            removeFromPullList: function(sub) {
                auth.$onAuth(function(authUser) {
                    if (authUser) {
                        var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
                        var pullListInfo = $firebaseArray(pullListRef);
                        pullListInfo.$loaded().then(function(data) {
                            var index = pullListInfo.$getRecord(sub.$id);
                            pullListInfo.$remove(index).then(function(ref) {
                                // object removed
                            });
                            //pullListInfo.$remove(sub);
                        }).catch(function(error) {
                            console.log(error);
                        });
                    } else {
                        // No authorized user
                    }
                });
            }
        };

        return myObject;
    }
]);
