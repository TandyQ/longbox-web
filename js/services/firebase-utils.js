myApp.factory('FirebaseUtils', ['$rootScope', 'Settings', 'PullListUtils', '$firebaseArray', '$firebaseAuth', 'FIREBASE_URL',
    function($rootScope, Settings, PullListUtils, $firebaseArray, $firebaseAuth, FIREBASE_URL) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        var myObject = {
            addToPullList: function(seriesTitle, seriesURI, seriesId) {
                auth.$onAuth(function(authUser) {
                    if (authUser) {
                        var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/' + Settings.getSelectedServicePrefix() + '-pulllist/');
                        var pullListInfo = $firebaseArray(pullListRef);

                        pullListInfo.$loaded().then(function(data) {
                            if (!PullListUtils.isInPullList(seriesTitle, pullListInfo)) {
                                var series = {
                                    name: seriesTitle,
                                    resourceURI: seriesURI
                                };
                                if (seriesId) {
                                    series.id = seriesId;
                                }
                                pullListInfo.$add(series).then(function() {
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
                        var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/' + Settings.getSelectedServicePrefix() + '-pulllist/');
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
