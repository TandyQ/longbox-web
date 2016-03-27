myApp.controller('PullListController', ['$scope', 'Marvel', 'DateUtils', "PullListUtils", "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, Marvel, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        console.log(FIREBASE_URL);
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + $scope.currentUser.$id + '/pulllist/');
                console.log(FIREBASE_URL + 'users/' + $scope.currentUser.$id + '/pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                    $scope.seriesData = [];
                    for (var i = 0; i < data.length; i++) {
                        var series = data[i];
                        $scope.getSeries(series);
                    }
                }).catch(function(error) {
                    console.log(error);
                });

                pullListInfo.$watch(function(data) {
                    // update series list
                });
            } else {
                $rootScope.pullList = {};
            }
        });

        $scope.getSeries = function(series) {
            if (series.resourceURI) {
                Marvel.getSeriesDataForResourceURI(series.resourceURI).then(function(comicData) {
                    if ($scope.seriesData.indexOf(comicData) == -1) {
                        $scope.seriesData.push(comicData);
                        $scope.getLatestComicForSeries(comicData.comics.items[0], $scope.seriesData.indexOf(comicData));
                    }
                });
            }
        };

        $scope.getLatestComicForSeries = function(comic, index) {
            if(comic.resourceURI) {
                Marvel.getComicDataForResourceURI(comic.resourceURI).then(function(comicData) {
                    if($scope.seriesData[index]) {
                        $scope.seriesData[index].latestComicCoverPath = comicData.thumbnail.path;
                        $scope.seriesData[index].latestComicCoverExtension = comicData.thumbnail.extension;
                    }
                    console.log($scope.seriesData[index].latestComicCoverPath);
                    console.log($scope.seriesData[index].latestComicCoverExtension);
                    console.log($scope.seriesData);
                });
            }
        };

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.title, $scope.pullList);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.title) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

    }
]);
