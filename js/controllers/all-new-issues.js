myApp.controller('AllNewIssuesController', ['$scope', '$modal', '$sce', 'Settings', 'Marvel', 'ComicVine', 'DateUtils', 'PullListUtils', 'FirebaseUtils', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, $sce, Settings, Marvel, ComicVine, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.isLoading = false;
        $scope.hasComics = true;
        $scope.hasPullList = true;
        $scope.dateDisplayString = "";
        $scope.currentYear = new Date().getFullYear();
        $scope.viewMode = Settings.getViewMode();
        $scope.resultsMessage = "";
        $scope.pullListResultsMessage = "";

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/' + Settings.getSelectedServicePrefix() + '-pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                    if ($scope.pullList.length < 1) {
                        hasPullList = false;
                        $scope.pullListResultsMessage = "No Subscriptions";
                    }
                }).catch(function(error) {
                    console.log(error);
                });
            } else {
                $scope.pullList = {};
            }
        });

        $scope.$watch('weekToShow', function(newValue, oldValue) {
            if (newValue) {
                var newDate = new Date(newValue);
                $scope.dateDisplayString = (DateUtils.getShortMonthName(newDate)) + " " + newDate.getUTCDate() + ", " + newDate.getFullYear();
                loadWeeklyComicsForDay(newDate);
            }
        });

        $scope.moveBackOneWeek = function() {
            var oneWeekAgo = new Date($scope.weekToShow);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            var dateString = oneWeekAgo.toUTCString();
            dateString = dateString.split(' ').slice(0, 4).join(' ');
            dateString = dateString.replace(',', '');
            $scope.weekToShow = dateString;
        };

        $scope.moveForwardOneWeek = function() {
            var oneWeekFromNow = new Date($scope.weekToShow);
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            var dateString = oneWeekFromNow.toUTCString();
            dateString = dateString.split(' ').slice(0, 4).join(' ');
            dateString = dateString.replace(',', '');
            $scope.weekToShow = dateString;
        };

        var loadWeeklyComicsForDay = function(selectedDate) {
            $scope.hasComics = true;
            $scope.isLoading = true;
            var dateRange = DateUtils.getDateRange(selectedDate); // Get first and last day of week
            var selectedService = Settings.getSelectedServicePrefix();
            if (selectedService == 'marvel') {
                Marvel.getComicDataForWeek(dateRange).then(function(data) {
                    if (data !== "Too Many Requests") {
                        $scope.comicData = data;
                        $scope.isLoading = false;
                        if ($scope.comicData.length < 1) {
                            $scope.hasComics = false;
                            $scope.resultsMessage = "No Comics This Week";
                        }
                        for (var i = 0; i < $scope.comicData.length; i++) {
                            if (!$scope.comicData[i].description) {
                                $scope.comicData[i].description = "No description available.";
                            }
                        }
                    } else {
                        $scope.isLoading = false;
                        $scope.hasComics = false;
                        $scope.resultsMessage = "Reached API Limit";
                    }
                });
            } else if (selectedService == 'comic-vine') {
                // WARNING: Comic Vine is not set up to be used with the current Firebase data management
                // scheme. This is only part of an experimental, in-development support for a resource other
                // than Marvel's api. It currently only has the controller layer. No view or model layers
                // are present.

                ComicVine.clearLoadedResults();
                ComicVine.getComicDataForWeek(dateRange).then(function(data) {
                    $scope.comicData = data;
                    if ($scope.comicData.length < 1) {
                        $scope.hasComics = false;
                        $scope.resultsMessage = "No Comics This Week";
                    }
                    $scope.isLoading = false;
                });
            }
        };

        $scope.openModalForComic = function(selectedComic) {
            var modalInstance = $modal.open({
                templateUrl: 'views/comic-detail-view.html',
                controller: 'ComicDetailController',
                resolve: {
                    comic: function() {
                        return selectedComic;
                    },
                    pullList: function() {
                        return $scope.pullList;
                    }
                }
            });
        };

        $scope.onPullListChange = function(series) {
            if ($scope.isInPullList(series)) {
                $scope.removeFromPullList(series);
            } else {
                $scope.addComic(series);
            }
        };

        $scope.addComic = function(series) {
            FirebaseUtils.addToPullList(series.name, series.resourceURI, series.id);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.name) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

        $scope.isInPullList = function(comic) {
            return PullListUtils.isInPullList(comic.series.resourceURI, $scope.pullList);
        };

        $scope.isFirstIssue = function(comic) {
            return (comic.issueNumber === 1);
        };

        $scope.sourceText = function() {
            var sourceText = '';
            var selectedService = Settings.getSelectedServicePrefix();
            if (selectedService == 'marvel') {
                sourceText = 'Data provided by Marvel. &copy; ' + $scope.currentYear + ' Marvel';
            } else if (selectedService == 'comic-vine') {
                sourceText = 'Data provided by <a href="http://comicvine.gamespot.com/">ComicVine</a>';
            }
            return $sce.trustAsHtml(sourceText);
        };
    }
]);
