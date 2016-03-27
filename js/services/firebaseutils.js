myApp.factory('FirebaseUtils', ['$rootScope', "PullListUtils", '$firebaseArray', '$firebaseAuth', 'FIREBASE_URL',
    function($rootScope, PullListUtils, $firebaseArray, $firebaseAuth, FIREBASE_URL) {

        var myObject = {
            addToPullList: function(title) {

                var ref = new Firebase(FIREBASE_URL);
                var auth = $firebaseAuth(ref);

                auth.$onAuth(function(authUser) {
                    if (authUser) {
                        var pullListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/pulllist/');
                        var pullListInfo = $firebaseArray(ref);

                        if (!PullListUtils.isInPullList(title, pullListInfo)) {
                            pullListInfo.$add({
                                name: title
                            }).then(function() {
                                // do something
                            });
                        }
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
