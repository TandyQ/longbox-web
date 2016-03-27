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
                            // handle error
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
                        console.log(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
                        var pullListInfo = $firebaseArray(pullListRef);
                        pullListInfo.$loaded().then(function(data) {
                            var index = pullListInfo.$getRecord(sub.$id);
                            pullListInfo.$remove(index).then(function(ref) {
                                console.log(ref.key() === sub.$id? "Removed":"Not Removed"); // true
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



// var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist');
// var pullListInfo = $firebaseArray(meetingsRef);
// $scope.meetings = meetingsInfo;

// meetingsInfo.$loaded().then(function(data) {
//     $rootScope.howManyMeetings = meetingsInfo.length;
// }); // Make sure meeting data is loaded

// meetingsInfo.$watch(function(data) {
//     $rootScope.howManyMeetings = meetingsInfo.length;
// }); // Update meeting count

// $scope.addMeeting = function() {
//     meetingsInfo.$add({
//         name: $scope.meetingname,
//         date: Firebase.ServerValue.TIMESTAMP,
//     }).then(function() {
//         $scope.meetingname = '';
//     }); // promise
// }; // addMeeting

// $scope.deleteMeeting = function(key) {
//     meetingsInfo.$remove(key);
// };


// myApp.factory('FirebaseUtils', ['$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
//     function($rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
//         var ref = new Firebase(FIREBASE_URL);
//         var auth = $firebaseAuth(ref);

//         auth.$onAuth(function(authUser) {
//             if (authUser) {

//             } // user authenticated
//         }); // on auth
//     }
// ]); // Controller
